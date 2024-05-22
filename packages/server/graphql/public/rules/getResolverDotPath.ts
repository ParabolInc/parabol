export const getResolverDotPath = (
  dotPath: ResolverDotPath,
  source: Record<string, any>,
  args: Record<string, any>
) => {
  return dotPath.split('.').reduce((val: any, key) => val?.[key], {source, args})
}

export type ResolverDotPath = `source.${string}` | `args.${string}`
