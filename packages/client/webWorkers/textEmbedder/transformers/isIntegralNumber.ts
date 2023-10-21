export function isIntegralNumber(x: unknown): x is Number | BigInt {
  return Number.isInteger(x) || typeof x === 'bigint'
}
