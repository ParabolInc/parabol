import {PhaseItemColumn_meeting} from '../../__generated__/PhaseItemColumn_meeting.graphql'
/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 */
import React, {useEffect, useMemo, useRef} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Icon from '../Icon'
import PhaseItemChits from './PhaseItemChits'
import PhaseItemEditor from './PhaseItemEditor'
import ReflectionStack from './ReflectionStack'
import Tooltip from '../Tooltip/Tooltip'
import SetPhaseFocusMutation from '../../mutations/SetPhaseFocusMutation'
import {DECELERATE} from '../../styles/animation'
import getNextSortOrder from '../../utils/getNextSortOrder'
import {PALETTE} from '../../styles/paletteV2'
import {ICON_SIZE} from '../../styles/typographyV2'
import useAtmosphere from '../../hooks/useAtmosphere'
import {EditorState} from 'draft-js'
import {ElementWidth} from '../../types/constEnums'
import useRefState from '../../hooks/useRefState'

const ColumnWrapper = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'flex-start',
  height: '100%',
  border: isDesktop ? undefined : `1px solid ${PALETTE.BORDER_LIGHT}`,
  borderRadius: 8
}))

const ColumnHighlight = styled('div')<{isFocused: boolean, isDesktop: boolean}>(({isDesktop, isFocused}) => ({
  backgroundColor: isDesktop ? isFocused ? PALETTE.BACKGROUND_MAIN_DARKENED : undefined : isFocused ? PALETTE.BACKGROUND_REFLECTION_FOCUSED : PALETTE.BACKGROUND_REFLECTION,
  borderRadius: isDesktop ? 2 : 8,
  height: '100%',
  maxHeight: 608,
  padding: isDesktop ? '16px 24px' : '16px 8px',
  transition: `background 150ms ${DECELERATE}`,
  width: '100%'
}))

const ColumnContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'space-between',
  margin: '0 auto',
  width: ElementWidth.REFLECTION_CARD
})

const HeaderAndEditor = styled('div')({
  flex: 0.3,
  paddingBottom: 16
})

const Prompt = styled('div')({
  fontSize: 20,
  fontStyle: 'italic',
  fontWeight: 600,
  lineHeight: '24px'
})

const Description = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 13,
  fontStyle: 'italic',
  fontWeight: 400,
  lineHeight: '20px',
  // tall enough for 3 lines so columns looks the same
  minHeight: 60,
  marginTop: 8
})

const FocusArrow = styled(Icon)<{isFocused: boolean}>(({isFocused}) => ({
  color: PALETTE.TEXT_PINK,
  display: 'block',
  fontSize: ICON_SIZE.MD24,
  height: ICON_SIZE.MD24,
  left: -18,
  lineHeight: 1,
  opacity: isFocused ? 1 : 0,
  position: 'absolute',
  transition: `all 150ms ${DECELERATE}`,
  transform: `translateX(${isFocused ? 0 : '-100%'})`
}))

const PromptHeader = styled('div')<{isClickable: boolean}>(({isClickable}) => ({
  cursor: isClickable ? 'pointer' : undefined,
  padding: '0 0 16px 12px',
  position: 'relative',
  userSelect: 'none',
  width: '100%'
}))

interface EditorAndStatusProps {
  isPhaseComplete: boolean
}

const EditorAndStatus = styled('div')<EditorAndStatusProps>(({isPhaseComplete}) => ({
  visibility: isPhaseComplete ? 'hidden' : undefined
}))

const ChitSection = styled('div')({
  flex: 0.3,
  minHeight: 96
})

const originAnchor = {
  vertical: 'top',
  horizontal: 'center'
}

const targetAnchor = {
  vertical: 'bottom',
  horizontal: 'center'
}

export interface ReflectColumnCardInFlight {
  key: string
  editorState: EditorState
  transform: string
  isStart: boolean
}

interface Props {
  idx: number
  isDesktop: boolean
  description: string | null
  editorIds: readonly string[] | null
  meeting: PhaseItemColumn_meeting
  phaseRef: React.RefObject<HTMLDivElement>
  retroPhaseItemId: string
  question: string
}

const PhaseItemColumn = (props: Props) => {
  const {retroPhaseItemId, description, editorIds, idx, meeting, phaseRef, question, isDesktop} = props
  const {meetingId, facilitatorUserId, localPhase, localStage, reflectionGroups} = meeting
  const {phaseId, focusedPhaseItemId} = localPhase
  const {isComplete} = localStage

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const hasFocusedRef = useRef(false)
  const phaseEditorRef = useRef<HTMLDivElement>(null)
  const stackTopRef = useRef<HTMLDivElement>(null)
  const [cardsInFlightRef, setCardsInFlight] = useRefState<ReflectColumnCardInFlight[]>([])
  const isFacilitator = viewerId === facilitatorUserId
  useEffect(() => {
    hasFocusedRef.current = true
  }, [focusedPhaseItemId])

  const setColumnFocus = () => {
    if (!isFacilitator || isComplete) return
    const variables = {
      meetingId,
      focusedPhaseItemId: focusedPhaseItemId === retroPhaseItemId ? null : retroPhaseItemId
    }
    SetPhaseFocusMutation(atmosphere, variables, {phaseId})
  }

  const nextSortOrder = () => getNextSortOrder(reflectionGroups)

  const isFocused = focusedPhaseItemId === retroPhaseItemId

  const columnStack = useMemo(() => {
    const groups = reflectionGroups.filter(
      (group) => group.retroPhaseItemId === retroPhaseItemId && group.reflections.length > 0 &&
        !cardsInFlightRef.current.find((card) => card.key === group.reflections[0].content)
    )
    return groups
  }, [reflectionGroups, retroPhaseItemId, cardsInFlightRef])


  const reflectionStack = useMemo(() => {
    return columnStack
      .filter((group) => group.reflections[0].isViewerCreator)
      .sort((a, b) => (a.sortOrder > b.sortOrder ? -1 : 1))
      .map((group) => group.reflections[0])
  }, [columnStack])

  return (
    <ColumnWrapper isDesktop={isDesktop}>
      <ColumnHighlight isDesktop={isDesktop} isFocused={isFocused}>
        <ColumnContent>
          <HeaderAndEditor>
            <PromptHeader
              isClickable={isFacilitator && !isComplete}
              onClick={setColumnFocus}
            >
              <FocusArrow isFocused={isFocused}>forward</FocusArrow>
              <Tooltip
                delay={200}
                maxHeight={40}
                maxWidth={500}
                originAnchor={originAnchor}
                targetAnchor={targetAnchor}
                tip={<div>Tap to highlight prompt for everybody</div>}
                isDisabled={hasFocusedRef.current || isFocused || !isFacilitator || isComplete}
              >
                <Prompt>{question}</Prompt>
              </Tooltip>
              <Description>{description}</Description>
            </PromptHeader>
            <EditorAndStatus isPhaseComplete={isComplete}>
              <PhaseItemEditor
                cardsInFlightRef={cardsInFlightRef}
                setCardsInFlight={setCardsInFlight}
                phaseEditorRef={phaseEditorRef}
                meetingId={meetingId}
                nextSortOrder={nextSortOrder}
                retroPhaseItemId={retroPhaseItemId}
                stackTopRef={stackTopRef}
              />
            </EditorAndStatus>
          </HeaderAndEditor>
          <ReflectionStack
            reflectionStack={reflectionStack}
            readOnly={isComplete}
            idx={idx}
            phaseEditorRef={phaseEditorRef}
            phaseItemId={retroPhaseItemId}
            phaseRef={phaseRef}
            meetingId={meetingId}
            stackTopRef={stackTopRef}
          />
          <ChitSection>
            <PhaseItemChits
              count={columnStack.length - reflectionStack.length}
              editorCount={editorIds ? editorIds.length : 0}
            />
          </ChitSection>
        </ColumnContent>
      </ColumnHighlight>
    </ColumnWrapper>
  )
}

export default createFragmentContainer(PhaseItemColumn, {
  meeting: graphql`
    fragment PhaseItemColumn_meeting on RetrospectiveMeeting {
      facilitatorUserId
      meetingId: id
      localPhase {
        phaseId: id
        phaseType
        ... on ReflectPhase {
          focusedPhaseItemId
        }
      }
      localStage {
        isComplete
      }
      phases {
        id
        phaseType
        stages {
          isComplete
        }
        ... on ReflectPhase {
          focusedPhaseItemId
        }
      }
      reflectionGroups {
        id
        ...ReflectionGroup_reflectionGroup
        retroPhaseItemId
        sortOrder
        reflections {
          ...ReflectionCard_reflection
          content
          id
          isEditing
          isViewerCreator
          sortOrder
        }
      }
    }
  `
})
