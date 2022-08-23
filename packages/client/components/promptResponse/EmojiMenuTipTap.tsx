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

  return openEmojiMenu ? (
    <EmojiMenuContainer
      originCoords={getSelectionBoundingBox(tiptapEditor)}
      onSelectEmoji={onSelectEmoji}
      query={emojiQuery}
      removeModal={() => setOpenEmojiMenu(false)}
    />
  ) : null
}

export default EmojiMenuTipTap
