/**
 * Renders the shared "code" icon path into build/public app icons.
 * Usage: node scripts/generate-app-icon.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

// Same path as PATHS.code in src/app/shared/components/icon/icon.ts
const CODE_PATH = 'm8 6-6 6 6 6M16 6l6 6-6 6'

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <rect width="128" height="128" rx="28" fill="#0a0e12"/>
  <rect x="8" y="8" width="112" height="112" rx="22" fill="#12181f" stroke="#2a3542" stroke-width="2"/>
  <g transform="translate(20 20) scale(3.6667)" fill="none" stroke="#e8a45c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="${CODE_PATH}"/>
  </g>
</svg>
`

const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <rect width="128" height="128" rx="28" fill="#0a0e12"/>
  <g transform="translate(20 20) scale(3.6667)" fill="none" stroke="#e8a45c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="${CODE_PATH}"/>
  </g>
</svg>
`

function writeIco(pngPath, icoPath) {
  const png = fs.readFileSync(pngPath)
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)

  const entry = Buffer.alloc(16)
  entry[0] = 0
  entry[1] = 0
  entry[2] = 0
  entry[3] = 0
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(6 + 16, 12)

  fs.writeFileSync(icoPath, Buffer.concat([header, entry, png]))
}

const buildDir = path.join(root, 'build')
const publicDir = path.join(root, 'public')
fs.mkdirSync(buildDir, { recursive: true })

fs.writeFileSync(path.join(buildDir, 'icon.svg'), svg)
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg)

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1024 },
}).render().asPng()

const buildPng = path.join(buildDir, 'icon.png')
const publicPng = path.join(publicDir, 'icon.png')
const buildIco = path.join(buildDir, 'icon.ico')

fs.writeFileSync(buildPng, png)
fs.writeFileSync(publicPng, png)
writeIco(buildPng, buildIco)

console.log(`Wrote ${buildPng}`)
console.log(`Wrote ${publicPng}`)
console.log(`Wrote ${buildIco}`)
console.log(`Wrote ${path.join(publicDir, 'favicon.svg')}`)
