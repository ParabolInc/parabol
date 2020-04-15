import Oy from 'oy-vey'
import React from 'react'
import { headCSS } from '../../styles'
import TeamInvite, { teamInviteText } from './TeamInvite'

const subject = 'You’ve been invited to Parabol'

export default (props) => ({
  subject,
  body: teamInviteText(props),
  html: Oy.renderTemplate(<TeamInvite {...props} />, {
    headCSS,
    title: subject,
    previewText: subject
  })
})
