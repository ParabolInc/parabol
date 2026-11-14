import {isMacOS} from '@tiptap/core'
import {
  KeyboardCommandKey as KeyboardCommandKeyIcon,
  KeyboardControlKey as KeyboardControlKeyIcon
} from '~/ui/icons'
export const isOSX = isMacOS()
export const modKey = isOSX ? '⌘' : 'ctrl'
export const modEnter = isOSX ? '⌘↩' : 'Ctrl+Enter'

export const ModIcon = isOSX ? KeyboardCommandKeyIcon : KeyboardControlKeyIcon
