import styled from '@emotion/styled'
import {useEventCallback} from '@mui/material'
import graphql from 'babel-plugin-relay/macro'
import * as React from 'react'
import {MutableRefObject, RefObject} from 'react'
import {useFragment} from 'react-relay'
import {PhaseItemEditor_meeting$key} from '../../__generated__/PhaseItemEditor_meeting.graphql'
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
import ReflectionCardAuthor from '../ReflectionCard/ReflectionCardAuthor'
import ReflectionCardRoot from '../ReflectionCard/ReflectionCardRoot'
import SubmitReflectionButton from '../ReflectionCard/SubmitReflectionButton'
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
      placeholder: 'Share your thoughts, press / for commands',
      teamId,
      readOnly: !!readOnly
    }
  )

  const isEditing = useIsEditing({
    editor,
    onStartEditing: () => {
      EditReflectionMutation(atmosphere, {isEditing: true, meetingId, promptId})
    },
    onStopEditing: () => {
      EditReflectionMutation(atmosphere, {isEditing: false, meetingId, promptId})
    }
  })

  const {terminatePortal, openPortal, portal} = usePortal({noClose: true, id: 'phaseItemEditor'})
  const showFooter = isEditing || (editor && !editor?.isEmpty)

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
          className={'flex max-h-41 min-h-[6rem] overflow-auto px-4 pt-3'}
          editor={editor}
        />
        <div
          className={cn(
            'flex w-full flex-row-reverse items-center justify-between pr-2 pb-2 pl-4 opacity-100 transition-all',
            {
              'opacity-0': !showFooter
            }
          )}
        >
          <SubmitReflectionButton onClick={handleSubmit} disabled={readOnly || editor.isEmpty} />
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
