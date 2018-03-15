/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 * @flow
 */
import React from 'react';
import styled from 'react-emotion';

import ReflectionTypeColumn from './ReflectionTypeColumn';

const ReflectPhaseWrapper = styled('div')({
  height: '100%',
  display: 'flex',
  justifyContent: 'space-around',
  width: '100%'
});

const RetroReflectPhase = () => (
  <ReflectPhaseWrapper>
    <ReflectionTypeColumn description="What’s working?" title="POSITIVE" />
    <ReflectionTypeColumn description="Where did you get stuck?" title="NEGATIVE" />
  </ReflectPhaseWrapper>
);

export default RetroReflectPhase;
