// slices up an array into an array of arrays to make consistent table rows of multiple items (cards, etc.)
const arrayToRows = (arr, rowLength = 3) => {
  const rows = []
  const length = arr.length
  for (let i = 0; i < length; i += rowLength) {
    const subArr = arr.slice(i, i + rowLength)
    rows.push(subArr)
  }
  return rows
}

export default arrayToRows
