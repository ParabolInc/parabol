export default graphql`
  fragment CompleteInvitationFrag on Invitation {
    id
    email
    teamId
    updatedAt
  }
`;
