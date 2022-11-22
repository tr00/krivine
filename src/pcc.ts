// deno task parser
// tspeg res/grammar.peg lib.parser.ts
import { parse } from "../lib/parser.ts";
import { Apply, Integer, Kind, Lambda, Module, Node, Symbol } from "./ast.ts";

export default function pcc({ name, data }: { name: string; data: string }) {
    const { ast } = parse(data);

    if (!ast) throw new Error("Syntax Error!");

    return new Module(ast.args.map(instantiate));
}

function instantiate(expr: any): Node {
    switch (expr.kind) {
        case "sym":
            return new Symbol(expr.value);
        case "int":
            return new Integer(expr.value);
        case "abs":
            return new Lambda(expr.args.map(instantiate));
        case "app":
            return new Apply(expr.args.map(instantiate));
    }

    throw new Error("don't know how to instantiate this");
}
