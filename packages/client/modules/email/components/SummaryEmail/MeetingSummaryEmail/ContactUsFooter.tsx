import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {MEETING_NAME} from 'parabol-client/utils/constants'
import React from 'react'
import {useTranslation} from 'react-i18next'

const promptStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 24,
  fontWeight: 600,
  paddingTop: 24
}

const linkStyle = {
  color: PALETTE.ROSE_500,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  textDecoration: 'none'
}

const textStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  paddingTop: 4
}

interface Props {
  hasLearningLink: boolean
  isDemo: boolean
  prompt: string
  tagline: string
}
const ContactUsFooter = (props: Props) => {
  const {hasLearningLink, isDemo, prompt, tagline} = props

  //FIXME i18n: Email us: love@parabol.co
  //FIXME i18n: noopener noreferrer
  //FIXME i18n: Navigate uncertainty with the Parabol Rhythm
  const {t} = useTranslation()

  if (isDemo) return null
  return (
    <>
      <tr>
        <td align='center' style={promptStyle}>
          {prompt}
        </td>
      </tr>
      <tr>
        <td align='center' style={textStyle}>
          {tagline}
        </td>
      </tr>
      <tr>
        <td align='center' style={textStyle}>
          {t('ContactUsFooter.EmailUs:')}&nbsp;
          <a href='mailto:love@parabol.co' style={linkStyle} title='Email us: love@parabol.co'>
            {t('ContactUsFooter.LoveParabolCo')}
          </a>
        </td>
      </tr>
      {hasLearningLink && (
        <tr>
          <td align='center' style={textStyle}>
            <a
              href='https://focus.parabol.co/how-to-navigate-uncertainty-fc0dfaaf3830'
              rel='noopener noreferrer'
              style={linkStyle}
              target='_blank'
              title='Navigate uncertainty with the Parabol Rhythm'
            >
              {t('ContactUsFooter.LearnMore')}
            </a>
            {` about the ${MEETING_NAME} Process.`}
          </td>
        </tr>
      )}
    </>
  )
}

export default ContactUsFooter
