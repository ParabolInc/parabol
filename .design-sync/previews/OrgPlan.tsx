import {OrgPlan} from 'parabol-client'

// OrgPlan takes plain object props (no Relay fragment). Each `plan` describes a
// pricing tier rendered as a selectable billing card.
const noop = () => {}

export const StarterPlan = () => (
  <div className='flex w-72'>
    <OrgPlan
      isTablet={false}
      handleClick={noop}
      plan={{
        tier: 'starter',
        subtitle: 'Free forever',
        details: ['2 teams', 'Unlimited members', 'Retrospectives & Check-ins'],
        buttonStyle: 'secondary',
        buttonLabel: 'Current Plan',
        isActive: true
      }}
    />
  </div>
)

export const TeamPlan = () => (
  <div className='flex w-72'>
    <OrgPlan
      isTablet={false}
      handleClick={noop}
      plan={{
        tier: 'team',
        details: ['Unlimited teams', 'Sprint Poker estimation', 'Priority support'],
        buttonStyle: 'primary',
        buttonLabel: 'Select Plan',
        isActive: false
      }}
    />
  </div>
)

export const EnterprisePlan = () => (
  <div className='flex w-72'>
    <OrgPlan
      isTablet={false}
      handleClick={noop}
      plan={{
        tier: 'enterprise',
        subtitle: 'Custom pricing',
        details: ['SSO / SAML', 'Dedicated success manager', 'Custom contracts'],
        buttonStyle: 'secondary',
        buttonLabel: 'Contact',
        isActive: false
      }}
    />
  </div>
)
