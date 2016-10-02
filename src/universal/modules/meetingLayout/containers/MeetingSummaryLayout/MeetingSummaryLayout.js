import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';

import Avatar from 'universal/components/Avatar/Avatar';
import Type from 'universal/components/Type/Type';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import Sidebar from '../../../meeting/components/Sidebar/Sidebar';

import Jordan from 'universal/styles/theme/images/avatars/jordan-husney-avatar.jpg';
import Matt from 'universal/styles/theme/images/avatars/matt-krick-avatar.jpg';
import Taya from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';
import Terry from 'universal/styles/theme/images/avatars/terry-acker-avatar.jpg';

// NOTE: This is a throw-away layout component for prototyping.
//       The real deal is being coded up in /meeting/components

let s = {};

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

  const getOutcomesByMember = (preferredName, outcomes) => {
    const filterByName = (value) =>
      value.owner.preferredName === preferredName;
    const filtered = outcomes.filter(filterByName);
    return filtered;
  };

  const makeMemberSummary = (member, index, outcomes) =>
    <div className={s.summaryItem} key={index}>
      <Avatar
        hasLabel
        image={member.avatar}
        labelRight
        name={member.preferredName}
      />
      {outcomes.map((item, idx) =>
        <div className={s.summaryOutcome} key={idx}>
          <Type align="left">
            <b>{item.type}</b>: {item.outcome}
          </Type>
        </div>
      )}
    </div>;

  const showMemberOutcomes = (teamMembers) =>
    teamMembers.map((member, idx) => {
      const filteredOutcomes = getOutcomesByMember(member.preferredName, newOutcomes);
      return makeMemberSummary(member, idx, filteredOutcomes);
    });

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
            <Type align="center" bold family="serif" scale="s6" theme="warm">
              Meeting Summary
            </Type>
            {/* */}
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
              <br />
              <b>Note</b>: <i>All Projects marked as “Done” were automatically archived</i>.<br />
            </Type>
            <Type align="center" marginTop="2rem" theme="warm">
              <b>Design TODO</b>: This view still ain’t purty, going to make it look way bettah! (TA)
            </Type>
            {/* */}
            <MeetingSection paddingBottom="2rem" paddingTop="2rem">
              {/* */}
              <div className={s.summaryPreview}>
                {showMemberOutcomes(team.members)}
              </div>
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

const styleThunk = () => ({
  summaryPreview: {
    backgroundColor: appTheme.palette.light30l,
    border: `1px solid ${appTheme.palette.light80d}`,
    margin: '0 auto',
    maxWidth: '37.5rem',
    padding: '1rem 2rem',
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
  }
});

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

export default withStyles(styleThunk)(MeetingSummaryLayout);
