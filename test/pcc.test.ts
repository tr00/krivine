import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

import { Apply, Integer, Kind, Lambda, Module, Symbol } from "../src/ast.ts";
import pcc from "../src/pcc.ts";

Deno.test("testing pcc: example_symbol_1", () => {
    const src = "example_symbol_1";
    const res = pcc({ name: "test", data: src });

    assertEquals(
        new Module([
            new Symbol("example_symbol_1"),
        ]),
        res,
    );
});

Deno.test("testing pcc: 1337", () => {
    const src = "1337";
    const res = pcc({ name: "test", data: src });

    assertEquals(
        new Module([
            new Integer("1337"),
        ]),
        res,
    );
});

Deno.test("testing pcc: (x) => x", () => {
    const src = "(x) => x";
    const res = pcc({ name: "test", data: src });

    assertEquals(
        new Module([
            new Lambda([
                new Symbol("x"),
                new Symbol("x"),
            ]),
        ]),
        res,
    );
});

Deno.test("testing pcc: (x) => (x)", () => {
    const src = "(x) => (x)";
    const res = pcc({ name: "test", data: src });

    assertEquals(
        new Module([
            new Lambda([
                new Apply([new Symbol("x")]),
                new Symbol("x"),
            ]),
        ]),
        res,
    );
});

Deno.test("testing pcc: (a b c)", () => {
    const src = "(a b c)";
    const res = pcc({ name: "test", data: src });

    assertEquals(
        new Module([
            new Apply([
                new Symbol("a"),
                new Symbol("b"),
                new Symbol("c"),
            ]),
        ]),
        res,
    );
});

Deno.test("testing pcc: (a (b c) d)", () => {
    const src = "(a (b c) d)";
    const res = pcc({ name: "test", data: src });

    assertEquals(
        new Module([
            new Apply([
                new Symbol("a"),
                new Apply([
                    new Symbol("b"),
                    new Symbol("c"),
                ]),
                new Symbol("d"),
            ]),
        ]),
        res,
    );
});
