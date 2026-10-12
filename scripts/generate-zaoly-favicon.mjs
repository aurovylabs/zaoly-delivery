#!/usr/bin/env node
/**
 * Regenerate Zaoly favicon.ico / apple-touch / desktop icons from the product seal 造.
 * MUST use cobalt tile + cream glyph — never the suite MSQDX five-square geometry.
 *
 * One-shot deps (not committed):
 *   npm install --prefix /tmp/zaoly-icons sharp@0.34 png-to-ico@3 @resvg/resvg-js@2
 * Then: NODE_PATH=/tmp/zaoly-icons/node_modules node scripts/generate-zaoly-favicon.mjs
 *
 * macOS: Hiragino Mincho ProN.ttc for glyph rasterization.
 * Knowledge: knowledge/corporate-design.md · paths.brandAssets
 */
import { writeFileSync, copyFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const repo = join(dirname(fileURLToPath(import.meta.url)), '..')

function load(name) {
  try {
    return require(name)
  } catch {
    console.error(`Missing ${name}. Install under NODE_PATH (see script header).`)
    process.exit(1)
  }
}

const { Resvg } = load('@resvg/resvg-js')
const sharp = load('sharp')
const pngToIco = load('png-to-ico').default || load('png-to-ico')

const FONT =
  process.env.ZAOLY_SEAL_FONT || '/System/Library/Fonts/ヒラギノ明朝 ProN.ttc'

function sealSvg(size) {
  const fs = Math.round(size * 0.68)
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#1F44FF"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="Hiragino Mincho ProN, Noto Serif JP, Songti SC, serif"
    font-size="${fs}" font-weight="600" fill="#F3EEE4">造</text>
</svg>`)
}

function render(size) {
  const resvg = new Resvg(sealSvg(size), {
    fitTo: { mode: 'width', value: size },
    font: { fontFiles: [FONT], loadSystemFonts: true },
  })
  return Buffer.from(resvg.render().asPng())
}

const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" role="img" aria-label="Zaoly">
  <!-- Zaoly product seal 造 — cobalt tile + cream glyph (CD). Not MSQDX suite mark. -->
  <rect width="32" height="32" fill="#1F44FF"/>
  <text x="16" y="17.2" text-anchor="middle" dominant-baseline="middle"
    font-family="Noto Serif JP, Hiragino Mincho ProN, Songti SC, serif"
    font-size="22" font-weight="600" fill="#F3EEE4">造</text>
</svg>
`

const webPublic = join(repo, 'apps/web/public')
const uiPublic = join(repo, 'packages/ui/public')
const brandDir = join(webPublic, 'brand')
mkdirSync(brandDir, { recursive: true })

writeFileSync(join(webPublic, 'favicon.svg'), faviconSvg)
copyFileSync(join(webPublic, 'favicon.svg'), join(uiPublic, 'favicon.svg'))
writeFileSync(join(brandDir, 'zaoly-mark.svg'), faviconSvg)
writeFileSync(join(brandDir, 'zaoly-seal.svg'), faviconSvg)

const ico = await pngToIco([
  await sharp(render(16)).png().toBuffer(),
  await sharp(render(32)).png().toBuffer(),
  await sharp(render(48)).png().toBuffer(),
])
writeFileSync(join(webPublic, 'favicon.ico'), ico)
writeFileSync(join(uiPublic, 'favicon.ico'), ico)
writeFileSync(join(webPublic, 'apple-touch-icon.png'), await sharp(render(180)).png().toBuffer())

const desktopIcons = join(repo, 'apps/desktop/src-tauri/icons')
mkdirSync(desktopIcons, { recursive: true })
for (const [name, size] of [
  ['32x32.png', 32],
  ['128x128.png', 128],
  ['128x128@2x.png', 256],
]) {
  writeFileSync(join(desktopIcons, name), await sharp(render(size)).png().toBuffer())
}
writeFileSync(
  join(desktopIcons, 'icon.ico'),
  await pngToIco([
    await sharp(render(16)).png().toBuffer(),
    await sharp(render(32)).png().toBuffer(),
    await sharp(render(256)).png().toBuffer(),
  ]),
)

const iconset = '/tmp/ZaolySeal.iconset'
mkdirSync(iconset, { recursive: true })
for (const [size, name] of [
  [16, 'icon_16x16.png'],
  [32, 'icon_16x16@2x.png'],
  [32, 'icon_32x32.png'],
  [64, 'icon_32x32@2x.png'],
  [128, 'icon_128x128.png'],
  [256, 'icon_128x128@2x.png'],
  [256, 'icon_256x256.png'],
  [512, 'icon_256x256@2x.png'],
  [512, 'icon_512x512.png'],
  [1024, 'icon_512x512@2x.png'],
]) {
  writeFileSync(join(iconset, name), await sharp(render(size)).png().toBuffer())
}
try {
  execFileSync('iconutil', ['-c', 'icns', iconset, '-o', join(desktopIcons, 'icon.icns')], {
    stdio: 'inherit',
  })
} catch (e) {
  console.warn('iconutil skipped:', e.message)
}

console.log('Updated seal favicons (造 on cobalt) for web, Storybook, desktop')
