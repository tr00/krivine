import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

import { Apply, Kind, Lambda, Module, Symbol } from "../src/ast.ts";
import pcc from "../src/pcc.ts";

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
