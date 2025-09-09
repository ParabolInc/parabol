import DescriptionIcon from '@mui/icons-material/Description'
import {ExternalLinks} from 'parabol-client/types/constEnums'
import {PageRoleEnum} from '../../../__generated__/NotificationSubscription.graphql'
import {PALETTE} from '../../../styles/paletteV3'
import type {CorsOptions} from '../../../types/cors'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature, emailTableBase} from '../styles'
import Button from './Button'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmptySpace from './EmptySpace/EmptySpace'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

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

const imageLinkStyle = {
  display: 'block',
  textDecoration: 'none'
}

const subTitleStyle = {
  ...emailCopyStyle,
  fontSize: '18px',
  fontWeight: 600,
  paddingTop: '8px',
  color: PALETTE.SLATE_900
}

export const pageRoles = {
  owner: 'edit',
  editor: 'edit',
  commenter: 'comment on',
  viewer: 'view'
} as const satisfies Record<PageRoleEnum, string>

export interface PageSharedInviteProps {
  appOrigin: string
  ownerName: string
  ownerEmail: string
  ownerAvatar: string
  pageLink: string
  pageName: string
  role: PageRoleEnum
  corsOptions: CorsOptions
}

const PageSharedInvite = (props: PageSharedInviteProps) => {
  const {appOrigin, ownerName, ownerEmail, ownerAvatar, pageLink, pageName, role, corsOptions} =
    props
  const pageAccess = pageRoles[role] || 'view'
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <h1 style={emailHeadingStyle}>{ownerName} shared a page</h1>
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
                  <span style={boldStyle}>{ownerName}</span>
                  {' ('}
                  <a href={`mailto:${ownerEmail}`} style={emailLinkStyle}>
                    {ownerEmail}
                  </a>
                  {') has invited you to '}
                  <b>{pageAccess}</b>
                  {' this page in Parabol.'}
                </td>
              </tr>
            </tbody>
          </table>
          <table
            style={{
              border: `2px solid ${PALETTE.SLATE_300}`,
              borderRadius: '8px',
              borderCollapse: 'separate',
              margin: '16px 0',
              padding: '4px'
            }}
            width='100%'
          >
            <tbody>
              <tr>
                <td align='center' valign='middle' width='32px'>
                  <DescriptionIcon
                    style={{verticalAlign: 'middle', width: '24px', height: '24px'}}
                  />
                </td>
                <td
                  valign='baseline'
                  style={{
                    lineHeight: '20px',
                    padding: '8px 0 6px',
                    fontWeight: 600,
                    color: PALETTE.SLATE_900
                  }}
                >
                  {pageName}
                </td>
              </tr>
            </tbody>
          </table>
          <Button url={pageLink}>Open Page</Button>
        </p>
        <EmptySpace height={24} />
        <p style={emailCopyStyle}>
          <table style={emailTableBase} width='100%'>
            <tbody>
              <tr>
                <td align='left'>
                  <a style={imageLinkStyle} href={appOrigin}>
                    <img
                      alt='Parabol, Inc. Logo'
                      height={42}
                      src={`${ExternalLinks.EMAIL_CDN}email-header-branding-color@3x.png`}
                      style={imageStyle}
                      width={204}
                      {...corsOptions}
                    />
                  </a>
                </td>
              </tr>
              <tr>
                <td align='left' style={subTitleStyle}>
                  {'Collaborative Workflows & Insights'}
                </td>
              </tr>
            </tbody>
          </table>
        </p>
        <p style={emailCopyStyle}>
          {'Get in touch if we can help in any way,'}
          <br />
          {emailProductTeamSignature}
          <br />
          <a href='mailto:love@parabol.co' style={emailLinkStyle} title='love@parabol.co'>
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

export default PageSharedInvite
