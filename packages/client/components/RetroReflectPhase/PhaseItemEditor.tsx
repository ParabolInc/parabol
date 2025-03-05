import styled from '@emotion/styled'
import {useEventCallback} from '@mui/material'
import graphql from 'babel-plugin-relay/macro'
import * as React from 'react'
import {MutableRefObject, RefObject, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import {PhaseItemEditor_meeting$key} from '../../__generated__/PhaseItemEditor_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import usePortal from '../../hooks/usePortal'
import {useTipTapReflectionEditor} from '../../hooks/useTipTapReflectionEditor'
import CreateReflectionMutation from '../../mutations/CreateReflectionMutation'
import EditReflectionMutation from '../../mutations/EditReflectionMutation'
import {Elevation} from '../../styles/elevation'
import {PALETTE} from '../../styles/paletteV3'
import {BezierCurve, ZIndex} from '../../types/constEnums'
import {cn} from '../../ui/cn'
import ReflectionCardAuthor from '../ReflectionCard/ReflectionCardAuthor'
import ReflectionCardRoot from '../ReflectionCard/ReflectionCardRoot'
import {TipTapEditor} from '../promptResponse/TipTapEditor'
import HTMLReflection from './HTMLReflection'
import {ReflectColumnCardInFlight} from './PhaseItemColumn'
import getBBox from './getBBox'

const FLIGHT_TIME = 500
const CardInFlightStyles = styled(ReflectionCardRoot)<{transform: string; isStart: boolean}>(
  ({isStart, transform}) => ({
    boxShadow: isStart ? Elevation.Z8 : Elevation.Z0,
    position: 'absolute',
    top: 0,
    transform,
    transition: `all ${FLIGHT_TIME}ms ${BezierCurve.DECELERATE}`,
    zIndex: ZIndex.REFLECTION_IN_FLIGHT
  })
)

const EnterHint = styled('div')<{visible: boolean}>(({visible}) => ({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontStyle: 'italic',
  fontWeight: 400,
  lineHeight: '20px',
  paddingLeft: 16,
  cursor: 'pointer',
  visibility: visible ? undefined : 'hidden',
  opacity: visible ? 1 : 0,
  height: visible ? 28 : 0,
  overflow: 'hidden',
  transition: 'height 300ms, opacity 300ms'
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
    CreateReflectionMutation(atmosphere, {input}, {onError, onCompleted})
    const {top, left} = getBBox(phaseEditorRef.current)!
    const cardInFlight = {
      transform: `translate(${left}px,${top}px)`,
      html: editor.getHTML(),
      key: content,
      isStart: true
    }
    openPortal()
    cardsInFlightRef.current = [...cardsInFlightRef.current, cardInFlight]
    editor.commands.clearContent()
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
  const {editor} = useTipTapReflectionEditor(
    JSON.stringify({type: 'doc', content: [{type: 'paragraph'}]}),
    {
      atmosphere,
      placeholder: 'My reflection… (press enter to add)',
      teamId,
      readOnly: !!readOnly,
      onEnter: handleSubmit
    }
  )
  const [isEditing, setIsEditing] = useState(false)
  const idleTimerIdRef = useRef<number>()
  const {terminatePortal, openPortal, portal} = usePortal({noClose: true, id: 'phaseItemEditor'})
  useEffect(() => {
    return () => {
      window.clearTimeout(idleTimerIdRef.current)
    }
  }, [idleTimerIdRef])

  const knowsHowToEnter = (viewerMeetingMember?.user?.timeline?.edges?.length ?? 0) > 1
  const [isFocused, setIsFocused] = useState(false)
  const [enterHint, setEnterHint] = useState('')
  const hintTimerRef = useRef<number>()
  const hintCharacterCountRef = useRef(0)
  useEffect(() => {
    const showHint = !knowsHowToEnter && !isEditing && !editor?.isEmpty
    const characterCount = editor?.storage.characterCount.characters()

    if (characterCount !== hintCharacterCountRef.current) {
      hintCharacterCountRef.current = characterCount
      setEnterHint('')
    }

    if (showHint) {
      const newEnterHint = isFocused
        ? 'Press enter to add'
        : 'Forgot to press enter? Click here to add 👆'
      hintTimerRef.current = window.setTimeout(() => setEnterHint(newEnterHint), 1000)
      return () => {
        window.clearTimeout(hintTimerRef.current)
      }
    } else {
      return undefined
    }
  }, [isFocused, isEditing, editor?.storage.characterCount.characters()])

  const ensureNotEditing = () => {
    if (!isEditing) return
    window.clearTimeout(idleTimerIdRef.current)
    idleTimerIdRef.current = undefined
    EditReflectionMutation(atmosphere, {isEditing: false, meetingId, promptId})
    setIsEditing(false)
  }

  const ensureEditing = () => {
    if (!isEditing) {
      EditReflectionMutation(atmosphere, {
        isEditing: true,
        meetingId,
        promptId
      })
      setIsEditing(true)
    }
    window.clearTimeout(idleTimerIdRef.current)
    idleTimerIdRef.current = window.setTimeout(() => {
      EditReflectionMutation(atmosphere, {
        isEditing: false,
        meetingId,
        promptId
      })
      setIsEditing(false)
    }, 5000)
  }
  const onFocus = () => {
    setIsFocused(true)
    ensureEditing()
    return null
  }
  const onBlur = () => {
    setIsFocused(false)
    ensureNotEditing()
  }

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
      <ReflectionCardRoot data-cy={dataCy} ref={phaseEditorRef} className=''>
        <TipTapEditor
          className={cn(
            'flex max-h-41 min-h-6 overflow-auto px-4 pt-3',
            disableAnonymity ? 'pb-0' : 'pb-3'
          )}
          editor={editor}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        {disableAnonymity && (
          <div className='pb-3'>
            <ReflectionCardAuthor>{viewerMeetingMember?.user.preferredName}</ReflectionCardAuthor>
          </div>
        )}
        <EnterHint visible={!!enterHint} onClick={handleSubmit}>
          {enterHint}
        </EnterHint>
      </ReflectionCardRoot>
      {portal(
        <>
          {cardsInFlightRef.current.map((card) => {
            return (
              <CardInFlightStyles
                className=''
                key={card.key}
                transform={card.transform}
                isStart={card.isStart}
                onTransitionEnd={removeCardInFlight(card.key)}
              >
                <div className='py-[2px]'>
                  <HTMLReflection html={card.html} disableAnonymity={disableAnonymity} />
                </div>
                {disableAnonymity && (
                  <div className='pb-3'>
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
