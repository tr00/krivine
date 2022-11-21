import { gen } from "./gen.ts";
import { pcc } from "./pcc.ts";

if (Deno.args.length < 1) throw new Error("expected source file");

const file = Deno.args[0];

const src = await Deno.readTextFile(file);

// const src = "(x w b) => (x b (x x w))";

const ast = pcc({ name: "unknown", data: src });

gen(ast);
