import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "./dist/src/index.js",
  output: {
    file: "./dist/app.mjs",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    typescript(),
    terser(),
    json(),
    commonjs({
      sourceMap: false,
    }),
    nodeResolve(),
  ],
  external: ["@hono/node-server", "dotenv", "hono", "mariadb"],
};
