/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 *
 * @flow
 */
import type {PhaseItemColumn_meeting as Meeting} from './__generated__/PhaseItemColumn_meeting.graphql'
import type {PhaseItemColumn_retroPhaseItem as RetroPhaseItem} from './__generated__/PhaseItemColumn_retroPhaseItem.graphql'
// $FlowFixMe
import React, {Component} from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import appTheme from 'universal/styles/theme/appTheme'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import SetPhaseFocusMutation from 'universal/mutations/SetPhaseFocusMutation'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import {DECELERATE} from 'universal/styles/animation'
import PhaseItemEditor from 'universal/components/RetroReflectPhase/PhaseItemEditor'
import ReflectionStack from 'universal/components/RetroReflectPhase/ReflectionStack'
import PhaseItemHealthBar from 'universal/components/RetroReflectPhase/PhaseItemHealthBar'
import PhaseItemChits from 'universal/components/RetroReflectPhase/PhaseItemChits'

const ColumnWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  height: '100%',
  padding: '1rem'
})

const ColumnHighlight = styled('div')(({isFocused}) => ({
  background: isFocused && appTheme.palette.mid10a,
  display: 'flex',
  justifyContent: 'center',
  transition: `background 150ms ${DECELERATE}`,
  maxWidth: '26rem',
  height: '100%',
  width: '100%'
}))

const ColumnContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '0 2rem'
  // maxWidth: ui.retroCardWidth
})

const HeaderAndEditor = styled('div')({
  flex: 0.3
})

const TypeDescription = styled('div')({
  fontSize: '1.25rem',
  fontStyle: 'italic',
  fontWeight: 600
})

const FocusArrow = styled(StyledFontAwesome)(({isFocused}) => ({
  color: ui.palette.yellow,
  opacity: isFocused ? 1 : 0,
  paddingRight: isFocused ? '0.5rem' : 0,
  transition: `all 150ms ${DECELERATE}`,
  transform: `translateX(${isFocused ? 0 : '-100%'})`
}))

const TypeHeader = styled('div')({
  padding: '2rem 0 1rem',
  userSelect: 'none',
  width: '100%'
})

const EditorAndStatus = styled('div')(({isPhaseComplete}) => ({
  visibility: isPhaseComplete && 'hidden'
}))

const ChitSection = styled('div')({
  flex: 0.3
})

type Props = {|
  atmosphere: Object,
  canDrop: boolean,
  meeting: Meeting,
  retroPhaseItem: RetroPhaseItem,
  ...MutationProps
|}

type State = {
  reflectionStack: $ReadOnlyArray<Object>,
  reflectionGroups: $ReadOnlyArray<Object>
}

class PhaseItemColumn extends Component<Props, State> {
  static getDerivedStateFromProps (nextProps: Props, prevState: State): $Shape<State> | null {
    const {
      meeting: {reflectionGroups: nextReflectionGroups},
      retroPhaseItem: {retroPhaseItemId}
    } = nextProps
    if (nextReflectionGroups === prevState.reflectionGroups) return null
    const reflectionGroups = nextReflectionGroups || []
    return {
      reflectionGroups,
      reflectionStack: reflectionGroups.filter(
        (group) => group.retroPhaseItemId === retroPhaseItemId && group.reflections.length > 0
      )
    }
  }

  state = {
    reflectionGroups: [],
    reflectionStack: []
  }

  setColumnFocus = () => {
    const {
      atmosphere,
      meeting,
      retroPhaseItem: {retroPhaseItemId}
    } = this.props
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

  render () {
    const {idx, meeting, retroPhaseItem} = this.props
    const {
      meetingId,
      localPhase: {focusedPhaseItemId},
      localStage: {isComplete}
    } = meeting
    const {question, retroPhaseItemId} = retroPhaseItem
    const isFocused = focusedPhaseItemId === retroPhaseItemId
    return (
      <ColumnWrapper>
        <ColumnHighlight isFocused={isFocused}>
          <ColumnContent>
            <HeaderAndEditor>
              <TypeHeader onClick={this.setColumnFocus}>
                <TypeDescription>
                  <FocusArrow name='arrow-right' isFocused={isFocused} />
                  {question}
                </TypeDescription>
              </TypeHeader>
              <EditorAndStatus isPhaseComplete={isComplete}>
                <PhaseItemEditor meeting={meeting} retroPhaseItem={retroPhaseItem} />
                <PhaseItemHealthBar editorsCount={2} />
              </EditorAndStatus>
            </HeaderAndEditor>
            <ReflectionStack
              reflectionStack={[]}
              idx={idx}
              phaseItemId={retroPhaseItemId}
              meetingId={meetingId}
            />
            <ChitSection>
              <PhaseItemChits count={5} />
            </ChitSection>
          </ColumnContent>
        </ColumnHighlight>
      </ColumnWrapper>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(PhaseItemColumn)),
  graphql`
    fragment PhaseItemColumn_retroPhaseItem on RetroPhaseItem {
      ...PhaseItemEditor_retroPhaseItem
      retroPhaseItemId: id
      question
    }

    fragment PhaseItemColumn_meeting on RetrospectiveMeeting {
      ...PhaseItemEditor_meeting
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

// const ReflectionsArea = styled('div')({
//   flexDirection: 'column',
//   display: 'flex',
//   overflow: 'auto',
//   height: '100%'
// })
//
// const ReflectionsList = styled('div')(({canDrop}) => ({
//   background: canDrop && appTheme.palette.light60l
// }))

// <ReflectionsArea>
// {phaseType === REFLECT &&
// !isComplete && (
//   <ButtonBlock>
//     <AddReflectionButton
//       reflectionStack={reflectionStack}
//       innerRef={this.setAddReflectionButtonRef}
//       meeting={meeting}
//       retroPhaseItem={retroPhaseItem}
//     />
//   </ButtonBlock>
// )}
// <ReflectionsList canDrop={canDrop}>
//   {reflectionStack.map((group) => {
//     return group.reflections.map((reflection) => {
//       if (reflection.isViewerCreator) {
//         return (
//           <ReflectionCard
//             addReflectionButtonRef={this.addReflectionButtonRef}
//             meeting={meeting}
//             reflection={reflection}
//           />
//         )
//       }
//       return <AnonymousReflectionCard meeting={meeting} reflection={reflection} />
//     })
//   })}
// </ReflectionsList>
// </ReflectionsArea>
