import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {MouseEvent, useEffect, useRef, useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {
  NewMeetingPhaseTypeEnum,
  ReflectionCard_meeting$key
} from '~/__generated__/ReflectionCard_meeting.graphql'
import AddReactjiToReactableMutation from '~/mutations/AddReactjiToReactableMutation'
import isDemoRoute from '~/utils/isDemoRoute'
import {ReflectionCard_reflection$key} from '../../__generated__/ReflectionCard_reflection.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useBreakpoint from '../../hooks/useBreakpoint'
import {MenuPosition} from '../../hooks/useCoords'
import useMutationProps from '../../hooks/useMutationProps'
import {useTipTapReflectionEditor} from '../../hooks/useTipTapReflectionEditor'
import useTooltip from '../../hooks/useTooltip'
import EditReflectionMutation from '../../mutations/EditReflectionMutation'
import RemoveReflectionMutation from '../../mutations/RemoveReflectionMutation'
import UpdateReflectionContentMutation from '../../mutations/UpdateReflectionContentMutation'
import {isEqualWhenSerialized} from '../../shared/isEqualWhenSerialized'
import {PALETTE} from '../../styles/paletteV3'
import {Breakpoint, ZIndex} from '../../types/constEnums'
import {cn} from '../../ui/cn'
import isPhaseComplete from '../../utils/meetings/isPhaseComplete'
import isTempId from '../../utils/relay/isTempId'
import CardButton from '../CardButton'
import {OpenSpotlight} from '../GroupingKanbanColumn'
import IconLabel from '../IconLabel'
import {TipTapEditor} from '../promptResponse/TipTapEditor'
import StyledError from '../StyledError'
import ColorBadge from './ColorBadge'
import ReactjiSection from './ReactjiSection'
import ReflectionCardAuthor from './ReflectionCardAuthor'
import ReflectionCardDeleteButton from './ReflectionCardDeleteButton'
import ReflectionCardRoot from './ReflectionCardRoot'

const StyledReacjis = styled(ReactjiSection)({
  padding: '4px 16px 0'
})

const SpotlightIcon = styled(IconLabel)({
  color: PALETTE.SLATE_700
})

const SpotlightButton = styled(CardButton)<{showSpotlight: boolean}>(({showSpotlight}) => ({
  bottom: 2,
  color: PALETTE.SLATE_700,
  cursor: 'pointer',
  opacity: 1,
  position: 'absolute',
  right: 2,
  visibility: showSpotlight ? 'inherit' : 'hidden',
  zIndex: ZIndex.TOOLTIP,
  ':hover': {
    backgroundColor: PALETTE.SLATE_200
  }
}))

interface Props {
  isClipped?: boolean
  reflectionRef: ReflectionCard_reflection$key
  meetingRef: ReflectionCard_meeting$key
  openSpotlight?: OpenSpotlight
  stackCount?: number
  showOriginFooter?: boolean
  showReactji?: boolean
  dataCy?: string
  showDragHintAnimation?: boolean
}

const getReadOnly = (
  reflection: {
    id: string
    isViewerCreator: boolean | null | undefined
    isEditing: boolean | null | undefined
  },
  phaseType: NewMeetingPhaseTypeEnum,
  stackCount: number | undefined,
  phases: any | null,
  isSpotlightSource: boolean
) => {
  const {isViewerCreator, isEditing, id} = reflection
  if (isSpotlightSource) return true
  if (phases && isPhaseComplete('group', phases)) return true
  if (!isViewerCreator || isTempId(id)) return true
  if (phaseType === 'reflect') return stackCount ? stackCount > 1 : false
  if (phaseType === 'group' && isEditing) return false
  return true
}

const ReflectionCard = (props: Props) => {
  const {
    meetingRef,
    reflectionRef,
    isClipped,
    openSpotlight,
    stackCount,
    showReactji,
    dataCy,
    showDragHintAnimation
  } = props
  const reflection = useFragment(
    graphql`
      fragment ReflectionCard_reflection on RetroReflection {
        ...ColorBadge_reflection
        isViewerCreator
        id
        isEditing
        meetingId
        reflectionGroupId
        promptId
        content
        reactjis {
          ...ReactjiSection_reactjis
          id
          isViewerReactji
        }
        sortOrder
        creator {
          preferredName
        }
      }
    `,
    reflectionRef
  )
  const meeting = useFragment(
    graphql`
      fragment ReflectionCard_meeting on RetrospectiveMeeting {
        id
        localPhase {
          phaseType
        }
        localStage {
          isComplete
        }
        phases {
          phaseType
          stages {
            id
            isComplete
          }
        }
        spotlightGroup {
          id
        }
        disableAnonymity
        spotlightSearchQuery
        teamId
      }
    `,
    meetingRef
  )

  const {
    id: reflectionId,
    content,
    promptId,
    isViewerCreator,
    meetingId,
    reactjis,
    reflectionGroupId,
    creator
  } = reflection
  const {
    localPhase,
    localStage,
    spotlightGroup,
    phases,
    disableAnonymity,
    spotlightSearchQuery,
    teamId
  } = meeting
  const {phaseType} = localPhase
  const {isComplete} = localStage
  const spotlightGroupId = spotlightGroup?.id
  const isSpotlightSource = reflectionGroupId === spotlightGroupId
  const isSpotlightOpen = !!spotlightGroupId
  const atmosphere = useAtmosphere()
  const reflectionDivRef = useRef<HTMLDivElement>(null)
  const {onCompleted, submitting, submitMutation, error, onError} = useMutationProps()
  const readOnly = getReadOnly(
    reflection,
    phaseType as NewMeetingPhaseTypeEnum,
    stackCount,
    phases,
    isSpotlightSource
  )
  const {editor} = useTipTapReflectionEditor(content, {
    atmosphere,
    teamId,
    readOnly: !!readOnly
  })
  const [isHovering, setIsHovering] = useState(false)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tooltipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER)
  const handleEditorFocus = () => {
    if (isTempId(reflectionId)) return
    if (reflection.isEditing) {
      return
    }
    updateIsEditing(true)
    EditReflectionMutation(atmosphere, {isEditing: true, meetingId, promptId})
  }

  const updateIsEditing = (isEditing: boolean) => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(reflectionId)?.setValue(isEditing, 'isEditing')
    })
  }

  useEffect(() => {
    if (isViewerCreator && editor?.isEmpty) {
      updateIsEditing(true)
    }
    return () => updateIsEditing(false)
  }, [])

  useEffect(() => {
    if (!editor) return
    editor.commands.setSearchTerm(spotlightSearchQuery || '')
  }, [spotlightSearchQuery])

  const handleContentUpdate = () => {
    if (!editor) return
    if (editor.isEmpty) {
      submitMutation()
      RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId, onError, onCompleted})
      return
    }
    const nextContentJSON = editor.getJSON()
    if (isEqualWhenSerialized(nextContentJSON, JSON.parse(content))) return
    const contentStr = JSON.stringify(nextContentJSON)
    if (contentStr.length > 2000) {
      onError(new Error('Reflection is too long'))
      return
    }
    submitMutation()
    UpdateReflectionContentMutation(
      atmosphere,
      {content: contentStr, reflectionId},
      {onError, onCompleted}
    )
  }

  const handleEditorBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (isTempId(reflectionId)) return
    const newFocusedElement = e.relatedTarget as Node
    // don't trigger a blur if a button inside the element is clicked
    if (e.currentTarget.contains(newFocusedElement)) return
    const isClickInModal = !(
      newFocusedElement === null || document.getElementById('root')?.contains(newFocusedElement)
    )
    // If they clicked in a modal, then ignore the blur event, we'll refocus the editor after the modal closes
    if (isClickInModal) {
      return
    }
    handleContentUpdate()
    updateIsEditing(false)
    EditReflectionMutation(atmosphere, {isEditing: false, meetingId, promptId})
  }

  const onToggleReactji = (emojiId: string) => {
    if (submitting) return
    const isRemove = !!reactjis.find((reactji) => {
      return reactji.isViewerReactji && reactji.id.split(':')[1] === emojiId
    })
    submitMutation()
    AddReactjiToReactableMutation(
      atmosphere,
      {
        reactableId: reflectionId,
        reactableType: 'REFLECTION',
        isRemove,
        reactji: emojiId,
        meetingId
      },
      {onCompleted, onError}
    )
  }

  const clearError = () => {
    onCompleted()
  }

  const handleClickSpotlight = (e: MouseEvent) => {
    e.stopPropagation()
    if (openSpotlight && reflectionDivRef.current) {
      openSpotlight(reflectionId, reflectionDivRef)
    }
  }

  const showSpotlight =
    phaseType === 'group' &&
    !isSpotlightOpen &&
    !isComplete &&
    !isDemoRoute() &&
    (isHovering || !isDesktop)
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = isClipped ? el.scrollHeight : 0
    }
  }, [isClipped])
  if (!editor) return null

  return (
    <ReflectionCardRoot
      data-cy={`${dataCy}-root`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      showDragHintAnimation={showDragHintAnimation}
      ref={reflectionDivRef}
      className='py-3'
    >
      <ColorBadge phaseType={phaseType as NewMeetingPhaseTypeEnum} reflection={reflection} />

      <div
        ref={scrollRef}
        className={cn('relative w-full overflow-auto text-sm leading-5 text-slate-700')}
      >
        <TipTapEditor
          className={cn(
            'flex min-h-6 w-full px-4',
            phaseType === 'discuss' ? undefined : isClipped ? 'max-h-6' : 'max-h-41',
            readOnly ? (phaseType === 'discuss' ? 'select-text' : 'select-none') : undefined
          )}
          editor={editor}
          onFocus={handleEditorFocus}
          onBlur={handleEditorBlur}
        />
      </div>
      {error && <StyledError onClick={clearError}>{error.message}</StyledError>}
      {!readOnly && (
        <ReflectionCardDeleteButton meetingId={meetingId} reflectionId={reflectionId} />
      )}
      {disableAnonymity && <ReflectionCardAuthor>{creator?.preferredName}</ReflectionCardAuthor>}
      {showReactji && <StyledReacjis reactjis={reactjis} onToggle={onToggleReactji} />}
      <ColorBadge phaseType={phaseType as NewMeetingPhaseTypeEnum} reflection={reflection} />
      <SpotlightButton
        onClick={handleClickSpotlight}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        showSpotlight={showSpotlight}
      >
        <SpotlightIcon ref={tooltipRef} icon='search' />
      </SpotlightButton>
      {tooltipPortal('Find similar')}
    </ReflectionCardRoot>
  )
}

export default ReflectionCard
