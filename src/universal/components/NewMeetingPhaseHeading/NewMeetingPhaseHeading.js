/**
 * Renders the heading describing the current meeting phase.
 *
 * @flow
 */
import React from 'react';
import styled from 'react-emotion';
import {Route, Switch} from 'react-router-dom';

import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const ReflectPhaseTitle = styled('h1')({
  fontFamily: appTheme.typography.serif,
  fontSize: '1.5rem',
  margin: 0
});

const ReflectPhaseDescription = styled('h2')({
  color: ui.labelHeadingColor,
  fontSize: '1rem',
  fontWeight: 'normal',
  margin: 0
});

const ReflectPhaseHeading = () => (
  <div>
    <ReflectPhaseTitle>Reflect</ReflectPhaseTitle>
    <ReflectPhaseDescription>Looking back to move forward</ReflectPhaseDescription>
  </div>
);

const MeetingPhaseHeading = () => (
  <Switch>
    <Route
      path="/retro/:teamId/reflect"
      component={ReflectPhaseHeading}
    />
    <Route render={() => <div />} />
  </Switch>
);

export default MeetingPhaseHeading;
