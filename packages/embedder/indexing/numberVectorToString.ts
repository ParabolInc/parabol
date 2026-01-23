export function numberVectorToString(vector: number[] | Float32Array): string {
  return `[${vector.join(',')}]`
}

export default numberVectorToString
