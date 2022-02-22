export const webPathToNameWithOwner = (webPath: string) => {
  const [, owner, name] = webPath.split('/')
  if (!owner || !name) return ''
  return `${owner.slice(0, 1).toUpperCase() + owner.slice(1)}/${name}`
}
