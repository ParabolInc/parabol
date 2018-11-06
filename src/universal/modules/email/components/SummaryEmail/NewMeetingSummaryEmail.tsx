import React from 'react'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import Body from 'universal/modules/email/components/Body/Body'
import ContactUs from 'universal/modules/email/components/ContactUs/ContactUs'
import EmptySpace from 'universal/modules/email/components/EmptySpace/EmptySpace'
import Footer from 'universal/modules/email/components/Footer/Footer'
import Layout from 'universal/modules/email/components/Layout/Layout'
import SummaryHeader from 'universal/modules/email/components/SummaryHeader/SummaryHeader'
import {ACTION, RETROSPECTIVE} from 'universal/utils/constants'
import RetroQuickStats from 'universal/modules/email/components/QuickStats/RetroQuickStats'
import MeetingMemberTasks from 'universal/modules/email/components/SummaryEmail/MeetingMemberTasks'
import RetroDiscussionTopics from 'universal/modules/email/components/RetroDiscussionTopics/RetroDiscussionTopics'
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'
import ExportToCSV from 'universal/modules/email/components/SummaryEmail/ExportToCSV'
import SummaryCTA from 'universal/modules/email/components/SummaryEmail/SummaryCTA'
import ExportToCSVEmail from 'universal/modules/email/components/SummaryEmail/ExportToCSVEmail'

const ruleStyle = {
  ...ui.emailRuleStyle,
  width: '100%'
}

const bannerStyle = {
  backgroundColor: '#ffffff',
  textAlign: 'center'
}

const topMessageStyles = {
  color: ui.palette.mid,
  fontFamily: ui.emailFontFamily,
  fontSize: '11px',
  fontWeight: 400,
  textAlign: 'right',
  padding: '0 16px'
}

const bannerLink = {
  color: ui.palette.dark,
  cursor: 'pointer',
  textDecoration: 'underline'
}

const quickStatsBlock = {
  padding: '0 8px',
  textAlign: 'center'
}

interface Props {
  emailCSVLUrl?: string
  isDemo: boolean
  meeting: any
  referrer: 'meeting' | 'email' | 'history'
  referrerUrl?: string
  teamDashUrl: string
  meetingUrl?: string
  urlAction?: 'csv'
}

const SummaryEmail = (props: Props) => {
  const {isDemo, emailCSVLUrl, meeting, referrer, referrerUrl, teamDashUrl, urlAction} = props
  const {
    id: meetingId,
    createdAt,
    meetingNumber,
    meetingType,
    team: {name: teamName}
  } = meeting
  const meetingLabel = meetingTypeToLabel[meetingType]
  return (
    <Layout>
      {referrer === 'email' && (
        <table style={ui.emailTableBase}>
          <tbody>
            <tr>
              <td style={bannerStyle as React.CSSProperties}>
                <EmptySpace height={8} />
                <div style={topMessageStyles as React.CSSProperties}>
                  <span>
                    <a href={referrerUrl} style={bannerLink}>
                      {'View this in your browser'}
                    </a>
                  </span>
                </div>
                <EmptySpace height={8} />
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <Body verticalGutter={0}>
        <table style={ui.emailTableBase}>
          <tbody>
            <tr>
              <td align='center' style={{padding: 0}}>
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
              <td align='center' style={quickStatsBlock as React.CSSProperties}>
                {/* Quick Stats */}
                {meetingType === RETROSPECTIVE && <RetroQuickStats meeting={meeting} />}
              </td>
            </tr>
            <tr>
              <td>
                {/* Team Dashboard Button */}
                <SummaryCTA referrer={referrer} teamDashUrl={teamDashUrl} isDemo={isDemo} />
                {referrer === 'email' ? (
                  <ExportToCSVEmail emailCSVLUrl={emailCSVLUrl!} />
                ) : (
                  <ExportToCSV meetingId={meetingId} urlAction={urlAction} />
                )}
                <EmptySpace height={32} />
              </td>
            </tr>
          </tbody>
        </table>

        {meetingType === RETROSPECTIVE && (
          <MeetingMemberTasks meetingType={meetingType} meeting={meeting} />
        )}
        <EmptySpace height={0} />
        <hr style={ruleStyle} />
        <EmptySpace height={48} />
        {meetingType === RETROSPECTIVE && (
          <RetroDiscussionTopics
            imageSource={referrer === 'email' ? 'static' : 'local'}
            topics={meeting.reflectionGroups}
          />
        )}
        <div>
          <EmptySpace height={48} />
          <hr style={ruleStyle} />
          <EmptySpace height={48} />
          <ContactUs
            fontSize={16}
            hasLearningLink={meetingType === ACTION}
            lineHeight={1.5}
            prompt={`How’d your ${meetingLabel} meeting go?`}
            tagline='We’re eager for your feedback!'
            vSpacing={0}
          />
        </div>
        <EmptySpace height={32} />
      </Body>
      <Footer color={appTheme.palette.dark} />
    </Layout>
  )
}

export default SummaryEmail
