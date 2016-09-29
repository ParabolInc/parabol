import React, {PropTypes} from 'react';
import theme from 'universal/styles/theme';
import getWeekOfYear from 'universal/utils/getWeekOfYear';

import Body from '../../components/Body/Body';
import Callout from '../../components/Callout/Callout';
import ContactUs from '../../components/ContactUs/ContactUs';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import GetStarted from '../../components/GetStarted/GetStarted';
import Footer from '../../components/Footer/Footer';
import Layout from '../../components/Layout/Layout';
import UserOutcomes from '../../components/UserOutcomes/UserOutcomes';

import sampleTeamSummary from '../../helpers/sampleTeamSummary';

const expressions = [
  'Great job',
  'High five',
  'Wowza',
  'Boom',
  'Woot, woot'
];

const statements = [
  'You are on a roll!',
  'One step closer to world domination!',
  'Looks like things are moving along!',
  'Making progress, little by little!',
  'You are unstoppable!'
];

const SummaryEmail = (props) => {
  const {
    forFirstMeeting,
    meetingDate,
    teamMembers,
    teamName,
    totalAgendaItems,
    totalArchivedProjects,
    totalNewActions,
    totalNewProjects
  } = props;

  const now = new Date();
  const week = getWeekOfYear(now);

  const getExpression = () => expressions[week % expressions.length];
  const getStatement = () => statements[week % statements.length];

  const highlight = {
    color: theme.palette.warm,
    fontWeight: 700
  };

  const meetingDateStyle = {
    color: theme.palette.dark,
    fontSize: '16px',
    fontWeight: 700
  };

  const ruleStyle = {
    backgroundColor: '#E1E2E8',
    border: 0,
    height: '2px',
    margin: 0,
    width: '80%'
  };

  const statsMessage = {
    fontSize: '18px',
    lineHeight: '28px',
  };

  const teamNameStyle = {
    color: theme.palette.warm
  };

  return (
    <Layout>

      <table width="100%">
        <tbody>
          <tr>
            <td
              align="center"
              style={{backgroundColor: theme.palette.warm}}
            >
              <EmptySpace height={16} />
            </td>
          </tr>
        </tbody>
      </table>

      <Body verticalGutter="32">
        <table align="center" width="100%">
          <tr>
            <td align="center">
              <span style={meetingDateStyle}>Action Meeting Summary<br />{meetingDate}</span>
              <Callout vSpacing={32}>
                {getExpression()}, <span style={teamNameStyle}>{teamName}</span>—<br />
                {getStatement()}
              </Callout>
              <span style={statsMessage}>
                As a team you discussed <span style={highlight}>{totalAgendaItems} Agenda Items</span><br />
                resulting in <span style={highlight}>{totalNewProjects} New Projects</span>{' '}
                and <span style={highlight}>{totalNewActions} New Actions</span>.<br />
                <span style={highlight}>{totalArchivedProjects} Projects</span> marked as “<b>Done</b>” were archived.
              </span>
              <EmptySpace height={32} />
            </td>
          </tr>
        </table>

        {teamMembers.map(member =>
          <UserOutcomes avatar={member.avatar} name={member.name} outcomes={member.outcomes} />
        )}

        <EmptySpace height={32} />
        {forFirstMeeting &&
          <table align="center" width="100%">
            <tr>
              <td align="center">
                <GetStarted />
                <EmptySpace height={32} />
                <hr style={ruleStyle} />
              </td>
            </tr>
          </table>
        }
        <EmptySpace height={32} />
        <ContactUs fontSize={18} lineHeight={1.5} vSpacing={0} />
      </Body>
      <Footer color={theme.palette.dark} />
    </Layout>
  );
};

SummaryEmail.propTypes = {
  forFirstMeeting: PropTypes.bool,
  meetingDate: PropTypes.string,
  teamName: PropTypes.string,
  teamMembers: PropTypes.array,
  totalAgendaItems: PropTypes.number,
  totalArchivedProjects: PropTypes.number,
  totalNewActions: PropTypes.number,
  totalNewProjects: PropTypes.number
};

SummaryEmail.defaultProps = {
  forFirstMeeting: false,
  meetingDate: 'Tuesday, September 27th, 2016',
  teamName: 'Parabol',
  teamMembers: sampleTeamSummary,
  totalAgendaItems: 7,
  totalArchivedProjects: 5,
  totalNewActions: 12,
  totalNewProjects: 4
};

export const summaryEmailText = (props) =>
`Hello ${props.teamName}! As a team you discussed ${props.totalAgendaItems} Agenda Items${' '}
resulting in ${props.totalNewProjects} New Projects${' '}
and ${props.totalNewActions} New Actions.${' '}
${props.totalArchivedProjects} Projects marked as “Done” were archived.`;

export default SummaryEmail;
