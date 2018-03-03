import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: './src/main.js',
  output: {
    file: './public/static/main.js',
    format: 'umd',
    name: 'game'
  },
  plugins: [
    resolve({
      browser: true,
      jsnext: true,
      main: true
    }),
    commonjs()
  ]
};
