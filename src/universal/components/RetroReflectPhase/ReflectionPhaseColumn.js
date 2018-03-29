/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 *
 * @flow
 */
import type {ReflectionPhaseColumn_meeting as Meeting} from './__generated__/ReflectionPhaseColumn_meeting.graphql';
import type {ReflectionPhaseColumn_retroPhaseItem as RetroPhaseItem} from './__generated__/ReflectionPhaseColumn_retroPhaseItem.graphql';
// $FlowFixMe
import React, {Component} from 'react';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';

import AddReflectionButton from 'universal/components/AddReflectionButton/AddReflectionButton';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import AnonymousReflectionCard from 'universal/components/AnonymousReflectionCard/AnonymousReflectionCard';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import ui from 'universal/styles/ui';
import reactLifecyclesCompat from 'react-lifecycles-compat';

const ColumnWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column'
});

const ReflectionsArea = styled('div')({
  flexDirection: 'column',
  overflow: 'auto'
});

const TypeDescription = styled('div')({
  fontSize: '1.2rem',
  fontWeight: 'bold'
});

const TypeHeader = styled('div')({
  marginBottom: '2rem'
});

const TypeTitle = styled('div')({
  color: ui.labelHeadingColor
});

const ColumnChild = styled('div')({
  margin: '0.7rem 0.7rem 0 0'
});

type Props = {
  atmosphere: Object,
  meeting: Meeting,
  retroPhaseItem: RetroPhaseItem
};

type State = {
  columnReflections: $ReadOnlyArray<Object>,
  reflections: $ReadOnlyArray<Object>
};

class ReflectionPhaseColumn extends Component<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State): $Shape<State> | null {
    const {meeting: {reflections: nextReflections}, retroPhaseItem: {retroPhaseItemId}} = nextProps;
    if (nextReflections === prevState.reflections) return null;
    return {
      reflections: nextReflections,
      columnReflections: nextReflections.filter((reflection) => reflection.retroPhaseItemId === retroPhaseItemId)
    };
  }

  state = {
    reflections: [],
    columnReflections: []
  };

  render() {
    const {meeting, retroPhaseItem} = this.props;
    const {columnReflections} = this.state;
    return (
      <ColumnWrapper>
        <TypeHeader>
          <TypeTitle>{retroPhaseItem.title.toUpperCase()}</TypeTitle>
          <TypeDescription>{retroPhaseItem.question}</TypeDescription>
        </TypeHeader>
        <ReflectionsArea>
          {columnReflections.map((reflection) => (
            <ColumnChild key={reflection.id}>
              {reflection.isViewerCreator ?
                <ReflectionCard canDelete meeting={meeting} reflection={reflection} /> :
                <AnonymousReflectionCard meeting={meeting} reflection={reflection} />
              }
            </ColumnChild>
          ))}
          <ColumnChild>
            <AddReflectionButton columnReflections={columnReflections} meeting={meeting} retroPhaseItem={retroPhaseItem} />
          </ColumnChild>
        </ReflectionsArea>
      </ColumnWrapper>
    );
  }
}

reactLifecyclesCompat(ReflectionPhaseColumn);

export default createFragmentContainer(
  withAtmosphere(ReflectionPhaseColumn),
  graphql`
    fragment ReflectionPhaseColumn_retroPhaseItem on RetroPhaseItem {
      ...AddReflectionButton_retroPhaseItem
      retroPhaseItemId: id
      title
      question
    }

    fragment ReflectionPhaseColumn_meeting on RetrospectiveMeeting {
      ...AddReflectionButton_meeting
      ...AnonymousReflectionCard_meeting
      ...ReflectionCard_meeting
      meetingId: id
      reflections {
        ...AnonymousReflectionCard_reflection
        ...ReflectionCard_reflection
        content
        id
        isEditing
        isViewerCreator
        retroPhaseItemId
        sortOrder
      }
    }
  `
);
