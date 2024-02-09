function numberVectorToString(vector: number[]) {
  const stringArray = vector.map((num) => num.toString())
  return '[' + stringArray.join(', ') + ']'
}

export default numberVectorToString
