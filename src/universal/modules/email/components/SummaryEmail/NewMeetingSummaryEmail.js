// @flow
import React from 'react';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Body from '../../components/Body/Body';
import ContactUs from '../../components/ContactUs/ContactUs';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import Footer from '../../components/Footer/Footer';
import Layout from '../../components/Layout/Layout';
import SummaryHeader from '../../components/SummaryHeader/SummaryHeader';
import {Link} from 'react-router-dom';
import {ACTION, RETROSPECTIVE} from 'universal/utils/constants';
import RetroQuickStats from 'universal/modules/email/components/QuickStats/RetroQuickStats';
import MeetingMemberTasks from 'universal/modules/email/components/SummaryEmail/MeetingMemberTasks';
import RetroDiscussionTopics from 'universal/modules/email/components/RetroDiscussionTopics/RetroDiscussionTopics';
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups';

const teamDashLabel = 'Go to Team Dashboard';

const ruleStyle = {
  ...ui.emailRuleStyle,
  width: '100%'
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

const bannerLink = {
  color: ui.palette.dark,
  cursor: 'pointer',
  textDecoration: 'underline'
};

const quickStatsBlock = {
  padding: '0 8px',
  textAlign: 'center'
};

const textStyle = {
  fontFamily: ui.emailFontFamily
};

const teamDashLinkStyle = {
  ...textStyle,
  backgroundColor: appTheme.palette.warm,
  backgroundImage: ui.gradientWarm,
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

type Props = {|
  meeting: Object,
  referrer: | 'meeting'
    | 'email'
    | 'history',
  referrerUrl?: string,
  teamDashUrl: string,
  meetingUrl?: string
|}

const SummaryEmail = (props: Props) => {
  const {
    meeting,
    referrer,
    referrerUrl,
    teamDashUrl
  } = props;
  const {createdAt, meetingNumber, meetingType, team: {name: teamName}} = meeting;
  const meetingLabel = meetingTypeToLabel[meetingType];
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
                  meetingType={meetingType}
                  referrer={referrer}
                  teamDashUrl={teamDashUrl}
                  teamName={teamName}
                />
              </td>
            </tr>
            <tr>
              <td align="center" style={quickStatsBlock}>
                {/* Quick Stats */}
                {meetingType === RETROSPECTIVE && <RetroQuickStats meeting={meeting} />}
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
        {meetingType === RETROSPECTIVE && <MeetingMemberTasks meetingType={meetingType} meeting={meeting} />}
        <EmptySpace height={0} />
        <hr style={ruleStyle} />
        <EmptySpace height={48} />
        {meetingType === RETROSPECTIVE &&
          <RetroDiscussionTopics imageSource={referrer === 'email' ? 'static' : 'local'} topics={meeting.reflectionGroups} />
        }
        <div>
          <EmptySpace height={48} />
          <hr style={ruleStyle} />
          <EmptySpace height={48} />
          <ContactUs
            fontSize={16}
            hasLearningLink={meetingType === ACTION}
            lineHeight={1.5}
            prompt={`How’d your ${meetingLabel} meeting go?`}
            tagline="We’re eager for your feedback!"
            vSpacing={0}
          />
        </div>
        <EmptySpace height={32} />
      </Body>
      <Footer color={appTheme.palette.dark} />
    </Layout>
  );
};

export default SummaryEmail;
