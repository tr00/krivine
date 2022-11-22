export enum Kind {
    mod = "mod",
    int = "int",
    sym = "sym",
    abs = "abs",
    app = "app",
    blk = "blk",
    let = "let",
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

    readonly value = () => parseInt(this.original);
}

export class Symbol implements Node {
    readonly nodekind = Kind.sym;
    readonly children = [];
    readonly original: string;

    constructor(original: string) {
        this.original = original;
    }

    readonly value = () => this.original;
}

export class Lambda implements Node {
    readonly nodekind = Kind.abs;
    readonly children: Node[];
    readonly original = "welp";

    constructor(children: Node[]) {
        this.children = children;
    }

    readonly body = () => this.children[0];
    readonly args = () => this.children.slice(1) as Symbol[];
}

export class Apply implements Node {
    readonly nodekind = Kind.app;
    readonly children: Node[];
    readonly original = "(something is missing)";

    constructor(children: Node[]) {
        this.children = children;
    }

    readonly func = () => this.children[0];
    readonly args = () => this.children.slice(1);
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

    readonly name = () => this.children[0]; // as Symbol
    readonly expr = () => this.children[1];
}
