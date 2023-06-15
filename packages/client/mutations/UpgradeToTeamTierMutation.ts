import graphql from 'babel-plugin-relay/macro'

graphql`
  fragment UpgradeToTeamTierMutation_organization on UpgradeToTeamTierSuccess {
    organization {
      creditCard {
        brand
        last4
        expiry
      }
      company {
        tier
      }
      tier
      periodEnd
      periodStart
      updatedAt
      lockedAt
    }
    meetings {
      showConversionModal
    }
  }
`

graphql`
  fragment UpgradeToTeamTierMutation_team on UpgradeToTeamTierSuccess {
    teams {
      isPaid
      tier
    }
  }
`
