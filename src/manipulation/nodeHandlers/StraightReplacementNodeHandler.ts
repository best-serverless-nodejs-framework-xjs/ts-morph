﻿import { Node } from "../../compiler";
import * as errors from "../../errors";
import { CompilerFactory } from "../../factories";
import { ts } from "../../typescript";
import { ArrayUtils, getSyntaxKindName } from "../../utils";
import { NodeHandler } from "./NodeHandler";
import { NodeHandlerHelper } from "./NodeHandlerHelper";

/**
 * Replacement handler for replacing parts of the tree that should be equal.
 */
export class StraightReplacementNodeHandler implements NodeHandler {
    private readonly helper: NodeHandlerHelper;

    constructor(private readonly compilerFactory: CompilerFactory) {
        this.helper = new NodeHandlerHelper(compilerFactory);
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.kind)
            throw new errors.InvalidOperationError(`Error replacing tree! Perhaps a syntax error was inserted ` +
                `(Current: ${currentNode.getKindName()} -- New: ${getSyntaxKindName(newNode.kind)}).`);

        if (currentNode._hasWrappedChildren())
            this.handleChildren(currentNode, newNode, newSourceFile);

        this.compilerFactory.replaceCompilerNode(currentNode, newNode);
    }

    private handleChildren(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        const [currentNodeChildren, newNodeChildrenArray] = this.helper.getChildrenFast(currentNode, newNode, newSourceFile);
        const newNodeChildren = ArrayUtils.toIterator(newNodeChildrenArray);

        for (const currentNodeChild of currentNodeChildren)
            this.helper.handleForValues(this, currentNodeChild, newNodeChildren.next().value, newSourceFile);

        /* istanbul ignore if */
        if (!newNodeChildren.next().done)
            throw new Error("Error replacing tree: Should not have new children left over.");
    }
}
