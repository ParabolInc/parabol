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
  padding: '0 14px 12px'
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
    // spotlightSearchQuery,
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
  const userSelect = readOnly
    ? phaseType === 'discuss' || phaseType === 'vote'
      ? 'text'
      : 'none'
    : undefined
  const {editor, linkState, setLinkState} = useTipTapReflectionEditor(content, {
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
    EditReflectionMutation(atmosphere, {isEditing: true, meetingId, promptId})
  }

  const updateIsEditing = (isEditing: boolean) => {
    commitLocalUpdate(atmosphere, (store) => {
      const reflection = store.get(reflectionId)
      if (!reflection) return
      reflection.setValue(isEditing, 'isEditing')
    })
  }

  useEffect(() => {
    if (isViewerCreator && editor?.isEmpty) {
      updateIsEditing(true)
    }
    return () => updateIsEditing(false)
  }, [])

  // useEffect(() => {
  //   const refreshedState = remountDecorators(() => editorState, spotlightSearchQuery)
  //   setEditorState(refreshedState)
  // }, [spotlightSearchQuery])

  const handleContentUpdate = () => {
    if (!editor) return
    // const contentState = editorState.getCurrentContent()
    if (editor.isEmpty) {
      submitMutation()
      RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId, onError, onCompleted})
      return
    }
    const nextContentJSON = editor.getJSON()
    // if (isEqualWhenSerialized(nextContentJSON, JSON.parse(content))) return
    submitMutation()
    UpdateReflectionContentMutation(
      atmosphere,
      {content: JSON.stringify(nextContentJSON), reflectionId},
      {onError, onCompleted}
    )
    commitLocalUpdate(atmosphere, (store) => {
      const reflection = store.get(reflectionId)
      if (!reflection) return
      reflection.setValue(false, 'isEditing')
    })
  }

  const handleEditorBlur = () => {
    if (isTempId(reflectionId)) return
    handleContentUpdate()
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
  if (!editor) return null
  return (
    <ReflectionCardRoot
      data-cy={`${dataCy}-root`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      showDragHintAnimation={showDragHintAnimation}
      ref={reflectionDivRef}
    >
      <ColorBadge phaseType={phaseType as NewMeetingPhaseTypeEnum} reflection={reflection} />

      <div
        className={cn(
          'relative w-full overflow-auto text-sm leading-5 text-slate-700',
          isClipped ? 'max-h-11' : 'max-h-[104px]'
        )}
      ></div>
      <TipTapEditor
        className={cn(
          'flex min-h-4 w-full items-center px-4 pt-3 leading-4',
          disableAnonymity ? 'pb-0' : 'pb-3',
          userSelect
        )}
        editor={editor}
        linkState={linkState}
        setLinkState={setLinkState}
        onBlur={handleEditorBlur}
        onFocus={handleEditorFocus}
      />
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
