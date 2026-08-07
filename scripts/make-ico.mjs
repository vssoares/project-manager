/**
 * Builds a Windows .ico that embeds a PNG (supported since Windows Vista).
 * Usage: node scripts/make-ico.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const pngPath = path.join(root, 'build', 'icon.png')
const icoPath = path.join(root, 'build', 'icon.ico')

const png = fs.readFileSync(pngPath)

// ICONDIR (6) + ICONDIRENTRY (16) + PNG payload
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type: icon
header.writeUInt16LE(1, 4) // count

const entry = Buffer.alloc(16)
entry[0] = 0 // width 0 => 256
entry[1] = 0 // height 0 => 256
entry[2] = 0 // color count
entry[3] = 0 // reserved
entry.writeUInt16LE(1, 4) // planes
entry.writeUInt16LE(32, 6) // bit count
entry.writeUInt32LE(png.length, 8)
entry.writeUInt32LE(6 + 16, 12) // offset to image data

fs.writeFileSync(icoPath, Buffer.concat([header, entry, png]))
console.log(`Wrote ${icoPath} (${png.length} png bytes)`)
