const HEADERS = ['Время', 'Сцена', 'Пункт', 'Кол-во', 'Всего кликов', 'Выбор']

function doPost(e) {
  const body = JSON.parse(e.postData.contents)
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getActiveSheet()

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
  }

  const rows = body.rows || []
  for (const r of rows) {
    sheet.appendRow([body.ts, r.scene, r.item, r.count, body.total, body.choice || ''])
  }

  return ContentService.createTextOutput('ok')
}

function doGet(e) {
  return ContentService.createTextOutput('app is up')
}