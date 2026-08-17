const BASE = ['Время', 'Всего кликов', 'Выбор']

function doPost(e) {
  const body = JSON.parse(e.postData.contents)
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getActiveSheet()
  const headers = ensureHeaders(sheet, Object.keys(body.counts || {}))

  const row = headers.map((h) => {
    if (h === 'Время') return body.ts
    if (h === 'Всего кликов') return body.total
    if (h === 'Выбор') return body.choice || ''
    return (body.counts && body.counts[h]) || 0
  })

  sheet.appendRow(row)
  return ContentService.createTextOutput('ok')
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

function doGet(e) {
  return ContentService.createTextOutput('app is up')
}