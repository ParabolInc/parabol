import {isMacOS} from '@tiptap/core'

export const isOSX = isMacOS()
export const modKey = isOSX ? '⌘' : 'ctrl'
export const modEnter = isOSX ? '⌘↩' : 'Ctrl+Enter'
