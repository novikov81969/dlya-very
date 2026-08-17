const BASE = ['Время', 'Всего кликов', 'Выбор']
const DATA = 'Данные'
const STATS = 'Итоги'

const HEADER_BG = '#5B2A52'
const HEADER_TXT = '#FFFFFF'
const BAND_1 = '#FDF2F8'
const BAND_2 = '#FFFFFF'
const TITLE_BG = '#3E1F39'
const NUM = 6

function doPost(e) {
  const body = JSON.parse(e.postData.contents)
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const data = getSheet(ss, DATA)
  const headers = ensureHeaders(data, Object.keys(body.counts || {}))

  const row = headers.map((h) => {
    if (h === 'Время') return body.ts
    if (h === 'Всего кликов') return body.total
    if (h === 'Выбор') return body.choice || ''
    return (body.counts && body.counts[h]) || 0
  })

  data.appendRow(row)
  styleData(data)
  refreshStats(ss)
  return ContentService.createTextOutput('ok')
}

function doGet() {
  return ContentService.createTextOutput('app is up')
}

function getSheet(ss, name) {
  const s = ss.getSheetByName(name)
  return s || ss.insertSheet(name)
}

function ensureHeaders(sheet, keys) {
  if (sheet.getLastRow() === 0) {
    const headers = BASE.concat(keys.filter((k) => BASE.indexOf(k) === -1))
    sheet.appendRow(headers)
    return headers
  }

  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const missing = keys.filter((k) => headers.indexOf(k) === -1)
  if (missing.length) {
    headers = headers.concat(missing)
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  }
  return headers
}

function styleData(data) {
  const lr = data.getLastRow()
  const lc = data.getLastColumn()
  if (lr < 1 || lc < 1) return

  const headers = data.getRange(1, 1, 1, lc).getValues()[0]

  data.getRange(1, 1, 1, lc)
    .setBackground(HEADER_BG)
    .setFontColor(HEADER_TXT)
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
  data.setRowHeight(1, 32)
  data.setFrozenRows(1)
  data.setFrozenColumns(1)

  headers.forEach((h, i) => {
    if (h !== 'Время' && h !== 'Выбор') {
      data.getRange(2, i + 1, Math.max(lr - 1, 1), 1)
        .setHorizontalAlignment('center')
        .setNumberFormat('0')
    }
  })

  if (lr >= 2) {
    const band = data.getBandings()
    if (band.length) band.forEach((b) => b.remove())
    data.getRange(2, 1, lr - 1, lc).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY)
  }

  data.setColumnWidth(1, 150)
  const choiceCol = headers.indexOf('Выбор') + 1
  if (choiceCol > 0) data.setColumnWidth(choiceCol, 190)
  data.autoResizeColumns(2, Math.max(lc - 1, 1))

  if (data.getFilter()) data.getFilter().remove()
  data.getRange(1, 1, lr, lc).createFilter()
}

function refreshStats(ss) {
  const data = ss.getSheetByName(DATA)
  const stats = getSheet(ss, STATS)
  stats.clear()
  stats.setFrozenRows(0)

  const lr = data.getLastRow()
  if (lr < 2) {
    stats.getRange(1, 1, 1, NUM).merge()
    stats.getRange(1, 1)
      .setValue('Пока нет данных о прохождениях ❤')
      .setFontSize(16)
      .setHorizontalAlignment('center')
    return
  }

  const headers = data.getRange(1, 1, 1, data.getLastColumn()).getValues()[0]
  const values = data.getRange(2, 1, lr - 1, data.getLastColumn()).getValues()
  const n = values.length

  const ciTotal = headers.indexOf('Всего кликов')
  const ciChoice = headers.indexOf('Выбор')
  const totalClicks = values.reduce((s, r) => s + (+r[ciTotal] || 0), 0)
  const avg = Math.round(totalClicks / n)
  const lastChoice = ciChoice >= 0 ? String(values[n - 1][ciChoice] || '—') : '—'

  const sums = []
  headers.forEach((h, i) => {
    if (BASE.indexOf(h) >= 0) return
    let acc = 0
    values.forEach((r) => {
      acc += +r[i] || 0
    })
    if (acc > 0) sums.push([h, acc])
  })
  sums.sort((a, b) => b[1] - a[1])

  stats.setFrozenRows(1)

  // title
  stats.getRange(1, 1, 1, NUM).merge()
  stats.getRange(1, 1)
    .setValue('ИТОГО ПО ВСЕМ ПРОХОЖДЕНИЯМ ❤️')
    .setBackground(TITLE_BG)
    .setFontColor(HEADER_TXT)
    .setFontSize(16)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontFamily('Georgia')
  stats.setRowHeight(1, 36)

  // meta rows
  const meta = [
    ['Всего прохождений', n],
    ['Всего кликов за всё время', totalClicks],
    ['Кликов в среднем за прохождение', avg],
    ['Последний выбор', lastChoice],
  ]
  meta.forEach((pair, i) => {
    const r = 2 + i
    const bg = i % 2 === 0 ? BAND_1 : BAND_2
    stats.getRange(r, 1).setValue(pair[0]).setFontWeight('bold').setFontSize(12).setBackground(bg)
    stats.getRange(r, 2, 1, NUM - 1).merge()
    const v = stats.getRange(r, 2).setValue(pair[1]).setFontSize(13).setHorizontalAlignment('left').setBackground(bg)
    if (pair[0] === 'Последний выбор') v.setFontStyle('italic').setFontColor('#7A2E62').setFontSize(14)
    stats.setRowHeight(r, 26)
  })

  // buttons table title
  const br = 7
  stats.getRange(br, 1, 1, NUM).merge()
  stats.getRange(br, 1)
    .setValue('НАЖАТИЯ ПО КНОПКАМ ✨')
    .setBackground(HEADER_BG)
    .setFontColor(HEADER_TXT)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
  stats.setRowHeight(br, 26)

  const hdr = br + 1
  stats.getRange(hdr, 1, 1, 3).setValues([['Кнопка', 'Нажатий', 'Доля']])
  stats.getRange(hdr, 1, 1, 3)
    .setBackground('#7A2E62')
    .setFontColor(HEADER_TXT)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
  stats.setRowHeight(hdr, 24)

  sums.forEach((sItem, i) => {
    const r = hdr + 1 + i
    const bg = i % 2 === 0 ? BAND_1 : BAND_2
    stats.getRange(r, 1).setValue(sItem[0]).setFontSize(12).setBackground(bg)
    stats.getRange(r, 2).setValue(sItem[1]).setNumberFormat('0').setFontWeight('bold').setHorizontalAlignment('center').setBackground(bg)
    stats.getRange(r, 3).setValue(+(totalClicks ? (sItem[1] / totalClicks) * 100 : 0).toFixed(1)).setNumberFormat('0.0"%"').setHorizontalAlignment('center').setBackground(bg)
    stats.setRowHeight(r, 24)
  })

  stats.setColumnWidth(1, 250)
  stats.setColumnWidth(2, 90)
  stats.setColumnWidth(3, 90)
  for (let c = 4; c <= NUM; c++) stats.setColumnWidth(c, 15)
}