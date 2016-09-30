import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
// import ui from 'universal/styles/ui';

import Type from 'universal/components/Type/Type';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import Sidebar from 'universal/modules/meeting/components/Sidebar/Sidebar';
import SummaryEmailPreview from 'universal/modules/meeting/components/SummaryEmailPreview/SummaryEmailPreview';
import SummaryQuickStats from 'universal/modules/meeting/components/SummaryQuickStats/SummaryQuickStats';

import {makeSuccessExpression} from 'universal/utils/makeSuccessCopy';

import sampleTeamSummary from 'universal/modules/email/helpers/sampleTeamSummary';
import exampleTeam from 'universal/modules/patterns/helpers/exampleTeam';

// NOTE: This is a throw-away layout component for prototyping.
//       The real deal is being coded up in /meeting/components

const MeetingSummaryLayout = (props) => {
  const {styles} = MeetingSummaryLayout;
  const {isFirstMeeting, newOutcomes, team} = props;

  return (
    <MeetingLayout>

      <Sidebar facilitatorPhase="summary" localPhase="summary" {...team} />

      <MeetingMain>
        <MeetingSection flexToFill paddingBottom="2rem">
          <MeetingSection paddingBottom="4rem" paddingTop="4rem">

            <MeetingPhaseHeading>
              Meeting Summary
            </MeetingPhaseHeading>

            <Type align="center" marginBottom="2rem" marginTop="2rem" scale="s5">
              <b>{makeSuccessExpression()}</b>! We worked on{' '}
              <span className={styles.highlight}>7 Agenda Items</span><br />
              resulting in <span className={styles.highlight}>4 New Projects</span>{' '}
              and <span className={styles.highlight}>12 New Actions</span>.<br />
              <span className={styles.highlight}>5 Projects</span> marked as “<b>Done</b>” were archived.
            </Type>

            {isFirstMeeting &&
              <Type align="center" marginBottom="2rem" marginTop="2rem" scale="s4">
                <b>Congrats on your first Action meeting!</b><br />
                Now let’s make it a habit. If you haven’t already,<br />
                schedule a 30:00 minute meeting, preferably<br />
                on Mondays, using the following link:<br />
                <a href="https://prbl.io/a/b7s8x9" title="https://prbl.io/a/b7s8x9">
                {'https://prbl.io/a/b7s8x9'}
                </a>
              </Type>
            }

            <Type align="center">
              <b>Summary Specs:</b>
            </Type>

            <MeetingSection paddingBottom="2rem" paddingTop="2rem">
              <SummaryQuickStats />
            </MeetingSection>
            <MeetingSection paddingBottom="2rem" paddingTop="2rem">
              <SummaryEmailPreview teamOutcomes={newOutcomes} />
            </MeetingSection>

          </MeetingSection>
        </MeetingSection>
      </MeetingMain>
    </MeetingLayout>
  );
};

MeetingSummaryLayout.propTypes = {
  isFirstMeeting: PropTypes.bool,
  newOutcomes: PropTypes.array.isRequired,
  team: PropTypes.object.isRequired
};

MeetingSummaryLayout.defaultProps = {
  isFirstMeeting: true,
  newOutcomes: sampleTeamSummary,
  team: exampleTeam
};

MeetingSummaryLayout.styles = StyleSheet.create({
  root: {
    width: '100%'
  },

  highlight: {
    color: theme.palette.warm,
    fontWeight: 700
  }
});

export default look(MeetingSummaryLayout);
