import React, {PropTypes} from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

import Body from '../../components/Body/Body';
import ContactUs from '../../components/ContactUs/ContactUs';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import Footer from '../../components/Footer/Footer';
import Layout from '../../components/Layout/Layout';
import QuickStats from '../../components/QuickStats/QuickStats';
import SummaryHeader from '../../components/SummaryHeader/SummaryHeader';
import UserOutcomes from '../../components/UserOutcomes/UserOutcomes';
import UserNoNewOutcomes from '../../components/UserNoNewOutcomes/UserNoNewOutcomes';

import {makeSuccessExpression, makeSuccessStatement} from 'universal/utils/makeSuccessCopy';
import sampleTeamSummary from '../../helpers/sampleTeamSummary';

const SummaryEmail = (props) => {
  const {
    bannerMessage,
    meetingCount,
    meetingDate,
    meetingLobbyLink,
    teamDashLink,
    teamMembers,
    teamName,
    totalAgendaItems,
    totalNewActions,
    totalNewProjects
  } = props;

  const ruleStyle = {
    backgroundColor: '#E1E2E8',
    border: 0,
    height: '2px',
    margin: 0,
    width: '100%'
  };

  const message = {
    color: appTheme.palette.dark,
    fontFamily: ui.emailFontFamily,
    fontSize: '18px',
    lineHeight: '28px',
  };

  const linkStyles = {
    color: appTheme.palette.warm,
    fontWeight: 700
  };

  const greetingStyles = {
    fontSize: '27px',
    lineHeight: '40px',
  };

  const bannerMessageStyles = {
    color: '#ffffff',
    fontFamily: ui.emailFontFamily,
    fontSize: '16px',
    fontWeight: 700,
    textAlign: 'center'
  };

  const meetingLinkBlock = {
    backgroundColor: appTheme.palette.cool10l,
    padding: '10px 8px'
  };

  const meetingLink = {
    color: appTheme.palette.cool,
    textAlign: 'center'
  };

  const membersSansOutcomes = [];
  const membersWithOutcomes = [];
  const presentMembers = [];

  teamMembers.map(member => {
    if (member.outcomes.length) {
      membersWithOutcomes.push(member);
    } else {
      membersSansOutcomes.push(member);
    }
    if (member.present) {
      presentMembers.push(member);
    }
    return 'hola';
  });

  return (
    <Layout>
      <table width="100%">
        <tbody>
          <tr>
            <td
              align="center"
              style={{backgroundColor: appTheme.palette.warm}}
            >
              <EmptySpace height={8} />
              {bannerMessage &&
                <div style={bannerMessageStyles}>
                  {bannerMessage}
                </div>
              }
              <EmptySpace height={8} />
            </td>
          </tr>
        </tbody>
      </table>
      <Body verticalGutter="0">
        <table align="center" width="100%">
          <tr>
            <td align="center">
              <SummaryHeader meetingDate={meetingDate} teamDashLink={teamDashLink} teamName={teamName} />
              {meetingCount === 0 ?
                <div>
                  <div style={message}>
                    <b style={greetingStyles}>{makeSuccessExpression()}!</b><br />
                    {'Way to go on your first Action Meeting!'}<br />
                    {'You are unlocking new superpowers.'}<br />
                    <br />
                    <b style={greetingStyles}>{'Make it a habit:'}</b><br />
                    {'If you haven’t already, schedule a 30 minute meeting,'}<br />
                    {'preferably recurring on Mondays or Tuesdays.'}<br />
                    {'Include the following link to the meeting lobby'}<br />
                    {'in your recurring calendar event:'}
                    <EmptySpace height={8} />
                    <table align="center" width="80%">
                      <tr>
                        <td align="center" style={meetingLinkBlock}>
                          <a href={`https://prbl.io${meetingLobbyLink}`} style={meetingLink}>
                            {`https://prbl.io${meetingLobbyLink}`}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div> :
                <div>
                  {totalAgendaItems === 0 ?
                    <div style={message}>
                      <b style={greetingStyles}>{'Hey there!'}</b><br />
                      {'It looks like there weren’t any agenda items.'}<br />
                      {'Did our software give you trouble?'}<br />
                      {'Let us know: '}
                      <a href="mailto:love@parabol.co" style={linkStyles} title="Email us at: love@parabol.co">love@parabol.co</a>
                    </div> :
                    <div style={message}>
                      <b style={greetingStyles}>{makeSuccessExpression()}!</b><br />
                      {makeSuccessStatement()}
                    </div>
                  }
                </div>
              }
              <EmptySpace height={8} />
            </td>
          </tr>
        </table>
        <table align="center" width="100%">
          <tr>
            <td align="center" style={{padding: '0 8px'}}>
              <QuickStats
                agendaItems={totalAgendaItems}
                newProjects={totalNewProjects}
                newActions={totalNewActions}
                teamMembers={teamMembers.length}
                teamMembersPresent={presentMembers.length}
              />
            </td>
          </tr>
        </table>
        {membersWithOutcomes.map(member =>
          <UserOutcomes
            avatar={member.avatar}
            name={member.name}
            outcomes={member.outcomes}
            present={member.present}
          />
        )}
        {membersSansOutcomes.length &&
          <UserNoNewOutcomes members={membersSansOutcomes} />
        }
        <EmptySpace height={0} />
        <hr style={ruleStyle} />
        <EmptySpace height={48} />
        <ContactUs
          fontSize={18}
          hasLearningLink
          lineHeight={1.5}
          prompt="How’d your meeting go?"
          tagline="We’re eager for your feedback!"
          vSpacing={0}
        />
        <EmptySpace height={32} />
      </Body>
      <Footer color={appTheme.palette.dark} />
    </Layout>
  );
};

SummaryEmail.propTypes = {
  bannerMessage: PropTypes.any,
  meetingCount: PropTypes.number,
  meetingDate: PropTypes.string,
  meetingLobbyLink: PropTypes.string,
  teamDashLink: PropTypes.string,
  teamName: PropTypes.string,
  teamMembers: PropTypes.array,
  totalAgendaItems: PropTypes.number,
  totalNewActions: PropTypes.number,
  totalNewProjects: PropTypes.number
};

SummaryEmail.defaultProps = {
  bannerMessage: <span>All team members will receive this summary in their inbox.</span>,
  meetingCount: 1,
  meetingDate: 'Tuesday, October 18th, 2016',
  meetingLobbyLink: '/meeting/team123/',
  teamDashLink: '/team/team123/',
  teamName: 'Parabol Product',
  teamMembers: sampleTeamSummary,
  totalAgendaItems: 21,
  totalNewActions: 12,
  totalNewProjects: 5
};

export const summaryEmailText = (props) =>
`Hello ${props.teamName}! As a team you discussed ${props.totalAgendaItems} Agenda Items${' '}
resulting in ${props.totalNewProjects} New Projects${' '}
and ${props.totalNewActions} New Actions.${' '}`;

export default SummaryEmail;
