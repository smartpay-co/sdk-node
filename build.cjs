const path = require('path');
const esbuild = require('esbuild');
const { dtsPlugin } = require('esbuild-plugin-d.ts');
const textReplace = require('esbuild-plugin-text-replace');
const pkg = require(path.resolve('./package.json'));

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
    outfile: 'build/cjs/index.cjs',
    tsconfig: 'tsconfig-cjs.json',
    external,
    plugins: [
      dtsPlugin({
        tsconfig: 'tsconfig-cjs.json',
      }),
    ],
  })
  .then(() => {
    esbuild.build({
      entryPoints: ['build/cjs/index.cjs'],
      platform: 'node',
      format: 'cjs',
      bundle: true,
      minify: false,
      sourcemap: false,
      target: ['node12'],
      outfile: 'build/cjs/index.cjs',
      allowOverwrite: true,
      plugins: [
        textReplace({
          include: /smartpay/,
          pattern: [[/__buildVersion__/g, pkg.version]],
        }),
      ],
    });
  });
