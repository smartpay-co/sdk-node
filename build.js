import esbuild from 'esbuild';
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import pkg from './package.json';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

esbuild.build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  format: 'esm',
  bundle: true,
  minify: false,
  sourcemap: false,
  target: ['node12'],
  outfile: 'build/esm/index.js',
  tsconfig: 'tsconfig.json',
  external,
  plugins: [dtsPlugin()],
});