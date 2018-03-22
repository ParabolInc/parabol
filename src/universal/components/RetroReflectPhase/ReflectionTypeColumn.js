/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 *
 * @flow
 */
import type {RetroPhaseItem, Team} from 'universal/types/schema.flow';
import type TeamFragment from './__generated__/ReflectionTypeColumn_team.graphql';

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
import RemoveReflectionMutation from 'universal/mutations/RemoveReflectionMutation';
import deserialize from 'universal/utils/draftjs/deserialize';
import ui from 'universal/styles/ui';

// Helpers

const forPhaseItem = (retroPhaseItemId: string, reflections: Array<TeamFragment>) => (
  reflections
    .filter((reflection) => reflection.retroPhaseItemId === retroPhaseItemId)
);

// Actions

const handleClickAddReflection = (environment: Environment, meetingId: string, retroPhaseItemId: string) => {
  CreateReflectionMutation(environment, {
    meetingId,
    retroPhaseItemId,
    sortOrder: 0
  });
};

const handleDelete = (environment: Environment, reflectionId: string, meetingId: string) => {
  RemoveReflectionMutation(
    environment,
    {reflectionId},
    meetingId
  );
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
  newMeeting && (
    <ColumnWrapper>
      <TypeHeader>
        <TypeTitle>{retroPhaseItem.title.toUpperCase()}</TypeTitle>
        <TypeDescription>{retroPhaseItem.question}</TypeDescription>
      </TypeHeader>
      <ReflectionsArea>
        {newMeeting.reflections && forPhaseItem(retroPhaseItem.id, newMeeting.reflections).map((reflection) => (
          <div style={{margin: '0.5rem'}} key={reflection.id}>
            {reflection.isViewerCreator ? (
              <ReflectionCard
                handleDelete={() => handleDelete(atmosphere, reflection.id, newMeeting.id)}
                handleSave={(editorState: EditorState) => handleSave(reflection.id, editorState)}
                id={reflection.id}
                contentState={deserialize(reflection.content)}
              />
            ) : (
              // TODO - needs isEditing, which is unavailable on RetroThought type
              <AnonymousReflectionCard content={reflection.content} />
            )}
          </div>
        ))}
        <div style={{margin: '0.5rem'}}>
          <AddReflectionButton handleClick={() => handleClickAddReflection(atmosphere, newMeeting.id, retroPhaseItem.id)} />
        </div>
      </ReflectionsArea>
    </ColumnWrapper>
  )
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
            retroPhaseItemId
          }
        }
      }
    }
  `
);
