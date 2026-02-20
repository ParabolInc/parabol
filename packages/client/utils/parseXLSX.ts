import {XMLParser} from 'fast-xml-parser'
import JSZip from 'jszip'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  ignoreDeclaration: true,
  ignorePiTags: true,
  trimValues: false
})

export async function parseXLSX(file: File) {
  const buffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buffer)

  const workbookXml = await zip.file('xl/workbook.xml')!.async('string')
  const workbook = parser.parse(workbookXml)

  const firstSheet = workbook.workbook.sheets.sheet
  const sheet = Array.isArray(firstSheet) ? firstSheet[0] : firstSheet
  const rId = sheet['@_r:id']

  const relsXml = await zip.file('xl/_rels/workbook.xml.rels')!.async('string')

  const rels = parser.parse(relsXml)
  const relationships = rels.Relationships.Relationship
  const rel = relationships.find((r: any) => r['@_Id'] === rId)

  const sheetPath = 'xl/' + rel['@_Target']

  let sharedStrings: string[] = []

  const sharedFile = zip.file('xl/sharedStrings.xml')
  if (sharedFile) {
    const sharedXml = await sharedFile.async('string')
    const shared = parser.parse(sharedXml)

    const si = shared.sst.si
    if (si) {
      const items = Array.isArray(si) ? si : [si]

      sharedStrings = items.map((entry: any) => {
        if (!entry) return ''
        if (entry.t) return entry.t
        if (entry.r) {
          const runs = Array.isArray(entry.r) ? entry.r : [entry.r]
          return runs.map((r: any) => r.t).join('')
        }
        return ''
      })
    }
  }

  const sheetXml = await zip.file(sheetPath)!.async('string')
  const worksheet = parser.parse(sheetXml)

  const rows = worksheet.worksheet.sheetData?.row
  if (!rows) return []

  const rowArray = Array.isArray(rows) ? rows : [rows]

  const data: (string | null)[][] = []

  let columnCount = 0
  for (const row of rowArray) {
    const cells = row.c
    if (!cells) continue

    const cellArray = Array.isArray(cells) ? cells : [cells]
    const record: (string | null)[] = []

    for (const cell of cellArray) {
      const type = cell['@_t']
      let value: any = null

      if (type === 'inlineStr') {
        value = cell.is?.t ?? ''
      } else if (type === 's') {
        value = sharedStrings[Number(cell.v)]
      } else if (type === 'b') {
        value = cell.v === '1' ? 'true' : 'false'
      } else {
        value = cell.v?.toString() ?? null
      }

      record.push(value)
    }

    data.push(record)
    columnCount = Math.max(columnCount, record.length)
  }
  return data
}
