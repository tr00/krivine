export enum Kind {
    mod = "mod",
    int = "int",
    sym = "sym",
    abs = "abs",
    app = "app",
    blk = "blk",
    let = "let",
}

export type Node =
    | Module
    | Symbol
    | Integer
    | Lambda
    | Apply
    | Block;

export type Module = {
    kind: Kind.mod;
    name: string;
    args: Node[];
    type?: Type;
};

export type Symbol = {
    kind: Kind.sym;
    name: string;
    type?: Type;
};

export type Integer = {
    kind: Kind.int;
    value: number;
    type: Type;
};

export type Lambda = {
    kind: Kind.abs;
    args: Symbol[];
    body: Node;
    type?: Type;
};

export type Apply = {
    kind: Kind.app;
    func: Node;
    args: Node[];
    type?: Type;
};

export type Block = {
    kind: Kind.blk;
    type?: Type;
    args: Node[];
};

export type Assign = {
    kind: Kind.let;
    type?: Type;
    name: string;
    expr: Node;
};

export function createModule(
    { name, args }: { name: string; args: Node[] },
): Module {
    return { kind: Kind.mod, name, args };
}

export function createSymbol({ name }: { name: string }): Symbol {
    return { kind: Kind.sym, name };
}

export function createInteger({ value }: { value: string | number }): Integer {
    if (typeof value == "string") value = parseInt(value);

    return { kind: Kind.int, type: KV_INT_T, value };
}

export function createLambda(
    { args, body }: { args: Symbol[]; body: Node },
): Lambda {
    return { kind: Kind.abs, args, body };
}

export function createApply(
    { func, args }: { func: Node; args: Node[] },
): Apply {
    return { kind: Kind.app, func, args };
}

export function createBlock({ args }: { args: Node[] }): Block {
    return { kind: Kind.blk, args };
}

export function createAssign(
    { name, expr }: { name: string; expr: Node },
): Assign {
    return { kind: Kind.let, name, expr };
}

export function writeSyntaxTreeToFile(ast: Node, file = "res/ast.json") {
    Deno.writeTextFile(file, JSON.stringify(ast));
}

// type system

abstract class Type {
    abstract toTypeDef(name: string): string;
}

export class PrimType extends Type {
    value: string;

    constructor(value: string) {
        super();

        this.value = value;
    }

    toTypeDef(name: string): string {
        return `${this.value} ${name}`;
    }
}

export const KV_INT_T = new PrimType("kv_int_t");
export const KV_ANY_T = new PrimType("kv_any_t");

export class FuncType extends Type {
    ptype: Type[];
    rtype: Type;

    constructor(ptype: Type[], rtype: Type) {
        super();

        this.ptype = ptype;
        this.rtype = rtype;
    }

    toTypeDef(name: string): string {
        const { rtype, ptype } = this;

        return `${rtype} (*${name})(${ptype.join(", ")})`;
    }
}
