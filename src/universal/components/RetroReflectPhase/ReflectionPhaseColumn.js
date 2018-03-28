/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 *
 * @flow
 */
import type {RetroReflection} from 'universal/types/schema.flow';
import type {ReflectionPhaseColumn_meeting as Meeting} from './__generated__/ReflectionPhaseColumn_meeting.graphql';
import type {ReflectionPhaseColumn_retroPhaseItem as RetroPhaseItem} from './__generated__/ReflectionPhaseColumn_retroPhaseItem.graphql';
// $FlowFixMe
import {EditorState} from 'draft-js';
import React, {Component} from 'react';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';

import AddReflectionButton from 'universal/components/AddReflectionButton/AddReflectionButton';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import AnonymousReflectionCard from 'universal/components/AnonymousReflectionCard/AnonymousReflectionCard';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import RemoveReflectionMutation from 'universal/mutations/RemoveReflectionMutation';
import EditReflectionMutation from 'universal/mutations/EditReflectionMutation';
import UpdateReflectionContentMutation from 'universal/mutations/UpdateReflectionContentMutation';
import deserialize from 'universal/utils/draftjs/deserialize';
import serialize from 'universal/utils/draftjs/serialize';
import ui from 'universal/styles/ui';

// Actions

const handleDelete = (environment: Object, reflectionId: string, meetingId: string) => {

};

const handleSave = (environment: Object, reflectionId: string, meetingId: string, editorState: EditorState) => {
  const content = serialize(editorState.getCurrentContent());
  UpdateReflectionContentMutation(
    environment,
    {reflectionId, content},
    meetingId
  );
};

const handleStartEditing = (environment: Object, reflectionId: string, meetingId: string) => {
  EditReflectionMutation(
    environment,
    {reflectionId, isEditing: true},
    meetingId
  );
};

const handleStopEditing = (environment: Object, reflectionId: string, meetingId: string) => {
  EditReflectionMutation(
    environment,
    {reflectionId, isEditing: false},
    meetingId
  );
};

// Components

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

const AddReflectionButtonGroup = styled('div')({
  margin: '0.7rem 0.7rem 0 0'
});

type Props = {
  atmosphere: Object,
  meeting: Meeting,
  retroPhaseItem: RetroPhaseItem
};

type State = {
  columnReflections: Array<RetroReflection>
};

class ReflectionPhaseColumn extends Component<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State): $Shape<State> | null {
    const {meeting: {reflections: nextReflections}, retroPhaseItem: {retroPhaseItemId}} = nextProps;
    if (nextReflections === prevState.reflections) return null;
    return {
      reflections: nextReflections,
      columnReflections: nextReflections.filter((reflection) => reflection.retroPhaseItemId === retroPhaseItemId)
    }
  }

  constructor(props) {
    super(props);
    const {meeting: {reflections}, retroPhaseItem: {retroPhaseItemId}} = props;
    this.state = {
      reflections,
      columnReflections: reflections.filter((reflection) => reflection.retroPhaseItemId === retroPhaseItemId)
    };
  }

  render() {
    const {atmosphere, meeting: {meetingId}, retroPhaseItem} = this.props;
    const {columnReflections} = this.state;
    return (
      <ColumnWrapper>
        <TypeHeader>
          <TypeTitle>{retroPhaseItem.title.toUpperCase()}</TypeTitle>
          <TypeDescription>{retroPhaseItem.question}</TypeDescription>
        </TypeHeader>
        <ReflectionsArea>
          {columnReflections.map((reflection) => (
            <div style={{margin: '0.7rem 0.7rem 0 0'}} key={reflection.id}>
              {reflection.isViewerCreator ? (
                <ReflectionCard
                  handleDelete={() => handleDelete(atmosphere, reflection.id, newMeeting.id)}
                  handleSave={(editorState: EditorState) => handleSave(atmosphere, reflection.id, newMeeting.id, editorState)}
                  handleStartEditing={() => handleStartEditing(atmosphere, reflection.id, newMeeting.id)}
                  handleStopEditing={() => handleStopEditing(atmosphere, reflection.id, newMeeting.id)}
                  id={reflection.id}
                  contentState={deserialize(reflection.content)}
                />
              ) : (
                <AnonymousReflectionCard reflection={reflection} />
              )}
            </div>
          ))}
          <AddReflectionButtonGroup>
            <AddReflectionButton columnReflections={columnReflections} />
          </AddReflectionButtonGroup>
        </ReflectionsArea>
      </ColumnWrapper>
    )
  }
};

export default createFragmentContainer(
  withAtmosphere(ReflectionPhaseColumn),
  graphql`
    fragment ReflectionPhaseColumn_retroPhaseItem on RetroPhaseItem {
      retroPhaseItemId: id
      title
      question
    }

    fragment ReflectionPhaseColumn_meeting on RetrospectiveMeeting {
      meetingId: id
      reflections {
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
