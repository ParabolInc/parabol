const subscription = graphql`
  subscription TeamMemberSubscription {
    teamMemberSubscription {
      __typename
      ...UpdateUserProfileMutation_teamMember @relay(mask: false)
    }
  }
`
const TeamMemberSubscription = () => {
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('teamMemberSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      switch (type) {
        case 'UpdateUserProfilePayload':
          break
        default:
          console.error('TeamMemberSubscription case fail', type)
      }
    }
  }
}

export default TeamMemberSubscription
