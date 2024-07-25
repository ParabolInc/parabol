import graphql from 'babel-plugin-relay/macro'

graphql`
  fragment PublicTeamsFrag_team on Team {
    isViewerOnTeam
    agendaItems {
      id
    }
    organization {
      featureFlags {
        publicTeams
      }
      allTeams {
        id
      }
      viewerTeams {
        id
      }
      publicTeams {
        id
      }
    }
  }
`
