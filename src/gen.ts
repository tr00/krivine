import { Apply, Integer, Kind, Lambda, Module, Node, Symbol } from "./ast.ts";

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
    return ctx.getsym(sym.name);
}

function compileInteger(
    int: Integer,
    ctx: Context,
    ccu: CompilationUnit,
): string {
    return int.value.toString();
}

function compileLambda(
    abs: Lambda,
    _: Context,
    ccu: CompilationUnit,
): string {
    const ctx = new Context();

    const args = abs.args.map(({ name }) => {
        const sym = ctx.gensym(name);

        ctx.addsym({ key: name, val: sym });

        return `kv_any_t ${sym}`;
    }).join(", ");

    const type = "kv_any_t";
    const body = compile(abs.body, ctx, ccu);
    const name = `kv_abs${ccu.header.length}_f`;

    ccu.emitHeader(`${type} ${name}(${args});`);
    ccu.emitSource(`${type} ${name}(${args}) {\n\treturn ${body};\n}`);

    return name;
}

function compileApply(app: Apply, ctx: Context, ccu: CompilationUnit): string {
    const func = compile(app.func, ctx, ccu);
    const args = app.args
        .map((arg) => compile(arg, ctx, ccu))
        .join(", ");

    return `${func}(${args})`;
}

function compile(node: Node, ctx: Context, ccu: CompilationUnit): string {
    switch (node.kind) {
        case Kind.abs:
            return compileLambda(node, ctx, ccu);
        case Kind.int:
            return compileInteger(node, ctx, ccu);
        case Kind.sym:
            return compileSymbol(node, ctx, ccu);
        case Kind.app:
            return compileApply(node, ctx, ccu);
    }

    throw new Error("this should not have happened");
}

export function gen({ args, name }: Module) {
    const ccu = new CompilationUnit();
    const ctx = new Context();

    args.forEach((arg) => {
        compile(arg, ctx, ccu);
    });

    const header = PROLOG_H(name) + ccu.header.join("\n") + EPILOG_H(name);
    const source = PROLOG_C(name) + ccu.source.join("\n") + EPILOG_C(name);

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
