import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: './src/index.jsx',
  output: {
    file: './dist/hyperapp-infinite-list.js',
    format: 'umd',
    name: 'hyperappInfiniteList',
    sourcemap: true,
    globals: {
      hyperapp: 'hyperapp'
    }
  },
  plugins: [
    resolve(),
    commonjs(),
    buble({
      jsx: 'h',
      objectAssign: 'Object.assign'
    }),
    uglify()
  ],
  watch: {
    exclude: [ 'node_modules/**' ],
    clearScreen: false
  }
};
