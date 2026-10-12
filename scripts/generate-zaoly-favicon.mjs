#!/usr/bin/env node
/**
 * Regenerate Zaoly favicon.ico, apple-touch-icon, Storybook + desktop icons
 * from apps/web/public/favicon.svg / brand mark geometry.
 *
 * One-shot deps (not committed):
 *   npm install --prefix /tmp/zaoly-icons sharp@0.34 png-to-ico@3 @resvg/resvg-js@2
 * Then NODE_PATH=/tmp/zaoly-icons/node_modules node scripts/generate-zaoly-favicon.mjs
 *
 * Knowledge: knowledge/corporate-design.md · paths.brandAssets
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs'
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

const faviconSvg = readFileSync(join(repo, 'apps/web/public/favicon.svg'))

function renderSvg(svgBuffer, size) {
  const resvg = new Resvg(svgBuffer, { fitTo: { mode: 'width', value: size } })
  return Buffer.from(resvg.render().asPng())
}

function markTileSvg(size, padRatio = 0.14) {
  const pad = Math.round(size * padRatio)
  const inner = size - pad * 2
  const scale = inner / 145
  const w = 143 * scale
  const h = 145 * scale
  const x = (size - w) / 2
  const y = (size - h) / 2
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#F3EEE4"/>
  <g transform="translate(${x} ${y}) scale(${scale})">
    <path fill="#1F44FF" d="M32.5825 0H7.74219C3.46629 0 0 3.51478 0 7.85047V33.0382C0 37.3739 3.46629 40.8887 7.74219 40.8887H32.5825C36.8584 40.8887 40.3247 37.3739 40.3247 33.0382V7.85047C40.3247 3.51478 36.8584 0 32.5825 0Z"/>
    <path fill="#1F44FF" d="M133.855 0H104.395C99.3421 0 95.2501 4.14926 95.2501 9.27252V36.8953C95.2501 43.1873 90.2167 48.2911 84.0114 48.2911H56.7697C51.7171 48.2911 47.625 52.4404 47.625 57.5636V85.1864C47.625 91.4785 42.5917 96.5823 36.3864 96.5823H9.14462C4.09203 96.5823 0 100.732 0 105.855V135.727C0 140.851 4.09203 145 9.14462 145H38.6053C43.6579 145 47.7499 140.851 47.7499 135.727V108.105C47.7499 101.813 52.7833 96.7089 58.9886 96.7089H86.2303C91.2829 96.7089 95.3749 92.5596 95.3749 87.4363V59.8136C95.3749 53.5215 100.408 48.4177 106.614 48.4177H133.855C138.908 48.4177 143 44.2685 143 39.1452V9.27252C143 4.14926 138.908 0 133.855 0Z"/>
    <path fill="#1F44FF" d="M133.827 96.5627H104.404C99.338 96.5627 95.231 100.727 95.231 105.864V135.698C95.231 140.835 99.338 145 104.404 145H133.827C138.893 145 143 140.835 143 135.698V105.864C143 100.727 138.893 96.5627 133.827 96.5627Z"/>
  </g>
</svg>`)
}

const png16 = await sharp(renderSvg(faviconSvg, 16)).png().toBuffer()
const png32 = await sharp(renderSvg(faviconSvg, 32)).png().toBuffer()
const png48 = await sharp(renderSvg(faviconSvg, 48)).png().toBuffer()
const ico = await pngToIco([png16, png32, png48])

const webPublic = join(repo, 'apps/web/public')
const uiPublic = join(repo, 'packages/ui/public')
writeFileSync(join(webPublic, 'favicon.ico'), ico)
writeFileSync(join(uiPublic, 'favicon.ico'), ico)
copyFileSync(join(webPublic, 'favicon.svg'), join(uiPublic, 'favicon.svg'))
writeFileSync(
  join(webPublic, 'apple-touch-icon.png'),
  await sharp(renderSvg(markTileSvg(180), 180)).png().toBuffer(),
)

const desktopIcons = join(repo, 'apps/desktop/src-tauri/icons')
mkdirSync(desktopIcons, { recursive: true })
for (const [name, size] of [
  ['32x32.png', 32],
  ['128x128.png', 128],
  ['128x128@2x.png', 256],
]) {
  writeFileSync(join(desktopIcons, name), await sharp(renderSvg(markTileSvg(size), size)).png().toBuffer())
}
writeFileSync(
  join(desktopIcons, 'icon.ico'),
  await pngToIco([
    await sharp(renderSvg(markTileSvg(16), 16)).png().toBuffer(),
    await sharp(renderSvg(markTileSvg(32), 32)).png().toBuffer(),
    await sharp(renderSvg(markTileSvg(256), 256)).png().toBuffer(),
  ]),
)

const iconset = join('/tmp', 'Zaoly.iconset')
mkdirSync(iconset, { recursive: true })
const icnsSizes = [
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
]
for (const [size, name] of icnsSizes) {
  writeFileSync(join(iconset, name), await sharp(renderSvg(markTileSvg(size), size)).png().toBuffer())
}
try {
  execFileSync('iconutil', ['-c', 'icns', iconset, '-o', join(desktopIcons, 'icon.icns')], {
    stdio: 'inherit',
  })
} catch (e) {
  console.warn('iconutil skipped:', e.message)
}

console.log('Updated favicon.ico, favicon.svg, apple-touch-icon, packages/ui/public, desktop icons')
