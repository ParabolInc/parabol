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
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'

const ColumnWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  height: '100%',
  minWidth: ui.retroCardWidth
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
  marginBottom: '1rem'
})

const ColumnChild = styled('div')({
  margin: 16
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
  render () {
    const {canDrop, meeting, retroPhaseItem} = this.props
    const {columnReflectionGroups} = this.state
    const {
      localPhase: {phaseType},
      localStage: {isComplete}
    } = meeting
    const {title, question} = retroPhaseItem
    return (
      <div>
        <ColumnWrapper>
          <TypeHeader>
            <LabelHeading>{title.toUpperCase()}</LabelHeading>
            <TypeDescription>{question}</TypeDescription>
          </TypeHeader>
          <ReflectionsArea>
            {phaseType === REFLECT &&
              !isComplete && (
                <ColumnChild>
                  <ButtonBlock>
                    <AddReflectionButton
                      columnReflectionGroups={columnReflectionGroups}
                      innerRef={this.setAddReflectionButtonRef}
                      meeting={meeting}
                      retroPhaseItem={retroPhaseItem}
                    />
                  </ButtonBlock>
                </ColumnChild>
              )}
            <ReflectionsList canDrop={canDrop}>
              {columnReflectionGroups.map((group) => {
                return group.reflections.map((reflection) => {
                  return (
                    <ColumnChild key={reflection.id}>
                      {reflection.isViewerCreator ? (
                        <ReflectionCard
                          addReflectionButtonRef={this.addReflectionButtonRef}
                          meeting={meeting}
                          reflection={reflection}
                        />
                      ) : (
                        <AnonymousReflectionCard meeting={meeting} reflection={reflection} />
                      )}
                    </ColumnChild>
                  )
                })
              })}
            </ReflectionsList>
          </ReflectionsArea>
        </ColumnWrapper>
      </div>
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
      meetingId: id
      localPhase {
        phaseType
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
