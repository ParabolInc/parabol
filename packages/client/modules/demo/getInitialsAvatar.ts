const getInitialsAvatar = (preferredName: string, backgroundColor: string) => {
  const initials = preferredName
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="${backgroundColor}"/><text x="48" y="50" font-family="IBM Plex Sans,Helvetica Neue,Helvetica,Arial,sans-serif" font-size="36" font-weight="400" fill="#fff" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default getInitialsAvatar
