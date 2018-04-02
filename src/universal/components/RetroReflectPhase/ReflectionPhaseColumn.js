/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 *
 * @flow
 */
import type {RetroPhaseItem, RetroReflection, Team} from 'universal/types/schema.flow';
import type TeamFragment from './__generated__/ReflectionPhaseColumn_team.graphql';

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
import UpdateReflectionIsEditingMutation from 'universal/mutations/UpdateReflectionIsEditingMutation';
import UpdateReflectionContentMutation from 'universal/mutations/UpdateReflectionContentMutation';
import deserialize from 'universal/utils/draftjs/deserialize';
import serialize from 'universal/utils/draftjs/serialize';
import getNextSortOrder from 'universal/utils/getNextSortOrder';
import {LabelHeading} from 'universal/components';

// Helpers

const forPhaseItem = (retroPhaseItemId: string, reflections: Array<TeamFragment>) => (
  reflections
    .filter((reflection) => reflection.retroPhaseItemId === retroPhaseItemId)
);

// Actions

const handleClickAddReflection = (
  environment: Environment,
  meetingId: string,
  retroPhaseItemId: string,
  reflections: Array<RetroReflection>
) => {
  CreateReflectionMutation(environment, {
    meetingId,
    retroPhaseItemId,
    sortOrder: getNextSortOrder(reflections)
  });
};

const handleDelete = (environment: Environment, reflectionId: string, meetingId: string) => {
  RemoveReflectionMutation(
    environment,
    {reflectionId},
    meetingId
  );
};

const handleSave = (environment: Environment, reflectionId: string, meetingId: string, editorState: EditorState) => {
  const content = serialize(editorState.getCurrentContent());
  UpdateReflectionContentMutation(
    environment,
    {reflectionId, content},
    meetingId
  );
};

const handleStartEditing = (environment: Environment, reflectionId: string, meetingId: string) => {
  UpdateReflectionIsEditingMutation(
    environment,
    {reflectionId, isEditing: true},
    meetingId
  );
};

const handleStopEditing = (environment: Environment, reflectionId: string, meetingId: string) => {
  UpdateReflectionIsEditingMutation(
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
  fontSize: '1.25rem',
  fontWeight: 600
});

const TypeHeader = styled('div')({
  marginBottom: '2rem'
});

type Props = {
  atmosphere: Environment,
  retroPhaseItem: RetroPhaseItem,
  team: Team
};

const ReflectionPhaseColumn = ({atmosphere, team: {newMeeting}, retroPhaseItem}: Props) => (
  newMeeting && (
    <ColumnWrapper>
      <TypeHeader>
        <LabelHeading>{retroPhaseItem.title.toUpperCase()}</LabelHeading>
        <TypeDescription>{retroPhaseItem.question}</TypeDescription>
      </TypeHeader>
      <ReflectionsArea>
        {newMeeting.reflections && forPhaseItem(retroPhaseItem.id, newMeeting.reflections).map((reflection) => (
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
              <AnonymousReflectionCard contentState={deserialize(reflection.content)} isEditing={reflection.isEditing} />
            )}
          </div>
        ))}
        <div style={{margin: '0.7rem 0.7rem 0 0'}}>
          <AddReflectionButton
            handleClick={() => handleClickAddReflection(
              atmosphere, newMeeting.id, retroPhaseItem.id, newMeeting.reflections || []
            )}
          />
        </div>
      </ReflectionsArea>
    </ColumnWrapper>
  )
);

export default createFragmentContainer(
  withAtmosphere(ReflectionPhaseColumn),
  graphql`
    fragment ReflectionPhaseColumn_retroPhaseItem on RetroPhaseItem {
      id
      title
      question
    }

    fragment ReflectionPhaseColumn_team on Team {
      newMeeting {
        id
        ...on RetrospectiveMeeting {
          reflections {
            content
            id
            isEditing
            isViewerCreator
            retroPhaseItemId
            sortOrder
          }
        }
      }
    }
  `
);
