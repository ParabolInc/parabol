import {ContactInfo, Threshold} from 'parabol-client/types/constEnums'
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

const innerMaxWidth = 480

const copyStyle = {
  ...emailCopyStyle
}

const linkStyle = {
  ...emailCopyStyle,
  ...emailLinkStyle
}

export interface LimitsEmailProps {
  appOrigin: string
  orgId: string
  preferredName: string
  orgName: string
}

export default function LockedEmail(props: LimitsEmailProps) {
  const {appOrigin, preferredName, orgId, orgName} = props
  const billingURL = makeAppURL(appOrigin, `/me/organizations/${orgId}/billing`, {
    searchParams: {
      utm_source: 'notification email',
      utm_medium: 'email',
      utm_campaign: 'locked-email'
    }
  })
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header align='left' appOrigin={appOrigin} corsOptions={EMAIL_CORS_OPTIONS} />
        <p style={{...copyStyle, marginBottom: '0px'}}>{`Hi ${preferredName} 👋`}</p>
        <EmptySpace height={16} />
        <p style={{...copyStyle, marginBottom: '0px'}}>
          {'Unfortunately, '}
          <span style={{fontWeight: 600}}>
            {`${orgName} has exceeded the two-team limit on the Starter Plan for more than ${Threshold.STARTER_TIER_LOCK_AFTER_DAYS} days, and your account has been deactivated.`}
          </span>
          {` You will not be able to use your ${orgName} account until you either delete teams so that you have two or fewer teams, or upgrade your account.`}
        </p>
        <EmptySpace height={16} />
        <p style={{...copyStyle}}>
          {`You can re-activate your teams by `}
          <a style={linkStyle} href={billingURL}>
            {`upgrading your account`}
          </a>
          {'.'}
        </p>
        <Button url={billingURL}>{'Reactivate Teams'}</Button>
        <EmptySpace height={16} />
        <p style={copyStyle}>
          {`If you have any questions, or if you'd like to discuss enterprise plans, feel free to contact us — `}
          <a style={linkStyle} href={`mailto:${ContactInfo.EMAIL_LOVE}`}>
            {`we're here to help`}
          </a>
          {`.`}
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
