export const getPageFileType = (file: File, nested: boolean) => {
  if (file.type.startsWith('image/')) return 'image'
  if (nested) return 'file'
  if (file.type.includes('text/csv')) return 'csv'
  if (file.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
    return 'xlsx'
  return 'file'
}
