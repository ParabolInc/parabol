
export const teamQueryString = `
query ($teamId: ID!) {
  team: getTeamById(teamId: $teamId) {
    name,
    members {
    	isActive,
    	isLead,
    	isFacilitator,
      cachedUser {
        picture,
        profile {
          preferredName
        }
			}
    }
  }
}
`;

export const teamQueryOptions = (teamId) => ({
  component: 'MeetingContainer',
  variables: { teamId }
});
