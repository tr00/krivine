import { Apply, Integer, Kind, Lambda, Node, Symbol } from "./ast.ts";

class CompilationUnit {
    header: string[] = [];
    source: string[] = [];

    emitSource(str: string) {
        this.source.push(str);
    }

    emitHeader(str: string) {
        this.header.push(str);
    }
}

class Context {
    map: Map<string, string>;

    constructor() {
        this.map = new Map<string, string>();
    }

    getsym(key: string): string {
        const val = this.map.get(key);

        if (val === undefined) {
            throw new Error("unresolved symbol");
        }

        return val;
    }

    gensym(key = "var"): string {
        if (this.map.has(key)) {
            return key + this.map.size.toString();
        } else {
            return key;
        }
    }

    addsym({ key, val }: { key: string; val: string }) {
        this.map.set(key, val);
    }
}

function compileSymbol(
    sym: Symbol,
    ctx: Context,
    ccu: CompilationUnit,
): string {
    return ctx.getsym(sym.value());
}

function compileInteger(
    int: Integer,
    ctx: Context,
    ccu: CompilationUnit,
): string {
    return int.value().toString();
}

function compileLambda(
    abs: Lambda,
    ctx: Context,
    ccu: CompilationUnit,
): string {
    ctx = new Context();

    const args = abs.args().map((sym: Symbol) => {
        const key = sym.value();
        const val = ctx.gensym(key);

        ctx.addsym({ key, val });

        return `kv_any_t ${val}`;
    }).join(", ");

    console.log(ctx);

    const type = "kv_any_t";
    const body = compile(abs.body(), ctx, ccu);
    const name = `kv_abs${ccu.header.length}_f`;

    ccu.emitHeader(`${type} ${name}(${args});`);
    ccu.emitSource(`${type} ${name}(${args}) {\n\treturn ${body};\n}`);

    return name;
}

function compileApply(
    app: Apply,
    ctx: Context,
    ccu: CompilationUnit,
): string {
    const func = compile(app.func(), ctx, ccu);
    const args = app.args()
        .map((arg) => compile(arg, ctx, ccu))
        .join(", ");

    return `${func}(${args})`;
}

// function compileModule() {}

function compile(
    node: Node,
    ctx: Context,
    ccu: CompilationUnit,
): string {
    switch (node.nodekind) {
        case Kind.abs:
            return compileLambda(node as Lambda, ctx, ccu);
        case Kind.int:
            return compileInteger(node as Integer, ctx, ccu);
        case Kind.sym:
            return compileSymbol(node as Symbol, ctx, ccu);
        case Kind.app:
            return compileApply(node as Apply, ctx, ccu);
    }

    throw new Error("this should not have happened");
}

export default function gen(root: Node, name: string) {
    const ccu = new CompilationUnit();
    const ctx = new Context();

    if (root.nodekind !== Kind.mod) throw new Error("expected module");

    root.children.forEach((arg) => {
        compile(arg, ctx, ccu);
    });

    const header = PROLOG_H(name) + ccu.header.join("\n") + EPILOG_H(name);
    const source = PROLOG_C(name) + ccu.source.join("\n") + EPILOG_C(name);

    Deno.mkdir("out", { recursive: true });

    Deno.writeTextFile(`out/${name}.c`, source);
    Deno.writeTextFile(`out/${name}.h`, header);
}

const PROLOG_H = (name: string) =>
    `// auto generated
#ifndef __${name.toUpperCase()}_H_
#define __${name.toUpperCase()}_H_

typedef void *kv_any_t;

`;

const EPILOG_H = (name: string) => `

#endif // __${name.toUpperCase()}_H_
`;

const PROLOG_C = (name: string) => `#include "${name}.h"\n\n`;
const EPILOG_C = (name: string) => "";
