const path = require('path');
const { dtsPlugin } = require('esbuild-plugin-d.ts');
const pkg = require(path.resolve('./package.json'));

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

require('esbuild').build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  format: 'cjs',
  bundle: true,
  minify: false,
  sourcemap: false,
  target: ['node12'],
  outfile: 'build/cjs/index.cjs',
  tsconfig: 'tsconfig-cjs.json',
  external,
  plugins: [dtsPlugin()],
});
