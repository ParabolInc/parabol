import graphql from 'babel-plugin-relay/macro'

graphql`
  fragment UpgradeToTeamTierFrag_organization on UpgradeToTeamTierSuccess {
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
  fragment UpgradeToTeamTierFrag_team on UpgradeToTeamTierSuccess {
    teams {
      isPaid
      tier
    }
  }
`
