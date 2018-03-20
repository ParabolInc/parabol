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

import AddReflectionButton from 'universal/components/AddReflectionButton/AddReflectionButton';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import AnonymousReflectionCard from 'universal/components/AnonymousReflectionCard/AnonymousReflectionCard';

import ui from 'universal/styles/ui';

type Props = {
  retroPhaseItem: RetroPhaseItem,
  team: Team
};

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

// Actions
const handleClickAddReflection = (retroPhaseItemId: string) => {
  console.log(`Action: adding reflection to retroPhaseItem "${retroPhaseItemId}".`);
};

const handleDelete = (id: string) => {
  console.log(`Action: delete reflection "${id}". Mutation not yet implemented`);
};

const handleSave = (id: string, editorState: EditorState) => {
  console.log(`Action: save reflection "${id}". Mutation not yet implemented. Editor state:`, editorState);
};

const ReflectionTypeColumn = ({team: {newMeeting}, retroPhaseItem}: Props) => (
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
      <AddReflectionButton handleClick={() => handleClickAddReflection(retroPhaseItem.id)} />
    </ReflectionsArea>
  </ColumnWrapper>
);

export default createFragmentContainer(
  ReflectionTypeColumn,
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
