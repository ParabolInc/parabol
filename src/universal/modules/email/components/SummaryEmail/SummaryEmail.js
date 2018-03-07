import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {createGoogleCalendarInviteURL, makeIcsUrl} from 'universal/utils/makeCalendarInvites';
import Body from '../../components/Body/Body';
import ContactUs from '../../components/ContactUs/ContactUs';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import Footer from '../../components/Footer/Footer';
import Layout from '../../components/Layout/Layout';
import QuickStats from '../../components/QuickStats/QuickStats';
import SummaryHeader from '../../components/SummaryHeader/SummaryHeader';
import UserTasks from '../UserTasks/UserTasks';
import UserNoNewOutcomes from '../../components/UserNoNewOutcomes/UserNoNewOutcomes';
import {Link} from 'react-router-dom';
import {makeSuccessExpression} from 'universal/utils/makeSuccessCopy';
import {MEETING_NAME, AGENDA_ITEM_LABEL, DONE} from 'universal/utils/constants';

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
  lineHeight: '27px',
  padding: '0 16px',
  textAlign: 'center',
  whiteSpace: 'pre-line'
};

const linkStyles = {
  color: appTheme.palette.warm,
  fontWeight: 600,
  textDecoration: 'none'
};

const greetingStyles = {
  color: ui.colorText,
  fontWeight: 600,
  fontSize: '27px',
  lineHeight: '40px',
  textAlign: 'inherit'
};

const bannerStyle = {
  backgroundColor: '#ffffff',
  textAlign: 'center'
};

const topMessageStyles = {
  color: ui.palette.mid,
  fontFamily: ui.emailFontFamily,
  fontSize: '11px',
  fontWeight: 400,
  textAlign: 'right',
  padding: '0 16px'
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
  color: ui.palette.dark,
  cursor: 'pointer',
  textDecoration: 'underline'
};

const quickStatsBlock = {
  padding: '0 8px',
  textAlign: 'center'
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
  const membersSansOutcomes = invitees.filter((invitee) => invitee.tasks.length === 0);
  const membersWithOutcomes = invitees.filter((invitee) => invitee.tasks.length > 0);
  const presentMemberCount = invitees.filter((invitee) => invitee.present).length;
  const doneTaskCount = invitees.reduce((sum, invitee) => sum + invitee.tasks.filter((task) => task.status === DONE).length, 0);
  const newTaskCount = invitees.reduce((sum, invitee) => sum + invitee.tasks.filter((task) => task.status !== DONE).length, 0);
  const hasUsersWithoutOutcomes = membersSansOutcomes.length !== 0;
  const iconSize = 28;
  const teamDashLabel = 'Go to Team Dashboard';
  const textStyle = {
    fontFamily: ui.emailFontFamily
  };
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
  const teamDashLinkStyle = {
    ...textStyle,
    backgroundColor: appTheme.palette.warm,
    borderRadius: '4em',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '20px',
    margin: '0 auto',
    padding: '6px 0',
    textAlign: 'center',
    textDecoration: 'none',
    width: '186px'
  };
  const tipStyle = {
    ...textStyle,
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '24px'
  };
  return (
    <Layout>
      {referrer === 'email' &&
        <table style={ui.emailTableBase} width="100%">
          <tbody>
            <tr>
              <td style={bannerStyle}>
                <EmptySpace height={8} />
                <div style={topMessageStyles}>
                  <span><a href={referrerUrl} style={bannerLink}>{'View this in your browser'}</a></span>
                </div>
                <EmptySpace height={8} />
              </td>
            </tr>
          </tbody>
        </table>
      }
      <Body verticalGutter={0}>
        <table align="center" style={ui.emailTableBase} width="100%">
          <tbody>
            <tr>
              <td align="center" style={{padding: 0}}>
                {/* Summary Header */}
                <SummaryHeader
                  createdAt={createdAt}
                  meetingNumber={meetingNumber}
                  referrer={referrer}
                  teamDashUrl={teamDashUrl}
                  teamName={teamName}
                />
              </td>
            </tr>
            <tr>
              <td align="center" style={quickStatsBlock}>
                {/* Quick Stats */}
                <QuickStats
                  agendaItems={agendaItemsCompleted}
                  doneTaskCount={doneTaskCount}
                  newTaskCount={newTaskCount}
                  teamMembers={invitees.length}
                  teamMembersPresent={presentMemberCount}
                />
              </td>
            </tr>
            <tr>
              <td>
                {/* Team Dashboard Button */}
                {referrer === 'email' ?
                  <a
                    href={teamDashUrl}
                    style={teamDashLinkStyle}
                    title={teamDashLabel}
                  >
                    {teamDashLabel}
                  </a> :
                  <Link
                    to={teamDashUrl}
                    style={teamDashLinkStyle}
                    title={teamDashLabel}
                  >
                    {teamDashLabel}
                  </Link>
                }
                <EmptySpace height={32} />
              </td>
            </tr>
          </tbody>
        </table>
        {membersWithOutcomes.map((member) =>
          <UserTasks member={member} key={`userTasks'${member.id}`} />
        )}
        {hasUsersWithoutOutcomes &&
        <UserNoNewOutcomes members={membersSansOutcomes} />
        }
        <EmptySpace height={0} />
        {/* Show this tip for the first 3 summaries. */}
        {meetingNumber < 4 &&
          <table align="center" style={ui.emailTableBase} width="100%">
            <tbody>
              <tr>
                <td align="center" style={{padding: 0}}>
                  <hr style={ruleStyle} />
                  <EmptySpace height={32} />
                  <div style={tipStyle}>
                    <b>{'Pro Tip'}</b>{': all Tasks in the '}<b>{'Done'}</b>{' column are'}<br />
                    {'automatically archived after each meeting.'}
                  </div>
                  <EmptySpace height={32} />
                </td>
              </tr>
            </tbody>
          </table>
        }
        <hr style={ruleStyle} />
        <EmptySpace height={48} />
        {/* First-time prompt to schedule recurring meeting */}
        {meetingNumber === 1 ?
          <table align="center" style={ui.emailTableBase} width="100%">
            <tbody>
              <tr>
                <td align="center" style={{padding: 0}}>
                  <div style={message}>
                    <div style={greetingStyles}>{makeSuccessExpression()}!</div>
                    {`Way to go on your first ${MEETING_NAME}!
                      You are unlocking new superpowers.
                      High-performing teams have regular habits!
                      Create a 30-minute meeting at the start of each week.`}
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
                          <span style={iconLinkLabel}>{'Google Calendar'}</span>
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
                          <span style={iconLinkLabel}>{'Outlook, etc.'}</span>
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
                </td>
              </tr>
            </tbody>
          </table> :
          <div>
            {agendaItemsCompleted === 0 ?
              <div style={message}>
                {/* No Agenda Items? */}
                <div style={greetingStyles}>{'Hey there!'}</div>
                {`It looks like there weren’t any ${AGENDA_ITEM_LABEL}s.
                  Did our software give you trouble?
                  Let us know: `}
                <a href="mailto:love@parabol.co" style={linkStyles} title="Email us at: love@parabol.co">love@parabol.co</a>
              </div> :
              <ContactUs
                fontSize={18}
                hasLearningLink
                lineHeight={1.5}
                prompt={`How’d your ${MEETING_NAME} go?`}
                tagline="We’re eager for your feedback!"
                vSpacing={0}
              />
            }
          </div>
        }
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
  teamDashUrl: PropTypes.string
};

export const summaryEmailText = (props) => {
  const {meeting} = props;
  const {teamName, agendaItemsCompleted, invitees} = meeting;
  const doneTaskCount = invitees.reduce((sum, member) => sum + member.tasks.filter((task) => task.status === DONE).length, 0);
  const newTaskCount = invitees.reduce((sum, member) => sum + member.tasks.filter((task) => task.status !== DONE).length, 0);
  return `Hello ${teamName}! As a team you discussed ${agendaItemsCompleted} Agenda Items${' '}
  resulting in ${doneTaskCount} Tasks Completed and ${newTaskCount} New Tasks.${' '}`;
};

export default SummaryEmail;
