import {Editor, Range} from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import {PluginKey} from 'prosemirror-state'
import React, {useEffect, useState} from 'react'
import EmojiMenuContainer from '../TaskEditor/EmojiMenuContainer'
import {getSelectionBoundingBox} from './tiptapConfig'

interface Props {
  tiptapEditor: Editor
}

const pluginKey = new PluginKey('emojiMenu')

const EmojiMenuTipTap = (props: Props) => {
  const {tiptapEditor} = props
  const [openEmojiMenu, setOpenEmojiMenu] = useState(false)
  const [emojiQuery, setEmojiQuery] = useState('')
  const [range, setRange] = useState<Range | null>(null)

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

  return openEmojiMenu && tiptapEditor.isFocused ? (
    <EmojiMenuContainer
      originCoords={getSelectionBoundingBox(tiptapEditor)}
      onSelectEmoji={onSelectEmoji}
      query={emojiQuery}
    />
  ) : null
}

export default EmojiMenuTipTap
