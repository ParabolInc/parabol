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

import {meetingTypeToSlug, phaseTypeToSlug} from 'universal/utils/meetings/lookups';
import {RETROSPECTIVE, CHECKIN, REFLECT, GROUP, VOTE, DISCUSS} from 'universal/utils/constants';

const PhaseTitle = styled('h1')({
  fontFamily: appTheme.typography.serif,
  fontSize: '1.5rem',
  margin: 0
});

const PhaseActionCopy = styled('h2')({
  color: ui.labelHeadingColor,
  fontSize: appTheme.typography.s2,
  fontWeight: 400,
  margin: 0
});

const CheckInPhaseHeading = () => (
  <div>
    <PhaseTitle>{'Social Check-In'}</PhaseTitle>
    <PhaseActionCopy>{'Share your response to today’s prompt'}</PhaseActionCopy>
  </div>
);

const ReflectPhaseHeading = () => (
  <div>
    <PhaseTitle>{'Reflect'}</PhaseTitle>
    <PhaseActionCopy>{'Add anonymous reflections for each prompt'}</PhaseActionCopy>
  </div>
);

const GroupPhaseHeading = () => (
  <div>
    <PhaseTitle>{'Theme'}</PhaseTitle>
    <PhaseActionCopy>{'Drag cards to group by common themes'}</PhaseActionCopy>
  </div>
);

const VotePhaseHeading = () => (
  <div>
    <PhaseTitle>{'Vote'}</PhaseTitle>
    <PhaseActionCopy>{'Vote on the themes you want to discuss'}</PhaseActionCopy>
  </div>
);

const DiscussPhaseHeading = () => (
  <div>
    <PhaseTitle>{'Discuss'}</PhaseTitle>
    <PhaseActionCopy>{'Create takeaway task cards to capture next steps'}</PhaseActionCopy>
  </div>
);

const retroSlug = meetingTypeToSlug[RETROSPECTIVE];

const MeetingPhaseHeading = () => (
  <Switch>
    <Route
      path={`/${retroSlug}/:teamId/${phaseTypeToSlug[CHECKIN]}`}
      component={CheckInPhaseHeading}
    />
    <Route
      path={`/${retroSlug}/:teamId/${phaseTypeToSlug[REFLECT]}`}
      component={ReflectPhaseHeading}
    />
    <Route
      path={`/${retroSlug}/:teamId/${phaseTypeToSlug[GROUP]}`}
      component={GroupPhaseHeading}
    />
    <Route
      path={`/${retroSlug}/:teamId/${phaseTypeToSlug[VOTE]}`}
      component={VotePhaseHeading}
    />
    <Route
      path={`/${retroSlug}/:teamId/${phaseTypeToSlug[DISCUSS]}`}
      component={DiscussPhaseHeading}
    />
    <Route render={() => <div />} />
  </Switch>
);

export default MeetingPhaseHeading;
