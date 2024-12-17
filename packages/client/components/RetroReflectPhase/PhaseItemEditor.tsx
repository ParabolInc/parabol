import styled from '@emotion/styled'
import {useEventCallback} from '@mui/material'
import {generateHTML, generateJSON} from '@tiptap/core'
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
import {serverTipTapExtensions} from '../../shared/tiptap/serverTipTapExtensions'
import {Elevation} from '../../styles/elevation'
import {BezierCurve, ZIndex} from '../../types/constEnums'
import {cn} from '../../ui/cn'
import ReflectionCardAuthor from '../ReflectionCard/ReflectionCardAuthor'
import ReflectionCardRoot from '../ReflectionCard/ReflectionCardRoot'
import {TipTapEditor} from '../promptResponse/TipTapEditor'
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

const emptyContent = generateJSON(`<p></p>`, serverTipTapExtensions)
console.log({emptyContent})

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
    if (!editor) return
    const contentJSON = editor?.getJSON()
    const content = JSON.stringify(contentJSON)
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
      html: generateHTML(contentJSON, serverTipTapExtensions),
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
  const {editor, linkState, setLinkState} = useTipTapReflectionEditor(
    JSON.stringify({type: 'doc', content: []}),
    {
      atmosphere,
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
    ensureEditing()
    return null
  }
  const onBlur = () => {
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
      <ReflectionCardRoot data-cy={dataCy} ref={phaseEditorRef}>
        <TipTapEditor
          className={cn(
            'flex min-h-0 items-center px-4 pt-3 leading-4',
            disableAnonymity ? 'pb-0' : 'pb-3'
          )}
          editor={editor}
          linkState={linkState}
          setLinkState={setLinkState}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        {disableAnonymity && (
          <ReflectionCardAuthor>{viewerMeetingMember?.user.preferredName}</ReflectionCardAuthor>
        )}
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
                <div className={cn('flex min-h-0 items-center px-4 text-sm leading-5')}>
                  <div dangerouslySetInnerHTML={{__html: card.html}}></div>
                </div>
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
