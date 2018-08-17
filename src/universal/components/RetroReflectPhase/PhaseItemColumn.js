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
import AddReflectionButton from 'universal/components/AddReflectionButton/AddReflectionButton'
import ui from 'universal/styles/ui'
import {REFLECT} from 'universal/utils/constants'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import AnonymousReflectionCard from 'universal/components/AnonymousReflectionCard/AnonymousReflectionCard'
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import appTheme from 'universal/styles/theme/appTheme'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import SetPhaseFocusMutation from 'universal/mutations/SetPhaseFocusMutation'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'

const FocusArrow = styled(StyledFontAwesome)(({isFocused}) => ({
  color: ui.palette.yellow,
  opacity: isFocused ? 1 : 0,
  paddingRight: isFocused ? '0.5rem' : 0,
  transition: 'all 100ms ease-in',
  transform: `translateX(${isFocused ? 0 : '-100%'})`
}))

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
  maxWidth: '26rem',
  height: '100%',
  width: '100%'
}))

const ColumnContent = styled('div')({
  maxWidth: ui.retroCardWidth
})

const ReflectionsArea = styled('div')({
  flexDirection: 'column',
  display: 'flex',
  overflow: 'auto',
  height: '100%'
})

const ReflectionsList = styled('div')(({canDrop}) => ({
  background: canDrop && appTheme.palette.light60l
}))

const TypeDescription = styled('div')({
  fontSize: '1.25rem',
  fontStyle: 'italic',
  fontWeight: 600
})

const TypeHeader = styled('div')({
  padding: '2rem 0 1rem',
  userSelect: 'none',
  width: '100%'
})

const ButtonBlock = styled('div')({
  padding: '0 0 1.25rem',
  width: '100%'
})

type Props = {|
  atmosphere: Object,
  canDrop: boolean,
  meeting: Meeting,
  retroPhaseItem: RetroPhaseItem,
  ...MutationProps
|}

type State = {
  columnReflectionGroups: $ReadOnlyArray<Object>,
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
      columnReflectionGroups: reflectionGroups.filter(
        (group) => group.retroPhaseItemId === retroPhaseItemId && group.reflections.length > 0
      )
    }
  }

  state = {
    reflectionGroups: [],
    columnReflectionGroups: []
  }
  addReflectionButtonRef: ?HTMLElement = null

  setAddReflectionButtonRef = (c) => {
    this.addReflectionButtonRef = c
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
    const {canDrop, meeting, retroPhaseItem} = this.props
    const {columnReflectionGroups} = this.state
    const {
      localPhase: {phaseType, focusedPhaseItemId},
      localStage: {isComplete}
    } = meeting
    const {question, retroPhaseItemId} = retroPhaseItem
    const isFocused = focusedPhaseItemId === retroPhaseItemId
    return (
      <ColumnWrapper>
        <ColumnHighlight isFocused={isFocused}>
          <ColumnContent>
            <TypeHeader onClick={this.setColumnFocus}>
              <TypeDescription>
                <FocusArrow name='arrow-right' isFocused={isFocused} />
                {question}
              </TypeDescription>
            </TypeHeader>
            <ReflectionsArea>
              {phaseType === REFLECT &&
                !isComplete && (
                  <ButtonBlock>
                    <AddReflectionButton
                      columnReflectionGroups={columnReflectionGroups}
                      innerRef={this.setAddReflectionButtonRef}
                      meeting={meeting}
                      retroPhaseItem={retroPhaseItem}
                    />
                  </ButtonBlock>
                )}
              <ReflectionsList canDrop={canDrop}>
                {columnReflectionGroups.map((group) => {
                  return group.reflections.map((reflection) => {
                    if (reflection.isViewerCreator) {
                      return (
                        <ReflectionCard
                          addReflectionButtonRef={this.addReflectionButtonRef}
                          meeting={meeting}
                          reflection={reflection}
                        />
                      )
                    }
                    return <AnonymousReflectionCard meeting={meeting} reflection={reflection} />
                  })
                })}
              </ReflectionsList>
            </ReflectionsArea>
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
      ...AddReflectionButton_retroPhaseItem
      retroPhaseItemId: id
      title
      question
    }

    fragment PhaseItemColumn_meeting on RetrospectiveMeeting {
      ...AddReflectionButton_meeting
      ...AnonymousReflectionCard_meeting
      ...ReflectionCard_meeting
      ...ReflectionGroup_meeting
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
          ...AnonymousReflectionCard_reflection
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
