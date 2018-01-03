graphql`
  fragment FacilitatorDisconnectedToastFrag on NotifyFacilitatorDisconnected {
    type
    newFacilitator {
      preferredName
      userId
    }
    oldFacilitator {
      preferredName
    }
  }
`;
