export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
export type Subtract<T, K> = Omit<T, keyof K>

// there's rumor of a negated operator coming to TS soon...
export type NotVoid =
  | {[key: string]: NotVoid}
  | object
  | string
  | boolean
  | symbol
  | number
  | null
  | undefined
