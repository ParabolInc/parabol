export default function getOutcomeNames(outcome, mutation) {
  if (mutation === 'update') {
    return outcome.status ?
    {argName: 'updatedProject', mutationName: 'updateProject'} :
    {argName: 'updatedAction', mutationName: 'updateAction'};
  } else if (mutation === 'delete') {
    return outcome.status ?
    {argName: 'projectId', mutationName: 'deleteProject'} :
    {argName: 'actionId', mutationName: 'deleteAction'};
  } else if (mutation === 'toggleType') {
    return outcome.status ?
    {argName: 'projectId', mutationName: 'makeAction'} :
    {argName: 'actionId', mutationName: 'makeProject'};
  }
}

