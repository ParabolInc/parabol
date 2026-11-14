import {Extension} from '@tiptap/core'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'

// ADF's subsup mark is either sub or sup, so text may not carry both
const excludes = 'subscript superscript'

export const SubscriptSuperscriptKit = Extension.create({
  name: 'subscriptSuperscriptKit',
  addExtensions() {
    return [Subscript.extend({excludes}), Superscript.extend({excludes})]
  }
})
