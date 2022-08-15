const getShuffledArr = <T>(arr: T[]): T[] => {
  const newArr = arr.slice()
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[rand]] = [newArr[rand] as T, newArr[i] as T]
  }
  return newArr
}

export default getShuffledArr
