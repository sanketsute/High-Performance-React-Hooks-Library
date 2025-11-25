import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default {
  input: 'src/index.ts', 
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({ 
        useTsconfigDeclarationDir: true 
    }),
    babel({ 
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'] // Add TS extensions here
    })
  ]
};