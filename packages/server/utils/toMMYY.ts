const toMMYY = (month: string | number, year: string | number): string => {
  const monthStr = String(month).length === 1 ? `0${month}` : month
  const yearStr = String(year).slice(-2)
  return `${monthStr}/${yearStr}`
}

export default toMMYY
