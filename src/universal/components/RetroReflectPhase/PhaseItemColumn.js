/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 *
 * @flow
 */
import type {PhaseItemColumn_meeting as Meeting} from './__generated__/PhaseItemColumn_meeting.graphql';
import type {PhaseItemColumn_retroPhaseItem as RetroPhaseItem} from './__generated__/PhaseItemColumn_retroPhaseItem.graphql';
// $FlowFixMe
import React, {Component} from 'react';
import styled from 'react-emotion';
import AddReflectionButton from 'universal/components/AddReflectionButton/AddReflectionButton';
import ui from 'universal/styles/ui';
import {GROUP, REFLECT, REFLECTION_CARD, VOTE} from 'universal/utils/constants';
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import reactLifecyclesCompat from 'react-lifecycles-compat';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import AnonymousReflectionCard from 'universal/components/AnonymousReflectionCard/AnonymousReflectionCard';
import {DropTarget as dropTarget} from 'react-dnd';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import dndNoise from 'universal/utils/dndNoise';
import UpdateReflectionLocationMutation from 'universal/mutations/UpdateReflectionLocationMutation';
import appTheme from 'universal/styles/theme/appTheme';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import LabelHeading from 'universal/components/LabelHeading/LabelHeading';

const ColumnWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  height: '100%'
});

const ReflectionsArea = styled('div')({
  flexDirection: 'column',
  display: 'flex',
  overflow: 'auto',
  height: '100%',
  minWidth: ui.retroCardWidth
});

const ReflectionsList = styled('div')(({canDrop}) => ({
  background: canDrop && appTheme.palette.light60l
}));

const TypeDescription = styled('div')({
  fontSize: '1.25rem',
  fontStyle: 'italic',
  fontWeight: 600
});

const TypeHeader = styled('div')({
  marginBottom: '1rem'
});

const ColumnChild = styled('div')({
  margin: 16
});

const ButtonBlock = styled('div')({
  padding: '0 0 1.25rem',
  width: '100%'
});

type Props = {|
  atmosphere: Object,
  canDrop: boolean,
  connectDropTarget: () => Node,
  meeting: Meeting,
  retroPhaseItem: RetroPhaseItem,
  ...MutationProps
|};

type State = {
  columnReflectionGroups: $ReadOnlyArray<Object>,
  reflectionGroups: $ReadOnlyArray<Object>
};

class PhaseItemColumn extends Component<Props, State> {
  static getDerivedStateFromProps (nextProps: Props, prevState: State): $Shape<State> | null {
    const {
      meeting: {reflectionGroups: nextReflectionGroups},
      retroPhaseItem: {retroPhaseItemId}
    } = nextProps;
    if (nextReflectionGroups === prevState.reflectionGroups) return null;
    const reflectionGroups = nextReflectionGroups || [];
    return {
      reflectionGroups,
      columnReflectionGroups: reflectionGroups.filter(
        (group) => group.retroPhaseItemId === retroPhaseItemId && group.reflections.length > 0
      )
    };
  }

  state = {
    reflectionGroups: [],
    columnReflectionGroups: []
  };

  setGroupRef = (groupId) => (c) => {
    this.groupRefs[groupId] = c;
  };

  groupRefs = {};

  render () {
    const {connectDropTarget, canDrop, meeting, retroPhaseItem} = this.props;
    const {columnReflectionGroups} = this.state;
    const {
      localPhase: {phaseType},
      localStage: {isComplete}
    } = meeting;
    const {retroPhaseItemId, title, question} = retroPhaseItem;
    return connectDropTarget(
      <div>
        <ColumnWrapper>
          {phaseType !== VOTE && (
            <TypeHeader>
              <LabelHeading>{title.toUpperCase()}</LabelHeading>
              <TypeDescription>{question}</TypeDescription>
            </TypeHeader>
          )}
          <ReflectionsArea>
            {phaseType === REFLECT &&
              !isComplete && (
              <ColumnChild>
                <ButtonBlock>
                  <AddReflectionButton
                    columnReflectionGroups={columnReflectionGroups}
                    meeting={meeting}
                    retroPhaseItem={retroPhaseItem}
                  />
                </ButtonBlock>
              </ColumnChild>
            )}
            <ReflectionsList canDrop={canDrop}>
              {columnReflectionGroups.map((group) => {
                if (phaseType === REFLECT) {
                  return group.reflections.map((reflection) => {
                    return (
                      <ColumnChild key={reflection.id}>
                        {reflection.isViewerCreator ? (
                          <ReflectionCard meeting={meeting} reflection={reflection} />
                        ) : (
                          <AnonymousReflectionCard meeting={meeting} reflection={reflection} />
                        )}
                      </ColumnChild>
                    );
                  });
                } else if (phaseType === GROUP) {
                  return (
                    <ColumnChild key={group.id}>
                      <ReflectionGroup
                        innerRef={this.setGroupRef(group.id)}
                        reflectionGroup={group}
                        retroPhaseItemId={retroPhaseItemId}
                        meeting={meeting}
                      />
                    </ColumnChild>
                  );
                } else if (phaseType === VOTE) {
                  return (
                    <ColumnChild key={group.id}>
                      <ReflectionGroup
                        reflectionGroup={group}
                        retroPhaseItemId={retroPhaseItemId}
                        meeting={meeting}
                      />
                    </ColumnChild>
                  );
                }
                return null;
              })}
            </ReflectionsList>
          </ReflectionsArea>
        </ColumnWrapper>
      </div>
    );
  }
}

reactLifecyclesCompat(PhaseItemColumn);

const reflectionDropSpec = {
  canDrop (props: Props, monitor) {
    const {isSingleCardGroup, currentRetroPhaseItemId} = monitor.getItem();
    return (
      monitor.isOver({shallow: true}) &&
      !isSingleCardGroup &&
      currentRetroPhaseItemId === props.retroPhaseItem.retroPhaseItemId
    );
  },

  // Makes the card-dropped-into available in the dragSpec's endDrag method.
  drop (props: Props, monitor, component) {
    // if (monitor.didDrop()) return;
    const {
      groupRefs,
      state: {columnReflectionGroups}
    } = component;
    const {y} = monitor.getClientOffset();
    let idx = columnReflectionGroups.length;

    for (let ii = 0; ii < columnReflectionGroups.length; ii++) {
      const group = columnReflectionGroups[ii];
      const {id} = group;
      const ref = groupRefs[id];
      if (y < ref.getBoundingClientRect().y) {
        idx = ii;
        break;
      }
    }
    const {reflectionId} = monitor.getItem();
    const {
      atmosphere,
      submitMutation,
      meeting: {meetingId},
      onError,
      onCompleted,
      retroPhaseItem: {retroPhaseItemId}
    } = props;
    let sortOrder;
    if (idx === 0) {
      sortOrder = columnReflectionGroups[0].sortOrder - 1 + dndNoise();
    } else if (idx === columnReflectionGroups.length) {
      sortOrder =
        columnReflectionGroups[columnReflectionGroups.length - 1].sortOrder + 1 + dndNoise();
    } else {
      sortOrder =
        (columnReflectionGroups[idx - 1].sortOrder + columnReflectionGroups[idx].sortOrder) / 2 +
        dndNoise();
    }
    const variables = {
      reflectionId,
      reflectionGroupId: null,
      retroPhaseItemId,
      sortOrder
    };
    submitMutation();
    UpdateReflectionLocationMutation(atmosphere, variables, {meetingId}, onError, onCompleted);
    this.groupRefs = {};
  }
};

const reflectionDropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop()
});

export default createFragmentContainer(
  withAtmosphere(
    withMutationProps(
      dropTarget(REFLECTION_CARD, reflectionDropSpec, reflectionDropCollect)(PhaseItemColumn)
    )
  ),
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
);
