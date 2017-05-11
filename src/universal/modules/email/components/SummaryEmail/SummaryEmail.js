import React, {PropTypes} from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {createGoogleCalendarInviteURL, makeIcsUrl} from 'universal/utils/makeCalendarInvites';

import Body from '../../components/Body/Body';
import ContactUs from '../../components/ContactUs/ContactUs';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import Footer from '../../components/Footer/Footer';
import Layout from '../../components/Layout/Layout';
import QuickStats from '../../components/QuickStats/QuickStats';
import SummaryHeader from '../../components/SummaryHeader/SummaryHeader';
import UserProjects from '../UserProjects/UserProjects';
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
  textAlign: 'center',
  whiteSpace: 'pre-line'
};

const linkStyles = {
  color: appTheme.palette.warm,
  fontWeight: 700,
  textDecoration: 'none'
};

const greetingStyles = {
  fontSize: '27px',
  lineHeight: '40px'
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
  const membersSansOutcomes = invitees.filter((invitee) => invitee.projects.length === 0);
  const membersWithOutcomes = invitees.filter((invitee) => invitee.projects.length > 0);
  const presentMemberCount = invitees.filter((invitee) => invitee.present).length;
  const projectCount = invitees.reduce((sum, invitee) => sum + invitee.projects.length, 0);

  const bannerMessage = makeBannerMessage(referrer, referrerUrl);
  const hasUsersWithoutOutcomes = membersSansOutcomes.length !== 0;
  const iconSize = 28;
  const iconLinkBlock = {
    backgroundColor: appTheme.palette.cool10l,
    display: 'inline-block',
    margin: '14px',
    minWidth: '211px',
    padding: '9px 8px'
  };
  const iconLink = {
    color: appTheme.palette.cool
  };
  const iconLinkIcon = {
    border: 0,
    display: 'inline-block',
    verticalAlign: 'middle'
  };
  const iconLinkLabel = {
    display: 'inline-block',
    height: `${iconSize}px`,
    lineHeight: `${iconSize}px`,
    margin: '0 0 0 6px',
    verticalAlign: 'middle'
  };
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
                      {`
                      Way to go on your first PARABOL Meeting!
                      You are unlocking new superpowers.
                      High-performing teams have regular habits!
                      Create a 30-minute meeting at the start of each week.
                      `}
                      <br />
                      <div>
                        <span>{'Tap here to schedule:'}</span>
                        <br />
                        <div style={iconLinkBlock}>
                          <a
                            href={createGoogleCalendarInviteURL(createdAt, meetingUrl, teamName)}
                            rel="noopener noreferrer"
                            style={iconLink}
                            target="_blank"
                          >
                            <img
                              style={iconLinkIcon}
                              src="/static/images/icons/google@5x.png"
                              height={iconSize}
                              width={iconSize}
                            />
                            <span style={iconLinkLabel}>Google Calendar</span>
                          </a>
                        </div>
                        <div style={iconLinkBlock}>
                          <a
                            href={makeIcsUrl(createdAt, meetingUrl, teamName)}
                            rel="noopener noreferrer"
                            style={iconLink}
                            target="_blank"
                          >
                            <img
                              style={iconLinkIcon}
                              src="/static/images/icons/calendar-plus-o@5x.png"
                              height={iconSize}
                              width={iconSize}
                            />
                            <span style={iconLinkLabel}>Outlook, etc.</span>
                          </a>
                        </div>
                      </div>
                      {'Or, make your own and include this link as the location:'}
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
                  teamMembers={invitees.length}
                  teamMembersPresent={presentMemberCount}
                />
              </td>
            </tr>
          </tbody>
        </table>
        {membersWithOutcomes.map((member) =>
          <UserProjects member={member} key={`userProjects'${member.id}`} />
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
  projectCount: PropTypes.number
};

export const summaryEmailText = (props) => {
  const {meeting} = props;
  const {teamName, agendaItemsCompleted, invitees} = meeting;
  const projectCount = invitees.reduce((sum, member) => sum + member.projects.length, 0);
  return `Hello ${teamName}! As a team you discussed ${agendaItemsCompleted} Agenda Items${' '}
  resulting in ${projectCount} New Projects.${' '}`;
};

export default SummaryEmail;
