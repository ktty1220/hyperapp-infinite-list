import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: './src/index.js',
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
    buble({ jsx: 'h' }),
    uglify()
  ],
  watch: {
    exclude: [ 'node_modules/**' ],
    clearScreen: false
  }
};
