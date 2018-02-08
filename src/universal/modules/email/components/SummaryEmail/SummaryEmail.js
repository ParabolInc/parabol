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
import {makeSuccessExpression} from 'universal/utils/makeSuccessCopy';
import {MEETING_NAME, AGENDA_ITEM_LABEL} from 'universal/utils/constants';

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
  fontWeight: 700,
  textDecoration: 'none'
};

const greetingStyles = {
  color: appTheme.palette.cool,
  fontWeight: 700,
  fontSize: '27px',
  lineHeight: '40px',
  textAlign: 'inherit'
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
    return <span>{'All team members will receive this summary in their inbox.'}</span>;
  }
  if (referrer === 'email') {
    return <span><a href={url} style={bannerLink}>{'View this summary in your web browser'}</a></span>;
  }
  if (referrer === 'history') {
    return <span><a href={url} style={bannerLink}>{'See all meeting summaries here'}</a></span>;
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
  const membersSansOutcomes = invitees.filter((invitee) => invitee.tasks.length === 0);
  const membersWithOutcomes = invitees.filter((invitee) => invitee.tasks.length > 0);
  const presentMemberCount = invitees.filter((invitee) => invitee.present).length;
  const taskCount = invitees.reduce((sum, invitee) => sum + invitee.tasks.length, 0);

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
        {/* Summary Header */}
        <table align="center" style={ui.emailTableBase} width="100%">
          <tbody>
            <tr>
              <td align="center" style={{padding: 0}}>
                <SummaryHeader
                  createdAt={createdAt}
                  meetingNumber={meetingNumber}
                  referrer={referrer}
                  teamDashUrl={teamDashUrl}
                  teamName={teamName}
                />
              </td>
            </tr>
          </tbody>
        </table>
        {/* Quick Stats */}
        <table align="center" style={ui.emailTableBase} width="100%">
          <tbody>
            <tr>
              <td align="center" style={quickStatsBlock}>
                <QuickStats
                  agendaItems={agendaItemsCompleted}
                  newTasks={taskCount}
                  teamMembers={invitees.length}
                  teamMembersPresent={presentMemberCount}
                />
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
  teamDashUrl: PropTypes.string,
  taskCount: PropTypes.number
};

export const summaryEmailText = (props) => {
  const {meeting} = props;
  const {teamName, agendaItemsCompleted, invitees} = meeting;
  const taskCount = invitees.reduce((sum, member) => sum + member.tasks.length, 0);
  return `Hello ${teamName}! As a team you discussed ${agendaItemsCompleted} Agenda Items${' '}
  resulting in ${taskCount} New Tasks.${' '}`;
};

export default SummaryEmail;
