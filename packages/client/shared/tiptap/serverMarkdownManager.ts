import {MarkdownManager} from '@tiptap/markdown'
import {serverTipTapExtensions} from './serverTipTapExtensions'

export const serverMarkdownManager = new MarkdownManager({extensions: serverTipTapExtensions})
