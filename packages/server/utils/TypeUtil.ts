export type OptionalExceptFor<T, K extends keyof T> = Partial<Omit<T, K>> & {
  [MK in K]-?: T[MK]
}
