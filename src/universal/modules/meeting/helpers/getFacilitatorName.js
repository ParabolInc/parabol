export default function getFacilitatorName(activeFacilitator, members) {
  const facilitator = members.find((member) => member.id === activeFacilitator);
  return facilitator ? facilitator.preferredName : 'Facilitator';
}
