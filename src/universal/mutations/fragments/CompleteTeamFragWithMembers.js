export default graphql`
  fragment CompleteTeamFragWithMembers on Team {
    ...CompleteTeamFrag @relay(mask: false)
    teamMembers(sortBy: "preferredName") {
      ...CompleteTeamMemberFrag @relay(mask: false)
    }
  }
`;
