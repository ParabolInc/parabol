// first match wins, so a browser built on Chrome comes before Chrome and Chrome before Safari
const BROWSERS: [name: string, pattern: RegExp][] = [
  ['Mattermost Desktop', /Mattermost\/(\d+)/],
  ['Electron', /Electron\/(\d+)/],
  ['Edge', /Edg(?:e|A|iOS)?\/(\d+)/],
  ['Opera', /OPR\/(\d+)/],
  ['Samsung Internet', /SamsungBrowser\/(\d+)/],
  ['Firefox', /(?:Firefox|FxiOS)\/(\d+)/],
  ['Chrome', /(?:Chrome|CriOS)\/(\d+)/],
  ['Safari', /Version\/(\d+)[\d.]* (?:Mobile\/\w+ )?Safari\//]
]

const OPERATING_SYSTEMS: [name: string, pattern: RegExp][] = [
  ['iOS', /iPhone|iPad|iPod/],
  ['Android', /Android/],
  ['ChromeOS', /CrOS/],
  ['Windows', /Windows/],
  ['macOS', /Macintosh|Mac OS X/],
  ['Linux', /Linux/]
]

const describeUserAgent = (userAgent: string | undefined) => {
  if (!userAgent) return {}
  const browser = BROWSERS.map(([name, pattern]) => {
    const majorVersion = userAgent.match(pattern)?.[1]
    return majorVersion ? `${name} ${majorVersion}` : undefined
  }).find(Boolean)
  const os = OPERATING_SYSTEMS.find(([, pattern]) => pattern.test(userAgent))?.[0]
  return {...(browser && {browser}), ...(os && {os})}
}

export default describeUserAgent
