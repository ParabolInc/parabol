/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 *
 * @flow
 */
import type {RetroPhaseItem, Team} from 'universal/types/schema.flow';

// $FlowFixMe
import {EditorState} from 'draft-js';
import React from 'react';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';
import {Environment} from 'relay-runtime';

import AddReflectionButton from 'universal/components/AddReflectionButton/AddReflectionButton';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import AnonymousReflectionCard from 'universal/components/AnonymousReflectionCard/AnonymousReflectionCard';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import CreateReflectionMutation from 'universal/mutations/CreateReflectionMutation';
import ui from 'universal/styles/ui';

// Actions

const handleClickAddReflection = (environment: Environment, meetingId: string, retroPhaseItemId: string) => {
  console.log(`Action: adding reflection to retroPhaseItem "${retroPhaseItemId}".`);
  CreateReflectionMutation(environment, {
    meetingId,
    retroPhaseItemId,
    sortOrder: 0
  });
};

const handleDelete = (id: string) => {
  console.log(`Action: delete reflection "${id}". Mutation not yet implemented`);
};

const handleSave = (id: string, editorState: EditorState) => {
  console.log(`Action: save reflection "${id}". Mutation not yet implemented. Editor state:`, editorState);
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

type Props = {
  atmosphere: Environment,
  retroPhaseItem: RetroPhaseItem,
  team: Team
};

const ReflectionTypeColumn = ({atmosphere, team: {newMeeting}, retroPhaseItem}: Props) => (
  <ColumnWrapper>
    <TypeHeader>
      <TypeTitle>{retroPhaseItem.title.toUpperCase()}</TypeTitle>
      <TypeDescription>{retroPhaseItem.question}</TypeDescription>
    </TypeHeader>
    <ReflectionsArea>
      {newMeeting && newMeeting.reflections && newMeeting.reflections.map((reflection) => (
        reflection.isViewerCreator ? (
          <ReflectionCard
            handleDelete={() => handleDelete(reflection.id)}
            handleSave={(editorState: EditorState) => handleSave(reflection.id, editorState)}
            id={reflection.id}
            contentState={reflection.content}
            key={reflection.id}
          />
        ) : (
          // TODO - needs isEditing, which is unavailable on RetroThought type
          <AnonymousReflectionCard content={reflection.content} key={reflection.id} />
        )
      ))}
      <AddReflectionButton handleClick={() => handleClickAddReflection(atmosphere, newMeeting.id, retroPhaseItem.id)} />
    </ReflectionsArea>
  </ColumnWrapper>
);

export default createFragmentContainer(
  withAtmosphere(ReflectionTypeColumn),
  graphql`
    fragment ReflectionTypeColumn_retroPhaseItem on RetroPhaseItem {
      id
      title
      question
    }

    fragment ReflectionTypeColumn_team on Team {
      newMeeting {
        id
        ...on RetrospectiveMeeting {
          reflections {
            id
            isViewerCreator
            content
          }
        }
      }
    }
  `
);
