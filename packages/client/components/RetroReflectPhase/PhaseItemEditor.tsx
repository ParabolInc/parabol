import styled from '@emotion/styled'
import {useEventCallback} from '@mui/material'
import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {type MutableRefObject, type RefObject, useEffect, useMemo, useState} from 'react'
import {useFragment} from 'react-relay'
import type {PhaseItemEditor_meeting$key} from '../../__generated__/PhaseItemEditor_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useIsEditing from '../../hooks/useIsEditing'
import useMutationProps from '../../hooks/useMutationProps'
import usePortal from '../../hooks/usePortal'
import {useTipTapReflectionEditor} from '../../hooks/useTipTapReflectionEditor'
import CreateReflectionMutation from '../../mutations/CreateReflectionMutation'
import EditReflectionMutation from '../../mutations/EditReflectionMutation'
import {Elevation} from '../../styles/elevation'
import {BezierCurve, ZIndex} from '../../types/constEnums'
import {cn} from '../../ui/cn'
import {modEnter} from '../../utils/platform'
import {TipTapEditor} from '../promptResponse/TipTapEditor'
import ReflectionCardAuthor from '../ReflectionCard/ReflectionCardAuthor'
import ReflectionCardRoot from '../ReflectionCard/ReflectionCardRoot'
import SubmitReflectionButton from '../ReflectionCard/SubmitReflectionButton'
import getBBox from './getBBox'
import HTMLReflection from './HTMLReflection'
import type {ReflectColumnCardInFlight} from './PhaseItemColumn'

const FLIGHT_TIME = 500

const PLACEHOLDERS = ['Share your thoughts', 'Hit / for commands', `Press ${modEnter} to submit`]
let initialPlaceHolderIndex = 0

const CardInFlightStyles = styled(ReflectionCardRoot)<{
  transform: string
  isStart: boolean
}>(({isStart, transform}) => ({
  boxShadow: isStart ? Elevation.Z8 : Elevation.Z0,
  position: 'absolute',
  top: 0,
  transform,
  transition: `all ${FLIGHT_TIME}ms ${BezierCurve.DECELERATE}`,
  zIndex: ZIndex.REFLECTION_IN_FLIGHT
}))

interface Props {
  cardsInFlightRef: MutableRefObject<ReflectColumnCardInFlight[]>
  forceUpdateColumn: () => void
  meetingId: string
  nextSortOrder: () => number
  phaseEditorRef: React.RefObject<HTMLDivElement>
  promptId: string
  stackTopRef: RefObject<HTMLDivElement>
  dataCy: string
  readOnly?: boolean
  meetingRef: PhaseItemEditor_meeting$key
}

const PhaseItemEditor = (props: Props) => {
  const {
    meetingId,
    nextSortOrder,
    phaseEditorRef,
    promptId,
    stackTopRef,
    cardsInFlightRef,
    forceUpdateColumn,
    dataCy,
    readOnly,
    meetingRef
  } = props
  const atmosphere = useAtmosphere()
  const meeting = useFragment(
    graphql`
      fragment PhaseItemEditor_meeting on RetrospectiveMeeting {
        disableAnonymity
        viewerMeetingMember {
          user {
            timeline(first: 2, eventTypes: [retroComplete]) {
              edges {
                node {
                  id
                }
              }
            }
            preferredName
          }
        }
        teamId
      }
    `,
    meetingRef
  )

  const draftStorageKey = `phaseItemEditor-${meetingId}-${promptId}`
  const {disableAnonymity, viewerMeetingMember, teamId} = meeting
  const {onCompleted, onError, submitMutation} = useMutationProps()
  const handleSubmit = useEventCallback(() => {
    if (!editor || editor.isEmpty) return
    const contentJSON = editor?.getJSON()
    const content = JSON.stringify(contentJSON)
    if (content.length > 2000) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'reflectionTooLong',
        message: 'Reflection is too long',
        autoDismiss: 5
      })
      return
    }
    const input = {
      content,
      meetingId,
      promptId,
      sortOrder: nextSortOrder()
    }
    submitMutation()
    CreateReflectionMutation(
      atmosphere,
      {input},
      {
        onError,
        onCompleted: () => {
          onCompleted()
          window.localStorage.removeItem(draftStorageKey)
        }
      }
    )
    const {top, left} = getBBox(phaseEditorRef.current)!
    const cardInFlight = {
      transform: `translate(${left}px,${top}px)`,
      html: editor.getHTML(),
      key: content,
      isStart: true
    }
    openPortal()
    cardsInFlightRef.current = [...cardsInFlightRef.current, cardInFlight]
    editor.commands.clearOnSubmit()
    forceUpdateColumn()
    requestAnimationFrame(() => {
      const stackBBox = getBBox(stackTopRef.current)
      if (!stackBBox) return
      const {left, top} = stackBBox
      const idx = cardsInFlightRef.current.findIndex((card) => card.key === content)
      cardsInFlightRef.current = [
        ...cardsInFlightRef.current.slice(0, idx),
        {
          ...cardInFlight,
          isStart: false,
          transform: `translate(${left}px,${top}px)`
        },
        ...cardsInFlightRef.current.slice(idx + 1)
      ]
      forceUpdateColumn()
      setTimeout(removeCardInFlight(content), FLIGHT_TIME)
    })
  })

  const [placeholderIndex, setPlaceholderIndex] = useState(initialPlaceHolderIndex++)
  const placeholder = useMemo(() => {
    return PLACEHOLDERS[placeholderIndex % PLACEHOLDERS.length]
  }, [placeholderIndex])

  const {editor} = useTipTapReflectionEditor(
    JSON.stringify({type: 'doc', content: [{type: 'paragraph'}]}),
    {
      atmosphere,
      placeholder,
      teamId,
      readOnly: !!readOnly,
      onModEnter: handleSubmit
    }
  )

  useEffect(() => {
    const nextPlaceholder = () => {
      setPlaceholderIndex((idx) => idx + 1)
    }

    editor?.on('clearOnSubmit', nextPlaceholder)
    return () => {
      editor?.off('clearOnSubmit', nextPlaceholder)
    }
  }, [setPlaceholderIndex, editor])

  const isEditing = useIsEditing({
    editor,
    onStartEditing: () => {
      EditReflectionMutation(atmosphere, {
        isEditing: true,
        meetingId,
        promptId
      })
    },
    onStopEditing: () => {
      EditReflectionMutation(atmosphere, {
        isEditing: false,
        meetingId,
        promptId
      })
    }
  })
  const isFocused = editor?.isFocused

  useEffect(() => {
    if (!editor) return

    const draft = window.localStorage.getItem(draftStorageKey)
    if (draft && editor.isEmpty) {
      const content = JSON.parse(draft)
      editor?.commands.setContent(content)
      window.localStorage.removeItem(draftStorageKey)
    }

    const storeDraft = () => {
      if (editor.isEmpty) {
        window.localStorage.removeItem(draftStorageKey)
      } else {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(editor.getJSON()))
      }
    }

    editor.on('update', storeDraft)
    return () => {
      editor.off('update', storeDraft)
    }
  }, [editor])

  const {terminatePortal, openPortal, portal} = usePortal({
    noClose: true,
    id: 'phaseItemEditor'
  })
  const showButtons = isFocused || isEditing || (editor && !editor?.isEmpty)
  const showFooter = showButtons || disableAnonymity

  const removeCardInFlight = (content: string) => () => {
    const idx = cardsInFlightRef.current.findIndex((card) => card.key === content)
    if (idx === -1) return
    const nextCardsInFlight = [
      ...cardsInFlightRef.current.slice(0, idx),
      ...cardsInFlightRef.current.slice(idx + 1)
    ]
    if (nextCardsInFlight.length === 0) terminatePortal()
    cardsInFlightRef.current = nextCardsInFlight
    forceUpdateColumn()
  }

  if (!editor) return null
  return (
    <>
      <ReflectionCardRoot data-cy={dataCy} ref={phaseEditorRef} className='pb-2'>
        <TipTapEditor
          className={cn('flex h-fit max-h-41 overflow-auto px-4 pt-2 transition-all', {
            'min-h-16': isEditing || isFocused
          })}
          editor={editor}
        />
        <div
          className={cn('flex w-full flex-row-reverse items-center justify-between pr-2 pl-4', {
            hidden: !showFooter
          })}
        >
          <SubmitReflectionButton
            className={cn('opacity-100 transition-all', {
              'opacity-0': !showButtons
            })}
            onClick={handleSubmit}
            disabled={readOnly || editor.isEmpty}
          />
          {disableAnonymity && (
            <ReflectionCardAuthor>{viewerMeetingMember?.user.preferredName}</ReflectionCardAuthor>
          )}
        </div>
      </ReflectionCardRoot>
      {portal(
        <>
          {cardsInFlightRef.current.map((card) => {
            return (
              <CardInFlightStyles
                key={card.key}
                transform={card.transform}
                isStart={card.isStart}
                onTransitionEnd={removeCardInFlight(card.key)}
              >
                <HTMLReflection html={card.html} disableAnonymity={disableAnonymity} />
                {disableAnonymity && (
                  <div className='py-2 pl-4'>
                    <ReflectionCardAuthor>
                      {viewerMeetingMember?.user.preferredName}
                    </ReflectionCardAuthor>
                  </div>
                )}
              </CardInFlightStyles>
            )
          })}
        </>
      )}
    </>
  )
}

export default PhaseItemEditor
