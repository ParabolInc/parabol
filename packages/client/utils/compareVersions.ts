const parseVersion = (version: string) => {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version)
  return match ? match.slice(1).map(Number) : null
}

// 0 when either version is unreadable, so an odd version never counts as older
const compareVersions = (version: string, otherVersion: string) => {
  const parts = parseVersion(version)
  const otherParts = parseVersion(otherVersion)
  if (!parts || !otherParts) return 0
  const differentIndex = parts.findIndex((part, index) => part !== otherParts[index])
  return differentIndex === -1 ? 0 : Math.sign(parts[differentIndex]! - otherParts[differentIndex]!)
}

export default compareVersions
