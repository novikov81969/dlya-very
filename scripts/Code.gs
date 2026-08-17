const BASE = ['Время', 'Всего кликов', 'Выбор']
const DATA = 'Данные'
const STATS = 'Итоги'
const LOG = 'Журнал'

const HEADER_BG = '#5B2A52'
const HEADER_TXT = '#FFFFFF'
const BAND_1 = '#FDF2F8'
const BAND_2 = '#FFFFFF'
const TITLE_BG = '#3E1F39'
const NUM = 6

const PAGE_PER_ROW = 4
const TILE_H = 4
const TILE_W = 9
const TILE_GAP = 1

function doPost(e) {
  try {
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
    if (Array.isArray(body.buttons) && body.buttons.length) {
      const accMap = buildAccMap(headers, data)
      renderPages(ss, body.buttons, accMap)
    }
    logRow(ss, 'post ok', body.ts)
    return ContentService.createTextOutput('ok')
  } catch (err) {
    logRow(SpreadsheetApp.getActiveSpreadsheet(), 'error: ' + err.message, (e && e.postData && e.postData.contents) || '')
    return ContentService.createTextOutput('error: ' + err.message)
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const sheets = ss.getSheets().map((s) => s.getName() + ':' + s.getLastRow() + 'r')
    let latest = ''
    const data = ss.getSheetByName(DATA)
    if (data && data.getLastRow() > 1) {
      latest = data.getRange(2, 1, Math.min(data.getLastRow() - 1, 3), 6).getValues()
        .map((r) => r.join(' | '))
        .join('\n')
    }
    const log = getSheet(ss, LOG)
    const logRows = log.getLastRow()
    const lastLog = logRows >= 1
      ? log.getRange(1, 1, Math.min(logRows, 8), 2).getValues().map((r) => r.join(' | ')).join('\n')
      : '(пусто)'
    const out = [
      'SPREADSHEET: ' + ss.getName(),
      'URL: ' + ss.getUrl(),
      'SHEETS: ' + sheets.join(', '),
      'DANYE rows: ' + (data ? data.getLastRow() - 1 : -1),
      '----- последние строки Данные -----',
      latest || '(нет данных)',
      '----- Журнал (последние) -----',
      lastLog,
    ].join('\n')
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.TEXT)
  } catch (err) {
    return ContentService.createTextOutput('doGet error: ' + err.message)
  }
}

function buildAccMap(headers, data) {
  const lr = data.getLastRow()
  const values = data.getRange(2, 1, Math.max(lr - 1, 1), data.getLastColumn()).getValues()
  const accMap = {}
  headers.forEach((h, i) => {
    if (BASE.indexOf(h) >= 0) return
    let acc = 0
    values.forEach((r) => {
      acc += +r[i] || 0
    })
    accMap[h] = acc
  })
  return accMap
}

function renderPages(ss, buttons, accMap) {
  const scenes = []
  const byScene = {}
  buttons.forEach((b) => {
    if (!byScene[b.scene]) {
      byScene[b.scene] = []
      scenes.push(b.scene)
    }
    byScene[b.scene].push(b)
  })

  scenes.forEach((scene) => {
const list = byScene[scene]
    const sheet = getSheet(ss, scene)
    sheet.clear()
    var f = sheet.getFilter(); if (f) f.remove()

    const totalCols = PAGE_PER_ROW * (TILE_W + TILE_GAP) - TILE_GAP
    ensureGrid(sheet, totalCols)

    sheet.getRange(1, 1, 1, totalCols).merge()
    sheet.getRange(1, 1)
      .setValue('СТРАНИЦА «' + scene + '»')
      .setBackground(HEADER_BG)
      .setFontColor(HEADER_TXT)
      .setFontSize(15)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setFontFamily('Georgia')
    sheet.setRowHeight(1, 34)

    sheet.getRange(2, 1, 1, totalCols).merge()
    sheet.getRange(2, 1)
      .setValue('количество нажатий за все прохождения')
      .setFontSize(10)
      .setFontColor('#6B5B88')
      .setHorizontalAlignment('center')
    sheet.setRowHeight(2, 18)

    list.forEach((b, k) => {
      const gr = Math.floor(k / PAGE_PER_ROW)
      const gc = k % PAGE_PER_ROW
      const rowStart = 4 + gr * TILE_H
      const colStart = 1 + gc * (TILE_W + TILE_GAP)
      const acc = accMap[b.label] || 0

      const range = sheet.getRange(rowStart, colStart, TILE_H, TILE_W)
      range.merge()
      range
        .setValue(b.icon + ' ' + b.label + '\n× ' + acc)
        .setWrap(true)
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setFontSize(11)

      if (acc > 0) {
        range.setBackground('#FFF0F7').setFontColor('#3E1F39').setFontWeight('bold')
        range.setBorder(true, true, true, true, false, false, '#D8BFD6', SpreadsheetApp.BorderStyle.SOLID)
      } else {
        range.setBackground('#F5F1F7').setFontColor('#B5A8C8').setFontStyle('italic')
        range.setBorder(true, true, true, true, false, false, '#E5DEF2', SpreadsheetApp.BorderStyle.SOLID)
      }

      for (let r = rowStart; r < rowStart + TILE_H; r++) sheet.setRowHeight(r, 20)
    })

    for (let c = 1; c <= totalCols; c++) {
      const isTile = c % (TILE_W + TILE_GAP) !== 0
      sheet.setColumnWidth(c, isTile ? 11 : 2)
    }
  })
}

function logRow(ss, msg, extra) {
  try {
    const log = getSheet(ss, LOG)
    log.appendRow([new Date().toISOString(), String(msg), String(extra || '')])
  } catch (err) {
    /* ignore */
  }
}

function getSheet(ss, name) {
  const s = ss.getSheetByName(name)
  return s || ss.insertSheet(name)
}

function ensureGrid(sheet, minCols) {
  const m = sheet.getMaxColumns()
  if (m < minCols) sheet.insertColumnsAfter(m, minCols - m)
}

function ensureHeaders(sheet, keys) {
  if (sheet.getLastRow() === 0) {
    const headers = BASE.concat(keys.filter((k) => BASE.indexOf(k) === -1))
    ensureGrid(sheet, headers.length)
    sheet.appendRow(headers)
    return headers
  }

  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const missing = keys.filter((k) => headers.indexOf(k) === -1)
  if (missing.length) {
    headers = headers.concat(missing)
    ensureGrid(sheet, headers.length)
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
    sums.push([h, acc])
  })
  sums.sort((a, b) => b[1] - a[1])

  stats.setFrozenRows(1)

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
    const isZero = sItem[1] === 0
    stats.getRange(r, 1).setValue(sItem[0]).setFontSize(12).setBackground(bg)
    stats.getRange(r, 2).setValue(sItem[1]).setNumberFormat('0').setFontWeight(isZero ? 'normal' : 'bold').setHorizontalAlignment('center').setBackground(bg)
    stats.getRange(r, 3).setValue(+(totalClicks ? (sItem[1] / totalClicks) * 100 : 0).toFixed(1)).setNumberFormat('0.0"%"').setHorizontalAlignment('center').setBackground(bg)
    stats.setRowHeight(r, 24)
    if (isZero) {
      stats.getRange(r, 1, 1, 3).setFontColor('#B5A8C8').setFontStyle('italic')
      stats.getRange(r, 2).setFontColor('#C9BED9')
      stats.getRange(r, 3).setFontColor('#C9BED9')
    }
  })

  stats.setColumnWidth(1, 250)
  stats.setColumnWidth(2, 90)
  stats.setColumnWidth(3, 90)
  for (let c = 4; c <= NUM; c++) stats.setColumnWidth(c, 15)
}