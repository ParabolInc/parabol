import graphql from 'babel-plugin-relay/macro'

graphql`
  fragment GenerateGroupsFrag_meeting on GenerateGroupsSuccess {
    meeting {
      id
      autogroupReflectionGroups {
        groupTitle
      }
    }
  }
`
