export default function getFacilitatorName(team, members) {
  const facilitator = members.find((member) => member.id === team.activeFacilitator);
  return facilitator ? facilitator.preferredName : 'Facilitator';
}
