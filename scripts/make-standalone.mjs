import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const indexHtml = readFileSync(join(dist, 'index.html'), 'utf8')

const cssMatch = indexHtml.match(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/)
const jsMatch = indexHtml.match(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/)

if (!cssMatch || !jsMatch) {
  console.error('Не нашёл css/js ассеты в dist/index.html')
  process.exit(1)
}

const css = readFileSync(join(dist, cssMatch[1]), 'utf8')
let js = readFileSync(join(dist, jsMatch[1]), 'utf8')
js = js.replace(/<\/script>/gi, '<\\/script>')

const inline =
  indexHtml.replace(cssMatch[0], `<style>${css}</style>`).replace(jsMatch[0], `<script type="module">${js}<\/script>`)

const out = join(root, 'Вера.html')
writeFileSync(out, inline, 'utf8')
console.log('OK ->', out, `(${(inline.length / 1024).toFixed(1)} KB)`)