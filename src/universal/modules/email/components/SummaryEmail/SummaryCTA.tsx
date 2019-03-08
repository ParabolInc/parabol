import React from 'react'
import {Link} from 'react-router-dom'
import CreateAccountSection from 'universal/modules/email/components/CreateAccountSection/CreateAccountSection'
import {emailPrimaryButtonStyle, emailRuleStyle} from 'universal/styles/email'

type SummaryReferrer = 'email' | 'meeting' | 'history'

interface Props {
  isDemo: boolean
  referrer: SummaryReferrer
  teamDashUrl: string
}

const ruleStyle = {
  ...emailRuleStyle,
  width: '100%'
}

const teamDashLabel = 'Go to Team Dashboard'

const teamDashLinkStyle = {
  ...emailPrimaryButtonStyle,
  fontSize: '14px',
  padding: '6px 0',
  width: '186px'
}

const SummaryCTA = (props: Props) => {
  const {isDemo, referrer, teamDashUrl} = props
  if (isDemo) {
    return (
      <React.Fragment>
        <hr style={ruleStyle} />
        <CreateAccountSection />
      </React.Fragment>
    )
  }
  if (referrer === 'email') {
    return (
      <a href={teamDashUrl} style={teamDashLinkStyle} title={teamDashLabel}>
        {teamDashLabel}
      </a>
    )
  }
  return (
    <Link to={teamDashUrl} style={teamDashLinkStyle} title={teamDashLabel}>
      {teamDashLabel}
    </Link>
  )
}

export default SummaryCTA
