/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 *
 * @flow
 */
import type {RetroPhaseItem} from 'universal/types/schema.flow';

import React from 'react';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';

import AddReflectionButton from 'universal/components/AddReflectionButton/AddReflectionButton';

import ui from 'universal/styles/ui';

type Props = {
  retroPhaseItem: RetroPhaseItem
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

const ReflectionTypeColumn = ({retroPhaseItem: {title, question}}: Props) => (
  <ColumnWrapper>
    <TypeHeader>
      <TypeTitle>{title.toUpperCase()}</TypeTitle>
      <TypeDescription>{question}</TypeDescription>
    </TypeHeader>
    <ReflectionsArea>
      <AddReflectionButton handleClick={() => console.log('clicked!')} />
    </ReflectionsArea>
  </ColumnWrapper>
);

export default createFragmentContainer(
  ReflectionTypeColumn,
  graphql`
    fragment ReflectionTypeColumn_retroPhaseItem on RetroPhaseItem {
      title
      question
    }
  `
);
