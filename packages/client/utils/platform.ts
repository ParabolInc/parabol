import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey'
import KeyboardControlKeyIcon from '@mui/icons-material/KeyboardControlKey'
import {isMacOS} from '@tiptap/core'
export const isOSX = isMacOS()
export const modKey = isOSX ? '⌘' : 'ctrl'
export const modEnter = isOSX ? '⌘↩' : 'Ctrl+Enter'

export const ModIcon = isOSX ? KeyboardCommandKeyIcon : KeyboardControlKeyIcon
