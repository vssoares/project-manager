import { context, build } from 'esbuild'

const watch = process.argv.includes('--watch')

const common = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  external: ['electron'],
  sourcemap: true,
  logLevel: 'info',
}

const mainOpts = {
  ...common,
  entryPoints: ['electron/main.ts'],
  outfile: 'dist-electron/main.js',
  format: 'esm',
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" },
}

const preloadOpts = {
  ...common,
  entryPoints: ['electron/preload.ts'],
  outfile: 'dist-electron/preload.cjs',
  format: 'cjs',
}

async function run() {
  if (watch) {
    const mainCtx = await context(mainOpts)
    const preloadCtx = await context(preloadOpts)
    await Promise.all([mainCtx.watch(), preloadCtx.watch()])
    console.log('Watching electron main/preload for changes...')
  } else {
    await build(mainOpts)
    await build(preloadOpts)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
