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

const ruleStyle = {
  backgroundColor: ui.emailRuleColor,
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
  padding: '0 16px',
  textAlign: 'center'
};

const linkStyles = {
  color: appTheme.palette.warm,
  fontWeight: 700,
  textDecoration: 'none'
};

const greetingStyles = {
  fontSize: '27px',
  lineHeight: '40px',
};

const bannerStyle = {
  backgroundColor: appTheme.palette.warm,
  textAlign: 'center'
};

const bannerMessageStyles = {
  color: '#ffffff',
  fontFamily: ui.emailFontFamily,
  fontSize: '16px',
  fontWeight: 700,
  textAlign: 'center'
};

const meetingLinkTable = {
  marginLeft: 'auto',
  marginRight: 'auto'
};

const meetingLinkBlock = {
  backgroundColor: appTheme.palette.cool10l,
  padding: '10px 8px',
  textAlign: 'center'
};

const meetingLink = {
  color: appTheme.palette.cool,
  textAlign: 'center'
};

const bannerLink = {
  color: '#FFFFFF',
  cursor: 'pointer',
  textDecoration: 'underline'
};

const quickStatsBlock = {
  padding: '0 8px',
  textAlign: 'center'
};

const makeBannerMessage = (referrer, url) => {
  if (referrer === 'meeting') {
    return <span>All team members will receive this summary in their inbox.</span>;
  }
  if (referrer === 'email') {
    return <span><a href={url} style={bannerLink}>View this summary in your web browser</a></span>;
  }
  if (referrer === 'history') {
    return <span><a href={url} style={bannerLink}>See all meeting summaries here</a></span>;
  }
  return null;
};

const SummaryEmail = (props) => {
  const {
    meeting,
    meetingUrl,
    referrer,
    referrerUrl,
    teamDashUrl
  } = props;
  const {agendaItemsCompleted, invitees, createdAt, meetingNumber, teamName} = meeting;
  const membersSansOutcomes = [];
  const membersWithOutcomes = [];
  let presentMemberCount = 0;
  let actionCount = 0;
  let projectCount = 0;

  for (let i = 0; i < invitees.length; i++) {
    const invitee = invitees[i];
    if (invitee.present) {
      presentMemberCount++;
    }
    const projLen = invitee.projects.length;
    const actionLen = invitee.actions.length;
    actionCount += actionLen;
    projectCount += projLen;
    const arr = (!projLen && !actionLen) ? membersSansOutcomes : membersWithOutcomes;
    arr.push(invitee);
  }

  const bannerMessage = makeBannerMessage(referrer, referrerUrl);
  const memberCount = membersSansOutcomes.length + membersWithOutcomes.length;
  const hasUsersWithoutOutcomes = membersSansOutcomes.length !== 0;
  return (
    <Layout>
      <table style={ui.emailTableBase} width="100%">
        <tbody>
          <tr>
            <td style={bannerStyle}>
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
      <Body verticalGutter={0}>
        <table align="center" style={ui.emailTableBase} width="100%">
          <tbody>
            <tr>
              <td align="center" style={{padding: 0}}>
                {/* Summary Header */}
                <SummaryHeader createdAt={createdAt} referrer={referrer} teamDashUrl={teamDashUrl} teamName={teamName} />
                {/* Message */}
                {meetingNumber === 1 ?
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
                      <table align="center" style={meetingLinkTable} width="80%">
                        <tbody>
                          <tr>
                            <td align="center" style={meetingLinkBlock}>
                              <a href={meetingUrl} style={meetingLink}>
                                {meetingUrl}
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div> :
                  <div>
                    {agendaItemsCompleted === 0 ?
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
          </tbody>
        </table>
        <table align="center" style={ui.emailTableBase} width="100%">
          <tbody>
            <tr>
              <td align="center" style={quickStatsBlock}>
                <QuickStats
                  agendaItems={agendaItemsCompleted}
                  newProjects={projectCount}
                  newActions={actionCount}
                  teamMembers={memberCount}
                  teamMembersPresent={presentMemberCount}
                />
              </td>
            </tr>
          </tbody>
        </table>
        {membersWithOutcomes.map((member) =>
          <UserOutcomes member={member} key={`memberOutcomes'${member.id}`} />
        )}
        {hasUsersWithoutOutcomes &&
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
  meeting: PropTypes.object.isRequired,
  meetingUrl: PropTypes.string,
  referrer: PropTypes.oneOf([
    'meeting',
    'email',
    'history'
  ]).isRequired,
  referrerUrl: PropTypes.string,
  teamDashUrl: PropTypes.string,
  actionCount: PropTypes.number,
  projectCount: PropTypes.number
};

export const summaryEmailText = (props) => {
  const {meeting} = props;
  const {teamName, agendaItemsCompleted, invitees} = meeting;
  const projectCount = invitees.reduce((sum, member) => sum + member.projects.length, 0);
  const actionCount = invitees.reduce((sum, member) => sum + member.actions.length, 0);
  return `Hello ${teamName}! As a team you discussed ${agendaItemsCompleted} Agenda Items${' '}
resulting in ${projectCount} New Projects${' '}
and ${actionCount} New Actions.${' '}`;
};

export default SummaryEmail;
