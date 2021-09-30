import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/scripts/JsPAPI.js",
  output: {
    name: "JsPAPI",
    dir: "dist",
    format: "umd",
  },
  plugins: [
    nodeResolve({ jsnext: true, preferBuiltins: true, browser: true }),
    commonjs(),
  ],
};
