import {PhaseItemColumn_meeting} from '__generated__/PhaseItemColumn_meeting.graphql'
import memoize from 'micro-memoize'
/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 */
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Icon from 'universal/components/Icon'
import PhaseItemChits from 'universal/components/RetroReflectPhase/PhaseItemChits'
import PhaseItemEditor from 'universal/components/RetroReflectPhase/PhaseItemEditor'
import ReflectionStack from 'universal/components/RetroReflectPhase/ReflectionStack'
import Tooltip from 'universal/components/Tooltip/Tooltip'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import SetPhaseFocusMutation from 'universal/mutations/SetPhaseFocusMutation'
import {DECELERATE} from 'universal/styles/animation'
import getNextSortOrder from 'universal/utils/getNextSortOrder'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {PALETTE} from 'universal/styles/paletteV2'
import {ICON_SIZE} from 'universal/styles/typographyV2'

const ColumnWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'flex-start'
})

const ColumnHighlight = styled('div')(({isFocused}: {isFocused: boolean}) => ({
  backgroundColor: isFocused ? PALETTE.BACKGROUND.MAIN_DARKENED : undefined,
  height: '100%',
  maxWidth: 416,
  maxHeight: 608,
  padding: 16,
  transition: `background 150ms ${DECELERATE}`,
  width: '100%'
}))

const ColumnContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'space-between',
  margin: '0 auto',
  maxWidth: 320,
  width: '100%'
})

const HeaderAndEditor = styled('div')({
  flex: 0.3
})

const Prompt = styled('div')({
  fontSize: 20,
  fontStyle: 'italic',
  fontWeight: 600,
  lineHeight: '24px'
})

const Description = styled('div')({
  color: PALETTE.TEXT.MAIN,
  fontSize: 13,
  fontStyle: 'italic',
  fontWeight: 400,
  lineHeight: '20px',
  marginTop: 8
})

const FocusArrow = styled(Icon)(({isFocused}: {isFocused: boolean}) => ({
  color: PALETTE.TEXT.PINK,
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

const PromptHeadder = styled('div')(({isClickable}: {isClickable: boolean}) => ({
  cursor: isClickable ? 'pointer' : undefined,
  padding: '0 0 16px 12px',
  position: 'relative',
  userSelect: 'none',
  width: '100%'
}))

interface EditorAndStatusProps {
  isPhaseComplete: boolean
}

const EditorAndStatus = styled('div')(({isPhaseComplete}: EditorAndStatusProps) => ({
  visibility: isPhaseComplete ? 'hidden' : undefined
}))

const ChitSection = styled('div')({
  flex: 0.3
})

const originAnchor = {
  vertical: 'top',
  horizontal: 'center'
}

const targetAnchor = {
  vertical: 'bottom',
  horizontal: 'center'
}

interface Props extends WithAtmosphereProps, WithMutationProps {
  idx: number
  description: string | null
  editorIds: ReadonlyArray<string> | null
  meeting: PhaseItemColumn_meeting
  phaseRef: React.RefObject<HTMLDivElement>
  retroPhaseItemId: string
  question: string
}

class PhaseItemColumn extends Component<Props> {
  hasFocused: boolean = false
  phaseEditorRef = React.createRef<HTMLDivElement>()
  makeColumnStack = memoize(
    (reflectionGroups: PhaseItemColumn_meeting['reflectionGroups'], retroPhaseItemId: string) =>
      reflectionGroups.filter(
        (group) => group.retroPhaseItemId === retroPhaseItemId && group.reflections.length > 0
      )
  )
  makeViewerStack = memoize((columnStack) =>
    columnStack
      .filter((group) => group.reflections[0].isViewerCreator)
      .sort((a, b) => (a.sortOrder > b.sortOrder ? 1 : -1))
      .map((group) => group.reflections[0])
  )

  setColumnFocus = () => {
    const {atmosphere, meeting, retroPhaseItemId} = this.props
    const {
      meetingId,
      facilitatorUserId,
      localPhase: {phaseId, focusedPhaseItemId},
      localStage: {isComplete}
    } = meeting
    const {viewerId} = atmosphere
    const isFacilitator = viewerId === facilitatorUserId
    if (!isFacilitator || isComplete) return
    const variables = {
      meetingId,
      focusedPhaseItemId: focusedPhaseItemId === retroPhaseItemId ? null : retroPhaseItemId
    }
    SetPhaseFocusMutation(atmosphere, variables, {phaseId})
  }

  nextSortOrder = () => getNextSortOrder(this.props.meeting.reflectionGroups)

  render () {
    const {
      atmosphere: {viewerId},
      description,
      editorIds,
      idx,
      meeting,
      phaseRef,
      question,
      retroPhaseItemId
    } = this.props
    const {
      facilitatorUserId,
      meetingId,
      localPhase: {focusedPhaseItemId},
      localStage: {isComplete},
      reflectionGroups
    } = meeting
    this.hasFocused = this.hasFocused || !!focusedPhaseItemId
    const isFocused = focusedPhaseItemId === retroPhaseItemId
    const columnStack = this.makeColumnStack(reflectionGroups, retroPhaseItemId)
    const reflectionStack = this.makeViewerStack(columnStack)
    const isViewerFacilitator = viewerId === facilitatorUserId
    return (
      <ColumnWrapper>
        <ColumnHighlight isFocused={isFocused}>
          <ColumnContent>
            <HeaderAndEditor>
              <PromptHeadder
                isClickable={isViewerFacilitator && !isComplete}
                onClick={this.setColumnFocus}
              >
                <FocusArrow isFocused={isFocused}>forward</FocusArrow>
                <Tooltip
                  delay={200}
                  maxHeight={40}
                  maxWidth={500}
                  originAnchor={originAnchor}
                  targetAnchor={targetAnchor}
                  tip={<div>Tap to highlight prompt for everybody</div>}
                  isDisabled={this.hasFocused || isFocused || !isViewerFacilitator || !!isComplete}
                >
                  <Prompt>{question}</Prompt>
                </Tooltip>
                <Description>{description}</Description>
              </PromptHeadder>
              <EditorAndStatus isPhaseComplete={!!isComplete}>
                <PhaseItemEditor
                  phaseEditorRef={this.phaseEditorRef}
                  meetingId={meetingId}
                  nextSortOrder={this.nextSortOrder}
                  retroPhaseItemId={retroPhaseItemId}
                />
              </EditorAndStatus>
            </HeaderAndEditor>
            <ReflectionStack
              reflectionStack={reflectionStack}
              readOnly={!!isComplete}
              idx={idx}
              phaseEditorRef={this.phaseEditorRef}
              phaseItemId={retroPhaseItemId}
              phaseRef={phaseRef}
              meetingId={meetingId}
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
}

// <PhaseItemHealthBar editorCount={editorIds ? editorIds.length : 0} />

export default createFragmentContainer(
  withAtmosphere(withMutationProps(PhaseItemColumn)),
  graphql`
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
)
