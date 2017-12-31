export default graphql`
  fragment CompleteTeamMemberFrag on TeamMember {
    id
    checkInOrder
    isLead
    isCheckedIn
    isConnected
    isNotRemoved
    picture
    preferredName
    teamId
  }
`;
