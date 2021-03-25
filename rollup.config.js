import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/scripts/PAPI.js',
  output: {
    dir: 'dist',
    format: 'iife',
  },
  plugins: [
    nodeResolve(),
  ],
};
