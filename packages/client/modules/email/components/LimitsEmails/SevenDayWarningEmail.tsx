import {ContactInfo, ExternalLinks, Threshold} from 'parabol-client/types/constEnums'
import React from 'react'
import {EMAIL_CORS_OPTIONS} from '../../../../types/cors'
import makeAppURL from '../../../../utils/makeAppURL'
import {emailCopyStyle, emailLinkStyle} from '../../styles'
import Button from './../Button'
import EmailBlock from './../EmailBlock/EmailBlock'
import EmailFooter from './../EmailFooter/EmailFooter'
import EmptySpace from './../EmptySpace/EmptySpace'
import Header from './../Header/Header'
import Layout from './../Layout/Layout'
import {LimitsEmailProps} from './LockedEmail'

const innerMaxWidth = 480

const copyStyle = {
  ...emailCopyStyle
}

const linkStyle = {
  ...emailCopyStyle,
  ...emailLinkStyle
}

export default function SevenDayWarningEmail(props: LimitsEmailProps) {
  const {appOrigin, preferredName, orgId, orgName} = props
  const billingURL = makeAppURL(appOrigin, `/me/organizations/${orgId}/billing`, {
    searchParams: {
      utm_source: 'notification email',
      utm_medium: 'email',
      utm_campaign: 'seven-day-warning-email'
    }
  })
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header align='left' appOrigin={appOrigin} corsOptions={EMAIL_CORS_OPTIONS} />
        <p style={{...copyStyle, marginBottom: '0px'}}>{`Hi ${preferredName} 👋`}</p>
        <EmptySpace height={16} />
        <p style={{...copyStyle, marginBottom: '0px'}}>
          {'This is a follow-up notification to remind you that '}
          <span style={{fontWeight: 600}}>
            {`${orgName}'s Parabol account is at risk of deactivation`}
          </span>
          {' because you’ve exceeded the two team limit on your '}
          <a style={linkStyle} href={ExternalLinks.PRICING_LINK}>
            {'Starter Plan'}
          </a>
          {
            '. Once your account is deactivated, you will lose access to your teams and won’t be able to run Retrospective, Sprint Poker or Standup meetings with Parabol.'
          }
        </p>
        <EmptySpace height={16} />
        <p style={{...copyStyle}}>
          {`You'll need to `}
          <span style={{fontWeight: 600, textDecoration: 'underline'}}>
            {`upgrade your account within the next ${Threshold.FINAL_WARNING_DAYS_BEFORE_LOCK} days`}
          </span>
          {` to avoid losing access to your agile meetings.`}
        </p>
        <Button url={billingURL}>{'Keep Access'}</Button>
        <EmptySpace height={16} />
        <p style={copyStyle}>
          {`If you aren’t able to upgrade, we'll automatically deactivate the teams over the limit. If you have any questions, feel free to `}
          <a style={linkStyle} href={`mailto:${ContactInfo.EMAIL_LOVE}`}>
            {'contact us'}
          </a>
          {` —— we're happy to help make this process as smooth as possible.`}
        </p>
        <p style={copyStyle}>{'Parabol Team'}</p>
        <EmptySpace height={16} />
      </EmailBlock>
      <EmailBlock hasBackgroundColor innerMaxWidth={innerMaxWidth}>
        <EmailFooter />
      </EmailBlock>
    </Layout>
  )
}
