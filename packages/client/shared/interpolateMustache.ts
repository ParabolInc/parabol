const interpolateMustache = (str: string, lookup: Record<string, string>) => {
  const MUSTACHE_REGEX = /{{\s*(\S*)\s*}}/g
  return str.replace(MUSTACHE_REGEX, (substring, key: string) => {
    const value = lookup[key]
    return value === undefined ? substring : value
  })
}

export default interpolateMustache
