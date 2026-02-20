import {parseCSV} from './parseCSV'
import {parseXLSX} from './parseXLSX'

export const parseDatabaseImport = async (file: File) => {
  if (file.type.includes('text/csv')) {
    return parseCSV(file)
  }
  if (file.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    const data = await parseXLSX(file)
    return data
  }
  throw new Error('Unsupported file type. Please upload a CSV or XLSX file.')
}
