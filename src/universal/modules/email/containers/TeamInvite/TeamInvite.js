import PropTypes from 'prop-types'
import React from 'react'
import Layout from '../../components/Layout/Layout'
import EmailBlock from '../../components/EmailBlock/EmailBlock'
import Button from '../../components/Button/Button'
import EmptySpace from '../../components/EmptySpace/EmptySpace'
import Header from '../../components/Header/Header'
import EmailFooter from '../../components/EmailFooter/EmailFooter'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature} from 'universal/styles/email'

const innerMaxWidth = 480

const linkStyle = {
  ...emailLinkStyle,
  fontWeight: 600
}

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

const videoGraphicSrc = '/static/images/email/graphics/retro-video-still.png'

const TeamInvite = (props) => {
  const {inviterName, inviterEmail, inviteeEmail, inviteeName, teamName, inviteLink} = props
  const inviteeEmailBlock = (
    <a href={`mailto:${inviteeEmail}`} style={emailCopyStyle}>
      {inviteeEmail}
    </a>
  )
  const nameOrEmail = inviteeName || inviteeEmailBlock
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header />
        <p style={emailCopyStyle}>
          {'Hi '}
          <span style={emailCopyStyle}>{nameOrEmail}</span>
          {','}
        </p>
        <p style={emailCopyStyle}>
          <span style={boldStyle}>{inviterName}</span>
          {' ('}
          <a href={`mailto:${inviterEmail}`} style={linkStyle}>
            {inviterEmail}
          </a>
          {') has invited you to join a team on Parabol: '}
          <span style={boldStyle}>{teamName}</span>
        </p>
        <Button url={inviteLink}>{'Join Team'}</Button>
        <EmptySpace height={24} />
        <p style={emailCopyStyle}>
          <span style={boldStyle}>{'New to Parabol?'}</span>
          <br />
          {
            'Parabol is software for remote teams to run online retrospective and check-in meetings. See the video and links below:'
          }
        </p>
        <a
          href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101'
          style={videoLinkStyle}
          title='Retro 101'
        >
          <img alt='' src={videoGraphicSrc} style={videoGraphicStyle} />
        </a>
        <EmptySpace height={24} />
        <p style={emailCopyStyle}>
          {'Learn more about Parabol meetings:'}
          <br />
          <a
            href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101'
            style={linkStyle}
            title='Getting Started: Retro 101'
          >
            {'Getting Started: Retro 101'}
          </a>
          <br />
          <a
            href='https://www.parabol.co/getting-started-guide/action-meetings-101'
            style={linkStyle}
            title='Leveling Up: Action 101'
          >
            {'Leveling Up: Action 101'}
          </a>
        </p>
        <p style={emailCopyStyle}>
          {'Get in touch if we can help in any way,'}
          <br />
          {emailProductTeamSignature}
          <br />
          <a href='mailto:love@parabol.co' style={linkStyle} title='love@parabol.co'>
            {'love@parabol.co'}
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

TeamInvite.propTypes = {
  inviteLink: PropTypes.string.isRequired,
  inviteeName: PropTypes.string,
  inviteeEmail: PropTypes.string.isRequired,
  inviterName: PropTypes.string.isRequired,
  inviterEmail: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired
}

export const teamInviteText = (props) => {
  const {inviteeName, inviteeEmail, inviterName, inviterEmail, inviteLink, teamName} = props
  return `
Hello ${inviteeName || inviteeEmail},

${inviterName} (${inviterEmail}) has invited you to join a team on Parabol: ${teamName}

Parabol is software for remote teams to run online retrospective and check-in meetings.

Get started here: ${inviteLink}

Your friends,
The Parabol Product Team
`
}

export default TeamInvite
