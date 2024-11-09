import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {ContentState, EditorState, convertFromRaw, convertToRaw} from 'draft-js'
import {Stack} from 'immutable'
import * as React from 'react'
import {MutableRefObject, RefObject, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import {PhaseItemEditor_meeting$key} from '../../__generated__/PhaseItemEditor_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useEditorState from '../../hooks/useEditorState'
import useMutationProps from '../../hooks/useMutationProps'
import usePortal from '../../hooks/usePortal'
import CreateReflectionMutation from '../../mutations/CreateReflectionMutation'
import EditReflectionMutation from '../../mutations/EditReflectionMutation'
import {Elevation} from '../../styles/elevation'
import {PALETTE} from '../../styles/paletteV3'
import {BezierCurve, ZIndex} from '../../types/constEnums'
import convertToTaskContent from '../../utils/draftjs/convertToTaskContent'
import ReflectionCardAuthor from '../ReflectionCard/ReflectionCardAuthor'
import ReflectionCardRoot from '../ReflectionCard/ReflectionCardRoot'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
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
  const {onCompleted, onError, submitMutation} = useMutationProps()
  const [editorState, setEditorState] = useEditorState()
  const [isEditing, setIsEditing] = useState(false)
  const idleTimerIdRef = useRef<number>()
  const {terminatePortal, openPortal, portal} = usePortal({noClose: true, id: 'phaseItemEditor'})
  useEffect(() => {
    return () => {
      window.clearTimeout(idleTimerIdRef.current)
    }
  }, [idleTimerIdRef])

  const [isFocused, setIsFocused] = useState(false)
  const [enterHint, setEnterHint] = useState('')
  const hindTimerRef = useRef<number>()
  // delay setting the enterHint slightly, so when someone presses on the inFocus hint, it doesn't
  // change to the !inFocus one during the transition
  useEffect(() => {
    const visible = !isEditing && editorState.getCurrentContent().hasText()
    if (visible) {
      const newEnterHint = isFocused
        ? 'Press enter to add'
        : 'Forgot to press enter? Click here to add 👆'
      hindTimerRef.current = window.setTimeout(() => setEnterHint(newEnterHint), 500)
      return () => {
        window.clearTimeout(hindTimerRef.current)
      }
    } else {
      setEnterHint('')
      return undefined
    }
  }, [isFocused, isEditing, editorState.getCurrentContent().hasText()])

  const meeting = useFragment(
    graphql`
      fragment PhaseItemEditor_meeting on RetrospectiveMeeting {
        disableAnonymity
        viewerMeetingMember {
          user {
            preferredName
          }
        }
        teamId
      }
    `,
    meetingRef
  )

  const {disableAnonymity, viewerMeetingMember, teamId} = meeting

  const handleSubmit = (content: string) => {
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
      editorState: EditorState.push(
        editorState,
        convertFromRaw(JSON.parse(content)),
        'remove-range'
      ),
      key: content,
      isStart: true
    }
    openPortal()
    cardsInFlightRef.current = [...cardsInFlightRef.current, cardInFlight]
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
    // move focus to end is very important! otherwise ghost chars appear
    setEditorState(
      EditorState.set(
        EditorState.moveFocusToEnd(
          EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
        ),
        {undoStack: Stack(), redoStack: Stack()}
      )
    )
  }

  const handleKeyDownFallback = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    const {value} = e.currentTarget
    if (!value) return
    handleSubmit(convertToTaskContent(value))
  }

  const handleKeydown = () => {
    // do not throttle based on submitting or they can't submit very quickly
    const content = editorState.getCurrentContent()
    if (!content.hasText()) return
    handleSubmit(JSON.stringify(convertToRaw(content)))
  }

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

  const handleReturn = (e: React.KeyboardEvent) => {
    if (e.shiftKey) return 'not-handled'
    handleKeydown()
    return 'handled'
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

  const editorRef = useRef<HTMLTextAreaElement>(null)

  return (
    <>
      <ReflectionCardRoot data-cy={dataCy} ref={phaseEditorRef}>
        <ReflectionEditorWrapper
          isPhaseItemEditor
          ariaLabel={readOnly ? '' : 'Edit this reflection'}
          editorState={editorState}
          editorRef={editorRef}
          onBlur={onBlur}
          onFocus={onFocus}
          handleReturn={handleReturn}
          handleKeyDownFallback={handleKeyDownFallback}
          keyBindingFn={onFocus}
          placeholder='My reflection… (press enter to add)'
          setEditorState={setEditorState}
          readOnly={readOnly}
          disableAnonymity={disableAnonymity}
          teamId={teamId}
        />
        {disableAnonymity && (
          <ReflectionCardAuthor>{viewerMeetingMember?.user.preferredName}</ReflectionCardAuthor>
        )}
        <EnterHint visible={!!enterHint} onClick={handleKeydown}>
          {enterHint}
        </EnterHint>
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
                <ReflectionEditorWrapper
                  editorState={card.editorState}
                  readOnly
                  disableAnonymity={disableAnonymity}
                  teamId={teamId}
                  handleReturn={() => 'handled'}
                />
                {disableAnonymity && (
                  <ReflectionCardAuthor>
                    {viewerMeetingMember?.user.preferredName}
                  </ReflectionCardAuthor>
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
