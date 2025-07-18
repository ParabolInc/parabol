import UserAgent from 'fbjs/lib/UserAgent'

export const isOSX = UserAgent.isPlatform('Mac OS X')
export const modKey = isOSX ? '⌘' : 'ctrl'
export const modEnter = isOSX ? '⌘↩' : 'Ctrl+Enter'
