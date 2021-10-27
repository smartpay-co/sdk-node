import esbuild from 'esbuild';
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import textReplace from 'esbuild-plugin-text-replace';
import pkg from './package.json';

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
    esbuild.build({
      entryPoints: ['build/esm/index.js'],
      platform: 'node',
      format: 'cjs',
      bundle: true,
      minify: false,
      sourcemap: false,
      target: ['node12'],
      outfile: 'build/esm/index.js',
      allowOverwrite: true,
      plugins: [
        textReplace({
          include: /smartpay/,
          pattern: [[/__buildVersion__/g, pkg.version]],
        }),
      ],
    });
  });
