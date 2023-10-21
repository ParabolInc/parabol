/**
 * Returns the value and index of the maximum element in an array.
 */
export function max(arr: number[]) {
  if (arr.length === 0) throw Error('Array must not be empty')
  let max = arr[0]
  let indexOfMax = 0
  for (let i = 1; i < arr.length; ++i) {
    if (arr[i] > max) {
      max = arr[i]
      indexOfMax = i
    }
  }
  return [max, indexOfMax] as const
}
