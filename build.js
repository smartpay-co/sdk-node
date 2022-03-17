import esbuild from 'esbuild';
import replace from 'replace-in-file';
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import pkg from './package.json' assert { type: 'json' };

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

esbuild
  .build({
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
  })
  .then(() => {
    replace({
      files: 'build/esm/index.js',
      from: /__buildVersion__/g,
      to: pkg.version,
    });
  });
