import {MentionNodeAttrs, MentionOptions} from '@tiptap/extension-mention'
import {ReactRenderer} from '@tiptap/react'
import tippy, {Instance, Props} from 'tippy.js'
import EmojiDropdown from '../components/EmojiDropdown'

import data, {Emoji} from '@emoji-mart/data'
import {PluginKey} from '@tiptap/pm/state'
import {init, SearchIndex} from 'emoji-mart'

init({data})

export const tiptapEmojiConfig: Partial<MentionOptions<any, MentionNodeAttrs>> = {
  suggestion: {
    pluginKey: new PluginKey('emoji'),
    char: ':',
    items: async ({query}) => {
      const emojis: Emoji[] = await SearchIndex.search(query || '')
      if (!emojis) return []
      return emojis.map((emoji) => ({
        id: emoji.id,
        native: emoji.skins[0]!.native
      }))
    },

    // Using radix-ui isn't possible here because radix-ui will steal focus from the editor when it opens the portal
    // radix-ui also requires a trigger/anchor, which is why we use tippy
    render: () => {
      type GetReferenceClientRect = () => DOMRect
      let component: ReactRenderer<any, any> | undefined
      let popup: Instance<Props>

      return {
        onStart: (props) => {
          component = new ReactRenderer(EmojiDropdown, {
            props,
            editor: props.editor
          })
          if (!props.clientRect) return
          popup = tippy(document.body, {
            animation: false,
            getReferenceClientRect: props.clientRect as GetReferenceClientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start'
          })
        },

        onUpdate(props) {
          component?.updateProps(props)
          if (!props.clientRect) return
          popup?.setProps({
            getReferenceClientRect: props.clientRect as GetReferenceClientRect
          })
        },

        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup?.hide()
            return true
          }
          return component?.ref?.onKeyDown(props)
        },

        onExit() {
          popup?.destroy()
          component?.destroy()
        }
      }
    }
  }
}
