import {ContactInfo, ExternalLinks, Threshold} from 'parabol-client/types/constEnums'
import React from 'react'
import {EMAIL_CORS_OPTIONS} from '../../../../types/cors'
import makeAppURL from '../../../../utils/makeAppURL'
import {emailCopyStyle, emailLinkStyle} from '../../styles'
import Button from '../Button'
import EmailBlock from '../EmailBlock/EmailBlock'
import EmailFooter from '../EmailFooter/EmailFooter'
import EmptySpace from '../EmptySpace/EmptySpace'
import Header from '../Header/Header'
import Layout from '../Layout/Layout'
import {LimitsEmailProps} from './LockedEmail'

const innerMaxWidth = 480

const copyStyle = {
  ...emailCopyStyle
}

const linkStyle = {
  ...emailCopyStyle,
  ...emailLinkStyle
}

export default function ThirtyDayWarningEmail(props: LimitsEmailProps) {
  const {appOrigin, preferredName, orgId, orgName} = props
  const billingURL = makeAppURL(appOrigin, `/me/organizations/${orgId}/billing`, {
    searchParams: {
      utm_source: 'notification email',
      utm_medium: 'email',
      utm_campaign: 'thirty-day-warning-email'
    }
  })
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header align='left' appOrigin={appOrigin} corsOptions={EMAIL_CORS_OPTIONS} />
        <p style={{...copyStyle, marginBottom: '0px'}}>{`Hi ${preferredName} 👋`}</p>
        <EmptySpace height={16} />
        <p style={{...copyStyle, marginBottom: '0px'}}>
          {'This is a friendly note to let you know that '}
          <span style={{fontWeight: 600}}>
            {`${orgName} has officially reached ${Threshold.MAX_PERSONAL_TIER_TEAMS} active teams on Parabol`}
          </span>
          {
            ' - congrats! We love to see organizations finding value in Parabol and improving their teams in the process.'
          }
        </p>
        <EmptySpace height={16} />
        <p style={{...copyStyle}}>
          {`As a reminder: `}
          <span style={{fontWeight: 600}}>{`Parabol's `}</span>
          <a style={linkStyle} href={ExternalLinks.PRICING_LINK}>
            {'Starter Plan'}
          </a>
          <span style={{fontWeight: 600}}>{` has a limit of two teams`}</span>
          {`. Please `}
          <a style={linkStyle} href={billingURL}>
            {'upgrade your account'}
          </a>
          {` to continue using Parabol with all of your teams.`}
        </p>
        <Button url={billingURL}>{'Upgrade'}</Button>
        <EmptySpace height={16} />
        <p style={copyStyle}>
          {`If you aren’t ready to upgrade, then `}
          <span
            style={{fontWeight: 600}}
          >{`in 30 days your account will revert to the two teams `}</span>
          {`allowed on the Starter plan. Feel free to `}
          <a style={linkStyle} href={`mailto:${ContactInfo.EMAIL_LOVE}`}>
            {'contact us'}
          </a>
          {` with any questions - we’re here to help!`}
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
