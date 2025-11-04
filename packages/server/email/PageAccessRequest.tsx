import {Body} from '@react-email/body'
import {Button} from '@react-email/button'
import {Container} from '@react-email/container'
import {Head} from '@react-email/head'
import {Html} from '@react-email/html'
import {Img} from '@react-email/img'
import {Preview} from '@react-email/preview'
import {Section} from '@react-email/section'
import {Text} from '@react-email/text'

import {ExternalLinks} from 'parabol-client/types/constEnums'
import {emailCopyStyle, emailLinkStyle, emailTableBase} from '../../client/modules/email/styles'
import {PALETTE} from '../../client/styles/paletteV3'
import {EMAIL_CORS_OPTIONS} from '../../client/types/cors'
import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import {PageRoleEnum} from '../graphql/public/resolverTypes'

const boldStyle = {
  ...emailCopyStyle,
  fontWeight: 600
}

const emailHeadingStyle = {
  ...emailCopyStyle,
  fontWeight: 600,
  fontSize: '24px',
  color: PALETTE.SLATE_900,
  paddingTop: '24px'
}

const imageStyle = {
  border: '0px',
  display: 'block',
  margin: '0px'
}

export const pageRoles = {
  owner: 'edit',
  editor: 'edit',
  commenter: 'comment on',
  viewer: 'view'
} as const satisfies Record<PageRoleEnum, string>

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: '24px'
}

const container = {
  margin: '0 auto',
  padding: '0',
  width: '100%',
  maxWidth: '500px'
}

const ctaButton = {
  backgroundColor: PALETTE.SKY_500,
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  borderRadius: '4px',
  textDecoration: 'none',
  display: 'inline-block',
  paddingTop: '16px',
  paddingBottom: '16px',
  paddingLeft: '12px',
  paddingRight: '12px',
  marginTop: '24px'
}

const brandSubtitle = {
  fontSize: '14px',
  color: PALETTE.SLATE_700,
  margin: 0
}

const unsubscribeLink = {
  color: PALETTE.SKY_500,
  textDecoration: 'underline'
}

const Brand = () => {
  return (
    <Section style={{marginTop: '32px'}}>
      <Img
        src={`${ExternalLinks.EMAIL_CDN}email-header-branding-color.png`}
        alt='Parabol'
        style={{marginBottom: '8px'}}
        {...EMAIL_CORS_OPTIONS}
      />
      <Text style={brandSubtitle}>Collaborative Workflows & Insights</Text>
    </Section>
  )
}

const UnsubscribeFooter = () => {
  const unsubscribeURL = makeAppURL(appOrigin, '/me/profile')
  return (
    <Section>
      <Text style={{fontSize: '12px', marginBottom: '0px'}}>{'Team & Page Invites'}</Text>
      <Text style={{fontSize: '12px', marginTop: '0px', lineHeight: '12px'}}>
        <a href={unsubscribeURL} style={unsubscribeLink}>
          Update email settings
        </a>
      </Text>
    </Section>
  )
}

const HelpFooter = () => {
  return (
    <Section>
      <Text style={{fontSize: '12px', marginBottom: '0px'}}>
        {'Get in touch if we can help in any way,'}
      </Text>
      <Text style={{fontSize: '12px', marginTop: '0px', lineHeight: '12px'}}>
        <a href='mailto:love@parabol.co' style={unsubscribeLink} title='love@parabol.co'>
          {'love@parabol.co'}
        </a>
      </Text>
    </Section>
  )
}

export interface PageAccessRequestProps {
  newUser?: boolean
  ownerName: string | null
  ownerEmail: string
  ownerAvatar: string
  pageLink: string
  pageName: string | null
  title: string
  role: PageRoleEnum
}

const PageAccessRequest = (props: PageAccessRequestProps) => {
  const {newUser, ownerName, ownerEmail, ownerAvatar, pageLink, pageName, title, role} = props
  const pageAccess = pageRoles[role] || 'view'
  const owner = ownerName ? ownerName : ownerEmail

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{marginBottom: '20px'}}>
            <h1 style={emailHeadingStyle}>{owner} shared a page</h1>
            <p style={emailCopyStyle}>
              <table style={emailTableBase} width='100%'>
                <tbody>
                  <tr>
                    <td valign='top' width='48px'>
                      <img
                        width='48px'
                        height='48px'
                        alt='Avatar'
                        style={{borderRadius: '24px'}}
                        src={ownerAvatar}
                      />
                    </td>
                    <td style={{paddingLeft: '18px'}}>
                      {ownerName ? (
                        <>
                          <span style={boldStyle}>{ownerName}</span>
                          {' ('}
                          <a href={`mailto:${ownerEmail}`} style={emailLinkStyle}>
                            {ownerEmail}
                          </a>
                          {')'}
                        </>
                      ) : (
                        <a href={`mailto:${ownerEmail}`} style={emailLinkStyle}>
                          {ownerEmail}
                        </a>
                      )}
                      {' has invited you to '}
                      <b>{pageAccess}</b>
                      {` ${pageName ? 'this' : 'a'} page in Parabol.`}
                    </td>
                  </tr>
                </tbody>
              </table>
              {pageName && (
                <table
                  style={{
                    border: `3px solid ${PALETTE.SLATE_600}`,
                    borderRadius: '8px',
                    borderCollapse: 'separate',
                    marginTop: '16px',
                    padding: '4px'
                  }}
                  width='100%'
                >
                  <tbody>
                    <tr>
                      <td align='center' valign='middle' width='32px'>
                        <Img
                          width='24px'
                          height='24px'
                          alt=''
                          style={imageStyle}
                          src={`${ExternalLinks.EMAIL_CDN}pages-sharing.png`}
                          {...EMAIL_CORS_OPTIONS}
                        />
                      </td>
                      <td
                        valign='baseline'
                        style={{
                          lineHeight: '20px',
                          padding: '8px 0',
                          fontWeight: 600,
                          color: PALETTE.SLATE_900
                        }}
                      >
                        {pageName}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              <Button style={ctaButton} href={pageLink}>
                Open Page
              </Button>
            </p>
          </Section>

          <Brand />
          {newUser ? <HelpFooter /> : <UnsubscribeFooter />}
        </Container>
      </Body>
    </Html>
  )
}

export default PageAccessRequest
