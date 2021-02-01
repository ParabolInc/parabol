import isIsoString from 'parabol-client/utils/isIsoString'

const parseDates = (rows: any[]) => {
  return rows.map(row => {
    const mappedRow = {}
    Object.keys(row).forEach(key => {
      const val = row[key]
      const mappedVal = isIsoString(val) ? new Date(val) : val
      mappedRow[key] = mappedVal
    })
    return mappedRow as typeof rows[0]
  })
}

export default parseDates
