import * as ts from "typescript";
import * as errors from "./../../errors";
import * as structures from "./../../structures";
import {Node} from "./../common";
import * as classes from "./../class";
import * as enums from "./../enum";
import * as functions from "./../function";
import * as interfaces from "./../interface";
import * as namespaces from "./../namespace";
import * as types from "./../type";
import * as variable from "./../variable";

export type StatementedNodeExtensionType = Node<ts.SourceFile | ts.FunctionDeclaration | ts.ModuleDeclaration | ts.FunctionLikeDeclaration>;

export interface StatementedNode {
    getBody(): Node<ts.Node>;
    addEnumDeclaration(structure: structures.EnumStructure): enums.EnumDeclaration;
    getClasses(): classes.ClassDeclaration[];
    getEnums(): enums.EnumDeclaration[];
    getFunctions(): functions.FunctionDeclaration[];
    getInterfaces(): interfaces.InterfaceDeclaration[];
    getNamespaces(): namespaces.NamespaceDeclaration[];
    getTypeAliases(): types.TypeAliasDeclaration[];
    getVariableStatements(): variable.VariableStatement[];
    getVariableDeclarationLists(): variable.VariableDeclarationList[];
    getVariableDeclarations(): variable.VariableDeclaration[];
}

export function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T {
    return class extends Base implements StatementedNode {
        /**
         * Gets the body node or returns the source file if a source file.
         */
        getBody(): Node<ts.Node> {
            /* istanbul ignore else */
            if (this.isSourceFile())
                return this;
            else if (this.isNamespaceDeclaration())
                return this.factory.getNodeFromCompilerNode(this.node.body);
            else if (this.isFunctionDeclaration()) {
                /* istanbul ignore if */
                if (this.node.body == null)
                    throw new errors.NotImplementedError("Function declaration has no body.");

                return this.factory.getNodeFromCompilerNode(this.node.body);
            }
            else
                throw this.getNotImplementedError();
        }

        /**
         * @internal
         */
        getInsertPosition() {
            if (this.isSourceFile())
                return this.getEnd();
            else
                return this.getBody().getEnd() - 1;
        }

        /**
         * Adds an enum declaration as a child.
         * @param structure - Structure of the enum declaration to add.
         */
        addEnumDeclaration(structure: structures.EnumStructure): enums.EnumDeclaration {
            const sourceFile = this.getRequiredSourceFile();
            const newLineChar = this.factory.getLanguageService().getNewLine();
            const indentationText = this.getChildIndentationText(sourceFile);
            this.appendNewLineSeparatorIfNecessary(sourceFile);
            const text = `${indentationText}enum ${structure.name} {${newLineChar}${indentationText}}${newLineChar}`;
            sourceFile.insertText(this.getInsertPosition(), text);

            const enumDeclarations = this.getEnums();
            const declaration = enumDeclarations[enumDeclarations.length - 1];
            for (let member of structure.members || []) {
                declaration.addMember(member);
            }
            return declaration;
        }

        /**
         * Gets the direct class declaration children.
         */
        getClasses(): classes.ClassDeclaration[] {
            return this.getMainChildrenOfKind<classes.ClassDeclaration>(ts.SyntaxKind.ClassDeclaration);
        }

        /**
         * Gets the direct enum declaration children.
         */
        getEnums(): enums.EnumDeclaration[] {
            return this.getMainChildrenOfKind<enums.EnumDeclaration>(ts.SyntaxKind.EnumDeclaration);
        }

        /**
         * Gets the direct function declaration children.
         */
        getFunctions(): functions.FunctionDeclaration[] {
            return this.getMainChildrenOfKind<functions.FunctionDeclaration>(ts.SyntaxKind.FunctionDeclaration);
        }

        /**
         * Gets the direct interface declaration children.
         */
        getInterfaces(): interfaces.InterfaceDeclaration[] {
            return this.getMainChildrenOfKind<interfaces.InterfaceDeclaration>(ts.SyntaxKind.InterfaceDeclaration);
        }

        /**
         * Gets the direct namespace declaration children.
         */
        getNamespaces(): namespaces.NamespaceDeclaration[] {
            return this.getMainChildrenOfKind<namespaces.NamespaceDeclaration>(ts.SyntaxKind.ModuleDeclaration);
        }

        /**
         * Gets the direct type alias declaration children.
         */
        getTypeAliases(): types.TypeAliasDeclaration[] {
            return this.getMainChildrenOfKind<types.TypeAliasDeclaration>(ts.SyntaxKind.TypeAliasDeclaration);
        }

        /**
         * Gets the direct variable statement children.
         */
        getVariableStatements(): variable.VariableStatement[] {
            return this.getMainChildrenOfKind<variable.VariableStatement>(ts.SyntaxKind.VariableStatement);
        }

        /**
         * Gets the variable declaration lists of the direct variable statement children.
         */
        getVariableDeclarationLists(): variable.VariableDeclarationList[] {
            return this.getVariableStatements().map(s => s.getDeclarationList());
        }

        /**
         * Gets all the variable declarations within all the variable declarations of the direct variable statement children.
         */
        getVariableDeclarations(): variable.VariableDeclaration[] {
            const variables: variable.VariableDeclaration[] = [];

            for (let list of this.getVariableDeclarationLists()) {
                variables.push(...list.getDeclarations());
            }

            return variables;
        }
    };
}