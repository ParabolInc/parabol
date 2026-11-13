import {Body} from '@react-email/body'
import {Button} from '@react-email/button'
import {Container} from '@react-email/container'
import {Head} from '@react-email/head'
import {Html} from '@react-email/html'
import {Img} from '@react-email/img'
import {Preview} from '@react-email/preview'
import {Section} from '@react-email/section'
import {Text} from '@react-email/text'
import EmailFooter from 'parabol-client/modules/email/components/EmailFooter/EmailFooter'
import {
  emailBackgroundColor,
  emailBodyColor,
  emailCopyStyle,
  emailFontFamily,
  emailLinkStyle,
  emailPrimaryButtonStyle,
  emailProductTeamSignature,
  emailTextColor
} from 'parabol-client/modules/email/styles'
import {ExternalLinks} from 'parabol-client/types/constEnums'
import type {CorsOptions} from 'parabol-client/types/cors'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {MeetingTypeToReadable} from 'parabol-client/utils/meetings/lookups'

const contentMaxWidth = 480

const bodyStyle = {
  backgroundColor: emailBackgroundColor,
  padding: '20px 12px'
}

const blockStyle = {
  color: emailTextColor,
  fontFamily: emailFontFamily,
  fontSize: '16px',
  lineHeight: 1.5,
  padding: '0px 16px'
}

const cardStyle = {
  ...blockStyle,
  backgroundColor: emailBodyColor
}

const layoutStyle = {
  maxWidth: 544
}

const contentStyle = {
  maxWidth: contentMaxWidth
}

const logoCellStyle = {
  padding: '32px 0px'
}

const logoLinkStyle = {
  display: 'block',
  textDecoration: 'none'
}

const boldStyle = {
  fontWeight: 600
}

const ctaStyle = {
  ...emailPrimaryButtonStyle,
  padding: '12.4px 0px',
  textAlign: 'center',
  width: '240px'
} as const

const videoLinkStyle = {
  border: 0,
  display: 'block',
  margin: '0 auto 24px',
  textDecoration: 'none'
}

const videoGraphicStyle = {
  margin: '0 auto',
  maxWidth: contentMaxWidth,
  width: '100%'
}

const newToParabolStyle = {
  ...emailCopyStyle,
  marginTop: '24px'
}

const signatureStyle = {
  ...emailCopyStyle,
  marginBottom: '40px'
}

const utmParams = {
  utm_source: 'invite email',
  utm_medium: 'email',
  utm_campaign: 'invitations'
}

const appendUTM = (url: string) => {
  const urlWithUTM = new URL(url)
  Object.entries(utmParams).forEach(([name, value]) => {
    urlWithUTM.searchParams.append(name, value)
  })
  return urlWithUTM.toString()
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
    meetingType: keyof typeof MeetingTypeToReadable
    name: string
  }
  corsOptions: CorsOptions
  title: string
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
    inviteLink,
    corsOptions,
    title
  } = props
  const inviterBlock = (
    <>
      <span style={boldStyle}>{inviterName}</span>
      {' ('}
      <a href={`mailto:${inviterEmail}`} style={emailLinkStyle}>
        {inviterEmail}
      </a>
      {')'}
    </>
  )
  return (
    <Html>
      <Head>
        <meta name='viewport' content='width=device-width' />
        <title>{title}</title>
        <style>{'body{margin:0}'}</style>
      </Head>
      <Preview>{title}</Preview>
      <Body style={bodyStyle}>
        <Container style={layoutStyle}>
          <Section style={cardStyle}>
            <Container style={contentStyle}>
              <Section style={logoCellStyle}>
                <a href={makeAppURL(appOrigin, 'me')} style={logoLinkStyle}>
                  <Img
                    alt='Parabol, Inc. Logo'
                    height={42}
                    src={`${ExternalLinks.EMAIL_CDN}email-header-branding-color@3x.png`}
                    width={204}
                    {...corsOptions}
                  />
                </a>
              </Section>
              <Text style={emailCopyStyle}>
                {'Hi '}
                {inviteeName || (
                  <a href={`mailto:${inviteeEmail}`} style={emailCopyStyle}>
                    {inviteeEmail}
                  </a>
                )}
                {','}
              </Text>
              {meeting ? (
                <Text style={emailCopyStyle}>
                  {inviterBlock}
                  {` has started a ${MeetingTypeToReadable[meeting.meetingType]} meeting for your team (`}
                  <b>{teamName}</b>
                  {'). Just a few clicks and you’re in!'}
                </Text>
              ) : (
                <Text style={emailCopyStyle}>
                  {inviterBlock}
                  {' has invited you to join a team ('}
                  <b>{teamName}</b>
                  {') on Parabol.'}
                </Text>
              )}
              <Button href={inviteLink} style={ctaStyle}>
                {meeting ? `Join ${meeting.name}` : 'Join Team'}
              </Button>
              <Text style={newToParabolStyle}>
                <span style={boldStyle}>{'New to Parabol?'}</span>
                <br />
                {
                  'Parabol is software for remote teams to run online retrospective and check-in meetings. See the video and links below:'
                }
              </Text>
              <a
                href={appendUTM(ExternalLinks.GETTING_STARTED_RETRO_VIDEO)}
                style={videoLinkStyle}
                title='Retro 101'
              >
                <Img
                  alt=''
                  src={`${ExternalLinks.EMAIL_CDN}online-retro-meeting-vid.png`}
                  style={videoGraphicStyle}
                  {...corsOptions}
                />
              </a>
              <Text style={emailCopyStyle}>
                {'Learn more about Parabol meetings:'}
                <br />
                <a
                  href={appendUTM(ExternalLinks.GETTING_STARTED_RETROS)}
                  style={emailLinkStyle}
                  title='Getting Started: Retro 101'
                >
                  {'Getting Started: Retro 101'}
                </a>
                <br />
                <a
                  href={appendUTM(ExternalLinks.GETTING_STARTED_CHECK_INS)}
                  style={emailLinkStyle}
                  title='Leveling Up: Check-in 101'
                >
                  {'Leveling Up: Check-in 101'}
                </a>
                <br />
                <a
                  href={appendUTM(ExternalLinks.GETTING_STARTED_SPRINT_POKER)}
                  style={emailLinkStyle}
                  title='Estimating issues: Sprint Poker 101'
                >
                  {'Estimating issues: Sprint Poker 101'}
                </a>
              </Text>
              <Text style={signatureStyle}>
                {'Get in touch if we can help in any way,'}
                <br />
                {emailProductTeamSignature}
                <br />
                <a href='mailto:love@parabol.co' style={emailLinkStyle} title='love@parabol.co'>
                  {'love@parabol.co'}
                </a>
              </Text>
            </Container>
          </Section>
          <Section style={blockStyle}>
            <Container style={contentStyle}>
              <EmailFooter />
            </Container>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default TeamInvite
