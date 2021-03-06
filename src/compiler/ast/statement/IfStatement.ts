import { ts } from "../../../typescript";
import { ChildOrderableNode } from "../base";
import { Expression } from "../expression";
import { Statement } from "./Statement";

export const IfStatementBase = ChildOrderableNode(Statement);
export class IfStatement extends IfStatementBase<ts.IfStatement> {
    /**
     * Gets this if statement's expression.
     */
    getExpression(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.expression);
    }

    /**
     * Gets this if statement's then statement.
     */
    getThenStatement(): Statement {
        return this._getNodeFromCompilerNode(this.compilerNode.thenStatement);
    }

    /**
     * Gets this if statement's else statement.
     */
    getElseStatement(): Statement | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.elseStatement);
    }
}
