import graphql from 'babel-plugin-relay/macro'

graphql`
  fragment PublicTeamsFrag_team on Team {
    isViewerOnTeam
    organization {
      featureFlags {
        publicTeams
      }
      allTeams {
        id
      }
    }
  }
`
