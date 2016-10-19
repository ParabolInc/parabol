import React, {PropTypes} from 'react';
import appTheme from 'universal/styles/theme/appTheme';

import Body from '../../components/Body/Body';
import ContactUs from '../../components/ContactUs/ContactUs';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import Footer from '../../components/Footer/Footer';
import Layout from '../../components/Layout/Layout';
import QuickStats from '../../components/QuickStats/QuickStats';
import SummaryHeader from '../../components/SummaryHeader/SummaryHeader';
import UserOutcomes from '../../components/UserOutcomes/UserOutcomes';

import sampleTeamSummary from '../../helpers/sampleTeamSummary';

const SummaryEmail = (props) => {
  const {
    // forFirstMeeting,
    meetingDate,
    teamDashLink,
    teamMembers,
    teamName,
    totalAgendaItems,
    totalArchivedProjects,
    totalNewActions,
    totalNewProjects
  } = props;

  const highlight = {
    color: appTheme.palette.warm,
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

  return (
    <Layout>

      <table width="100%">
        <tbody>
          <tr>
            <td
              align="center"
              style={{backgroundColor: appTheme.palette.warm}}
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
              <SummaryHeader meetingDate={meetingDate} teamDashLink={teamDashLink} teamName={teamName} />
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

        <table align="center" width="100%">
          <tr>
            <td align="center" style={{padding: '0 8px'}}>
              <QuickStats />
            </td>
          </tr>
        </table>

        {teamMembers.map(member =>
          <UserOutcomes avatar={member.avatar} name={member.name} outcomes={member.outcomes} />
        )}

        <EmptySpace height={32} />
        <hr style={ruleStyle} />
        <EmptySpace height={32} />
        <ContactUs fontSize={18} lineHeight={1.5} prompt="How’d your meeting go?" vSpacing={0} />
      </Body>
      <Footer color={appTheme.palette.dark} />
    </Layout>
  );
};

SummaryEmail.propTypes = {
  forFirstMeeting: PropTypes.bool,
  meetingDate: PropTypes.string,
  teamDashLink: PropTypes.string,
  teamName: PropTypes.string,
  teamMembers: PropTypes.array,
  totalAgendaItems: PropTypes.number,
  totalArchivedProjects: PropTypes.number,
  totalNewActions: PropTypes.number,
  totalNewProjects: PropTypes.number
};

SummaryEmail.defaultProps = {
  forFirstMeeting: true,
  meetingDate: 'Tuesday, October 18th, 2016',
  teamDashLink: '/team/team123/',
  teamName: 'Parabol Product',
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
