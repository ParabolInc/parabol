export const GQLID = {
  toKey: (code: number, entity: string) => `${entity}:${code}`,
  fromKey: (key: string) => {
    const [entity, codeStr] = key.split(':')
    const code = Number(codeStr)
    return [code, entity] as [code: number, entity: string]
  }
}
