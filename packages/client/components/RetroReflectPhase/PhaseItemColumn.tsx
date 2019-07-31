import {PhaseItemColumn_meeting} from '../../__generated__/PhaseItemColumn_meeting.graphql'
import memoize from 'micro-memoize'
/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 */
import React, {Component} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Icon from '../Icon'
import PhaseItemChits from './PhaseItemChits'
import PhaseItemEditor from './PhaseItemEditor'
import ReflectionStack from './ReflectionStack'
import Tooltip from '../Tooltip/Tooltip'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../decorators/withAtmosphere/withAtmosphere'
import SetPhaseFocusMutation from '../../mutations/SetPhaseFocusMutation'
import {DECELERATE} from '../../styles/animation'
import getNextSortOrder from '../../utils/getNextSortOrder'
import withMutationProps, {WithMutationProps} from '../../utils/relay/withMutationProps'
import {PALETTE} from '../../styles/paletteV2'
import {ICON_SIZE} from '../../styles/typographyV2'

const ColumnWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'flex-start'
})

const ColumnHighlight = styled('div')<{isFocused: boolean}>(({isFocused}) => ({
  backgroundColor: isFocused ? PALETTE.BACKGROUND_MAIN_DARKENED : undefined,
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
  color: PALETTE.TEXT_MAIN,
  fontSize: 13,
  fontStyle: 'italic',
  fontWeight: 400,
  lineHeight: '20px',
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
  editorIds: readonly string[] | null
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
              <PromptHeader
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
              </PromptHeader>
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

export default createFragmentContainer(withAtmosphere(withMutationProps(PhaseItemColumn)), {
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
