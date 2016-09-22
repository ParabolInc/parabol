export default function getOutcomeNames(outcome) {
  return outcome.status ?
  {argName: 'updatedProject', mutationName: 'updateProject'} :
  {argName: 'updatedAction', mutationName: 'updateAction'};
}

