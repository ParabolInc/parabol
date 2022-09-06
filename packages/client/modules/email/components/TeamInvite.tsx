import {ExternalLinks} from 'parabol-client/types/constEnums'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature} from '../styles'
import Button from './Button'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmptySpace from './EmptySpace/EmptySpace'
import Header from './Header/Header'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

const boldStyle = {
  ...emailCopyStyle,
  fontWeight: 600
}

const videoLinkStyle = {
  border: 0,
  display: 'block',
  margin: '0 auto',
  textDecoration: 'none'
}

const videoGraphicStyle = {
  display: 'block',
  margin: '0 auto',
  maxWidth: innerMaxWidth,
  width: '100%'
}

const videoGraphicSrc = `${ExternalLinks.EMAIL_CDN}retro-video-still.png`
const meetingCopyLabelLookup = {
  action: 'a Check-in Meeting',
  retrospective: 'a Retrospective Meeting',
  poker: 'a Sprint Poker Meeting',
  teamPrompt: 'a Standup Meeting'
} as const

const utmParams = {
  utm_source: 'invite email',
  utm_medium: 'email',
  utm_campaign: 'invitations'
}
function appendUTM(url: string) {
  const newUrl = new URL(url)
  Object.entries(utmParams).forEach(([name, value]) => {
    newUrl.searchParams.append(name, value)
  })
  return newUrl.toString()
}

export interface TeamInviteProps {
  appOrigin: string
  inviteeName: string
  inviteeEmail: string
  inviterName: string
  inviterEmail: string
  inviteLink: string
  teamName: string
  meeting?: {
    meetingType: keyof typeof meetingCopyLabelLookup
    name: string
  }
}

const TeamInvite = (props: TeamInviteProps) => {
  const {
    appOrigin,
    inviterName,
    inviterEmail,
    inviteeEmail,
    inviteeName,
    meeting,
    teamName,
    inviteLink
  } = props

  //FIXME i18n: Retro 101
  //FIXME i18n: Getting Started: Retro 101
  //FIXME i18n: Leveling Up: Check-in 101
  const {t} = useTranslation()

  const inviteeEmailBlock = (
    <a href={`mailto:${inviteeEmail}`} style={emailCopyStyle}>
      {inviteeEmail}
    </a>
  )
  const nameOrEmail = inviteeName || inviteeEmailBlock
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header appOrigin={appOrigin} />
        {meeting ? (
          <div>
            <p style={emailCopyStyle}>
              {t('TeamInvite.Hi')}
              <span style={emailCopyStyle}>{nameOrEmail}</span>
              {t('TeamInvite.,')}
            </p>
            <p style={emailCopyStyle}>
              <span style={boldStyle}>{inviterName}</span>
              {t('TeamInvite.(')}
              <a href={`mailto:${inviterEmail}`} style={emailLinkStyle}>
                {inviterEmail}
              </a>
              {`) has started ${meetingCopyLabelLookup[meeting.meetingType]} for your team (`}
              <b>{teamName}</b>
              {t('TeamInvite.JustAFewClicksAndYouReIn!')}
            </p>
            <Button url={inviteLink}>
              {t('TeamInvite.Join')}
              {meeting.name}
            </Button>
          </div>
        ) : (
          <div>
            <p style={emailCopyStyle}>
              {t('TeamInvite.Hi')}
              <span style={emailCopyStyle}>{nameOrEmail}</span>
              {t('TeamInvite.,')}
            </p>
            <p style={emailCopyStyle}>
              <span style={boldStyle}>{inviterName}</span>
              {t('TeamInvite.(')}
              <a href={`mailto:${inviterEmail}`} style={emailLinkStyle}>
                {inviterEmail}
              </a>
              {t('TeamInvite.HasInvitedYouToJoinATeam(')}
              <b>{teamName}</b>
              {t('TeamInvite.OnParabol.')}
            </p>
            <Button url={inviteLink}>{t('TeamInvite.JoinTeam')}</Button>
          </div>
        )}
        <EmptySpace height={24} />
        <p style={emailCopyStyle}>
          <span style={boldStyle}>{t('TeamInvite.NewToParabol?')}</span>
          <br />
          {t(
            'TeamInvite.ParabolIsSoftwareForRemoteTeamsToRunOnlineRetrospectiveAndCheckInMeetingsSeeTheVideoAndLinksBelow:'
          )}
        </p>
        <a
          href={appendUTM(ExternalLinks.GETTING_STARTED_RETROS)}
          style={videoLinkStyle}
          title='Retro 101'
        >
          <img crossOrigin='' alt='' src={videoGraphicSrc} style={videoGraphicStyle} />
        </a>
        <EmptySpace height={24} />
        <p style={emailCopyStyle}>
          {t('TeamInvite.LearnMoreAboutParabolMeetings:')}
          <br />
          <a
            href={appendUTM(ExternalLinks.GETTING_STARTED_RETROS)}
            style={emailLinkStyle}
            title='Getting Started: Retro 101'
          >
            {t('TeamInvite.GettingStartedRetro101')}
          </a>
          <br />
          <a
            href={appendUTM(ExternalLinks.GETTING_STARTED_CHECK_INS)}
            style={emailLinkStyle}
            title='Leveling Up: Check-in 101'
          >
            {t('TeamInvite.LevelingUpCheckIn101')}
          </a>
        </p>
        <p style={emailCopyStyle}>
          {t('TeamInvite.GetInTouchIfWeCanHelpInAnyWay,')}
          <br />
          {emailProductTeamSignature}
          <br />
          <a href='mailto:love@parabol.co' style={emailLinkStyle} title='love@parabol.co'>
            {t('TeamInvite.LoveParabolCo')}
          </a>
        </p>
        <EmptySpace height={16} />
      </EmailBlock>
      <EmailBlock hasBackgroundColor innerMaxWidth={innerMaxWidth}>
        <EmailFooter />
      </EmailBlock>
    </Layout>
  )
}

export default TeamInvite
