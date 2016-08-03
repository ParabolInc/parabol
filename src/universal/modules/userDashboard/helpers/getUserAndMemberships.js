
export const getUserAndMemberships = `
query {
  user: getCurrentUser {
    id,
    email,
    id,
    isNew,
    picture,
    preferredName
    memberships {
      id,
      team {
       id,
       name
      },
      isLead,
      isActive,
      isFacilitator
    }
  }
}`;

export const queryOpts = {
  component: 'TeamContainer',
  localOnly: true
};
