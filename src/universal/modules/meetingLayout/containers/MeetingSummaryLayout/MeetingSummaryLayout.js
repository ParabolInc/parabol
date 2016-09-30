import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';

import Type from 'universal/components/Type/Type';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import Sidebar from 'universal/modules/meeting/components/Sidebar/Sidebar';
import SummaryEmailPreview from 'universal/modules/meeting/components/SummaryEmailPreview/SummaryEmailPreview';

import Jordan from 'universal/styles/theme/images/avatars/jordan-husney-avatar.jpg';
import Matt from 'universal/styles/theme/images/avatars/matt-krick-avatar.jpg';
import Taya from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';
import Terry from 'universal/styles/theme/images/avatars/terry-acker-avatar.jpg';

import {makeSuccessExpression} from 'universal/utils/makeSuccessCopy';
import sampleTeamSummary from 'universal/modules/email/helpers/sampleTeamSummary';

// NOTE: This is a throw-away layout component for prototyping.
//       The real deal is being coded up in /meeting/components

const exampleSummary = {
  placeholdersAdded: 12,
  placeholdersProcessed: 7,
  newOutcomes: [
    {
      type: 'project',
      outcome: 'Important mission accomplished',
      owner: {
        preferredName: 'Jordan Husney'
      }
    },
    {
      type: 'action',
      outcome: 'Important task completed',
      owner: {
        preferredName: 'Matt Krick'
      }
    },
    {
      type: 'project',
      outcome: 'Important mission accomplished',
      owner: {
        preferredName: 'Taya Mueller'
      }
    },
    {
      type: 'action',
      outcome: 'Important task completed',
      owner: {
        preferredName: 'Taya Mueller'
      }
    },
    {
      type: 'action',
      outcome: 'Important task completed',
      owner: {
        preferredName: 'Terry Acker'
      }
    }
  ]
};

const exampleTeam = {
  shortUrl: 'https://prbl.io/a/b7s8x9',
  teamName: 'Core',
  timerValue: '30:00',
  members: [
    {
      preferredName: 'Jordan Husney',
      picture: Jordan
    },
    {
      preferredName: 'Matt Krick',
      picture: Matt
    },
    {
      preferredName: 'Taya Mueller',
      picture: Taya
    },
    {
      preferredName: 'Terry Acker',
      picture: Terry
    }
  ]
};

const MeetingSummaryLayout = (props) => {
  const {styles} = MeetingSummaryLayout;
  const {isFirstMeeting, summary, team} = props;

  const {newOutcomes} = summary;

  const getNewOutcomeTypeCount = (string) => {
    return newOutcomes.reduce((p, c) => {
      if (c.type === string) {
        p++;
      }
      return p;
    }, 0);
  };

  return (
    <MeetingLayout>
      {/* */}
      <Sidebar facilitatorPhase="summary" localPhase="summary" {...team} />
      {/* */}
      <MeetingMain>
        {/* */}
        <MeetingSection flexToFill paddingBottom="2rem">
          {/* */}
          <MeetingSection paddingBottom="4rem" paddingTop="4rem">
            {/* */}
            <MeetingPhaseHeading>
              Meeting Summary
            </MeetingPhaseHeading>
            {/* */}
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
            {/* */}
            <Type align="center">
              <b>Summary Specs:</b><br />
              <span>Requests processed: {summary.placeholdersProcessed} of {summary.placeholdersAdded}</span><br />
              <span>Projects created: {getNewOutcomeTypeCount('project')}</span><br />
              <span>Actions created: {getNewOutcomeTypeCount('action')}</span><br />
            </Type>
            {/* */}
            <MeetingSection paddingBottom="2rem" paddingTop="2rem">
              {/* */}
              <SummaryEmailPreview teamOutcomes={sampleTeamSummary} />
              {/* */}
            </MeetingSection>
            {/* */}
          </MeetingSection>
          {/* */}
        </MeetingSection>
        {/* */}
      </MeetingMain>
      {/* */}
    </MeetingLayout>
  );
};

MeetingSummaryLayout.propTypes = {
  isFirstMeeting: PropTypes.bool,
  summary: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired
};

MeetingSummaryLayout.defaultProps = {
  isFirstMeeting: true,
  summary: exampleSummary,
  team: exampleTeam
};

MeetingSummaryLayout.styles = StyleSheet.create({
  summaryPreview: {
    backgroundColor: ui.emailBackgroundColor,
    border: `1px solid ${theme.palette.mid30l}`,
    margin: '0 auto',
    maxWidth: '37.5rem',
    padding: '1.5rem',
    width: '100%'
  },

  summaryItem: {
    margin: '0 auto',
    maxWidth: '24rem',
    padding: '2rem 0',
    textAlign: 'left',
    width: '100%'
  },

  summaryOutcome: {
    paddingLeft: '3.5625rem'
  },

  highlight: {
    color: theme.palette.warm,
    fontWeight: 700
  }
});

export default look(MeetingSummaryLayout);
