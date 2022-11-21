// deno task parser
// tspeg res/grammar.peg lib.parser.ts
import { ASTKinds, parse } from "../lib/parser.ts";
import {
    createApply,
    createInteger,
    createLambda,
    createModule,
    createSymbol,
    Node,
} from "./ast.ts";

export function pcc({ name, data }: { name: string; data: string }) {
    const { ast } = parse(data);

    if (!ast) throw new Error("Syntax Error!");

    return createModule({
        name,
        args: ast.args.map(instantiate),
    });
}

function instantiate(expr: any): Node {
    if (expr.kind === "sym") {
        return createSymbol({ name: expr.value });
    } else if (expr.kind === "int") {
        return createInteger({ value: expr.value });
    } else if (expr.kind === "abs") {
        return createLambda({
            args: expr.args.map(instantiate),
            body: instantiate(expr.body),
        });
    } else if (expr.kind === "app") {
        return createApply({
            func: instantiate(expr.func),
            args: expr.args.map(instantiate),
        });
    }

    throw new Error("don't know how to instantiate this");
}
