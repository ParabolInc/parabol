export default function getFacilitatorName(activeFacilitator, teamMembers) {
  const facilitator = teamMembers.find((member) => member.id === activeFacilitator);
  return facilitator ? facilitator.preferredName : 'Facilitator';
}
