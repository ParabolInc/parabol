import {Editor, Range} from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import {PluginKey} from 'prosemirror-state'
import React, {useEffect, useRef, useState} from 'react'
import EmojiMenuContainer from '../TaskEditor/EmojiMenuContainer'
import {MenuRef} from '../TaskEditor/useEmojis'
import {getSelectionBoundingBox} from './tiptapConfig'

interface Props {
  tiptapEditor: Editor
}

const pluginKey = new PluginKey('emojiMenu')

const EmojiMenuTipTap = (props: Props) => {
  const menuRef = useRef<MenuRef>()
  const {tiptapEditor} = props
  const [openEmojiMenu, setOpenEmojiMenu] = useState(false)
  const [emojiQuery, setEmojiQuery] = useState('')
  const [range, setRange] = useState<Range | null>(null)
  const [menuIsFocused, setMenuIsFocused] = useState<boolean>(false)

  useEffect(() => {
    if (tiptapEditor.isDestroyed) {
      return
    }

    const plugin = Suggestion({
      // The 'pluginKey' type definition seems to be a mismatch between prosemirror and this
      // extension, so cast to 'any' to get around it.
      // :TODO: (jmtaber129): get these type definitions to play nice.
      pluginKey: pluginKey as any,
      editor: tiptapEditor,
      char: ':',
      render: () => ({
        onStart: ({range}) => {
          setRange(range)
          setOpenEmojiMenu(true)
        },
        onExit: () => {
          setRange(null)
          setOpenEmojiMenu(false)
        },
        onUpdate: ({query, range}) => {
          setOpenEmojiMenu(true)
          setRange(range)
          setEmojiQuery(query)
        },
        onKeyDown: (e) => {
          // Disables EmojiMenu's `keepParentFocus` once user navigates into menu items.
          if ((e.event.key === 'ArrowDown' || e.event.key === 'ArrowUp') && menuRef.current) {
            setMenuIsFocused(true)
            menuRef.current.handleMenuFocus?.()
            menuRef.current.handleKeyDown(e.event as any)
          }
          return false
        }
      })
    }) as any

    tiptapEditor.registerPlugin(plugin)
    return () => tiptapEditor.unregisterPlugin(pluginKey)
  }, [tiptapEditor, setOpenEmojiMenu, setEmojiQuery])

  const onSelectEmoji = (emoji: string) => {
    if (!range) return
    tiptapEditor
      .chain()
      .focus()
      .setTextSelection(range)
      .command(({tr}) => {
        tr.insertText(emoji)

        return true
      })
      .run()
  }

  return openEmojiMenu && (tiptapEditor.isFocused || menuIsFocused) ? (
    <EmojiMenuContainer
      originCoords={getSelectionBoundingBox(tiptapEditor)}
      onSelectEmoji={onSelectEmoji}
      query={emojiQuery}
      menuRef={menuRef}
    />
  ) : null
}

export default EmojiMenuTipTap
