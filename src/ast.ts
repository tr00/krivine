import { abs } from "../lib/parser.ts";

export enum Kind {
    mod = "mod", // module
    int = "int", // integer
    sym = "sym", // symbol
    abs = "abs", // abstraction
    app = "app", // application
    blk = "blk", // block / scope
    let = "let", // assignment
}

export interface Node {
    nodekind: Kind;
    children: Node[];
    original: string;
}

export class Module implements Node {
    readonly nodekind = Kind.mod;
    readonly children: Node[];
    readonly original = "not yet implemented :[";

    constructor(children: Node[]) {
        this.children = children;
    }
}

export class Integer implements Node {
    readonly nodekind = Kind.int;
    readonly children = [];
    readonly original: string;

    constructor(original: string) {
        this.original = original;
    }

    get value() {
        return parseInt(this.original);
    }
}

export class Symbol implements Node {
    readonly nodekind = Kind.sym;
    readonly children = [];
    readonly original: string;

    constructor(original: string) {
        this.original = original;
    }

    get value() {
        return this.original;
    }
}

export class Lambda implements Node {
    readonly nodekind = Kind.abs;
    readonly children: Node[];
    readonly original = "welp";

    constructor(children: Node[]) {
        this.children = children;
    }

    get body() {
        return this.children[0];
    }

    get args() {
        return this.children.slice(1) as Symbol[];
    }
}

export class Apply implements Node {
    readonly nodekind = Kind.app;
    readonly children: Node[];
    readonly original = "(something is missing)";

    constructor(children: Node[]) {
        this.children = children;
    }

    get func() {
        return this.children[0];
    }

    get args() {
        return this.children.slice(1);
    }
}

export class Block implements Node {
    readonly nodekind = Kind.blk;
    readonly children: Node[];
    readonly original = "{ /* temp */ }";

    constructor(children: Node[]) {
        this.children = children;
    }

    // ...
}

export class Assign implements Node {
    readonly nodekind = Kind.let;
    readonly children: Node[];
    readonly original = "some = thing";

    constructor(children: Node[]) {
        this.children = children;
    }

    get name() {
        return this.children[0] as Symbol;
    }

    get expr() {
        return this.children[1];
    }
}

export class Scope {
    private parent: Scope | undefined;
    private vars: Map<string, Symbol>;

    constructor(parent?: Scope) {
        this.parent = parent;
        this.vars = new Map<string, Symbol>();
    }

    put(sym: Symbol) {
        this.vars.set(sym.value, sym);
    }

    get(sym: Symbol): Node {
        const res = this.vars.get(sym.value);

        if (res) return res;

        if (this.parent !== undefined) {
            return this.parent.get(sym);
        } else {
            throw new Error(`Unresolved Symbol: ${sym.value}`);
        }
    }
}

type Transform<T> = (node: Node, args: T[], scope: Scope) => T;

const core = new Scope();

export function visit<T>(root: Node, transform: Transform<T>) {
    let scope = core;
    let args: T[] = [];

    function _visit(node: Node): T {
        switch (node.nodekind) {
            case Kind.blk:
                scope = new Scope(scope);
                break;
            case Kind.abs:
                scope = new Scope(scope);
                (node as Lambda).args.forEach((arg) => scope.put(arg));
                break;
            case Kind.let:
                scope.put((node as Assign).name);
                break;
        }

        args = node.children.map(_visit);

        return transform(node, args, scope);
    }

    return _visit(root);
}
