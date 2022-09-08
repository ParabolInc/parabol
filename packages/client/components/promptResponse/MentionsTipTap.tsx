import {Editor, Range} from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import {PluginKey} from 'prosemirror-state'
import React, {Suspense, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import TeamMemberId from '../../shared/gqlIds/TeamMemberId'
import SuggestMentionableUsersRoot from '../SuggestMentionableUsersRoot'
import {MentionSuggestion} from '../TaskEditor/useSuggestions'
import {getSelectionBoundingBox} from './tiptapConfig'

interface Props {
  tiptapEditor: Editor
  teamId: string
}

const pluginKey = new PluginKey('mentionMenu')

const MentionsTipTap = (props: Props) => {
  const {tiptapEditor, teamId} = props

  const {t} = useTranslation()

  const [openMentions, setOpenMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [range, setRange] = useState<Range | null>(null)
  const [active, setActive] = useState(0)

  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([])

  useEffect(() => setActive(0), [suggestions])

  const onSelectMention = useCallback(
    (item: MentionSuggestion) => {
      if (!range) return
      const nodeAfter = tiptapEditor.view.state.selection.$to.nodeAfter
      const overrideSpace = nodeAfter?.text?.startsWith(' ')

      if (overrideSpace) {
        range.to += 1
      }

      const {userId} = TeamMemberId.split(item.id)

      tiptapEditor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: 'mention',
            attrs: {
              id: userId,
              label: item.preferredName
            }
          },
          {
            type: 'text',
            text: ' '
          }
        ])
        .run()
    },
    [tiptapEditor, range]
  )

  const keyHandlerRef = useRef<any>(null)

  useImperativeHandle(
    keyHandlerRef,
    () => ({
      upHandler: () => {
        setActive((active + suggestions.length - 1) % suggestions.length)
      },
      downHandler: () => {
        setActive((active + 1) % suggestions.length)
      },
      enterHandler: () => {
        onSelectMention(suggestions[active]!)
      }
    }),
    [setActive, active, onSelectMention, suggestions]
  )

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
      char: '@',
      render: () => ({
        onStart: ({range}) => {
          setRange(range)
          setOpenMentions(true)
        },
        onExit: () => {
          setRange(null)
          setOpenMentions(false)
        },
        onUpdate: ({query, range}) => {
          setOpenMentions(true)
          setRange(range)
          setMentionQuery(query)
        },
        onKeyDown: ({event}) => {
          if (event.key === t('MentionsTipTap.Escape')) {
            setOpenMentions(false)
            return true
          }

          if (!keyHandlerRef.current) {
            return false
          }

          if (event.key === 'ArrowUp') {
            keyHandlerRef.current.upHandler()
            return true
          }

          if (event.key === 'ArrowDown') {
            keyHandlerRef.current.downHandler()
            return true
          }

          if (event.key === t('MentionsTipTap.Enter') || event.key === t('MentionsTipTap.Tab')) {
            keyHandlerRef.current.enterHandler()
            return true
          }

          return false
        }
      })
    }) as any

    // Other plugins that tiptap adds will try to handle the certain keydown events without giving
    // us a chance to handle them here, so bump up the priority for us.
    tiptapEditor.registerPlugin(plugin, (newPlugin, plugins) => [newPlugin, ...plugins])
    return () => tiptapEditor.unregisterPlugin(pluginKey)
  }, [tiptapEditor, setOpenMentions, setMentionQuery])

  return openMentions && tiptapEditor.isFocused ? (
    <Suspense fallback={''}>
      <SuggestMentionableUsersRoot
        active={active || 0}
        handleSelect={onSelectMention}
        setSuggestions={setSuggestions}
        suggestions={suggestions}
        triggerWord={mentionQuery}
        teamId={teamId}
        originCoords={getSelectionBoundingBox(tiptapEditor)}
      />
    </Suspense>
  ) : null
}

export default MentionsTipTap
