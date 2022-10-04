const effortField = '/fields/Microsoft.VSTS.Scheduling.Effort'
const remainingWorkField = '/fields/Microsoft.VSTS.Scheduling.RemainingWork'
const storyPointsField = '/fields/Microsoft.VSTS.Scheduling.StoryPoints'
const originalEstimateField = '/fields/Microsoft.VSTS.Scheduling.OriginalEstimate'
const sizeField = '/fields/Microsoft.VSTS.Scheduling.Size'

export const fieldTypeToId = {
  'Basic:Issue': effortField,
  'Basic:Task': remainingWorkField,
  'Agile:Epic': effortField,
  'Agile:Feature': effortField,
  'Agile:User Story': storyPointsField,
  'Agile:Task': originalEstimateField,
  'Agile:Bug': storyPointsField,
  'Scrum:Bug': effortField,
  'Scrum:Epic': effortField,
  'Scrum:Feature': effortField,
  'Scrum:Product Backlog Item': effortField,
  'Scrum:Task': remainingWorkField,
  'CMMI:Bug': sizeField,
  'CMMI:Change Request': effortField,
  'CMMI:Epic': effortField,
  'CMMI:Feature': effortField,
  'CMMI:Issue': originalEstimateField,
  'CMMI:Requirement': sizeField,
  'CMMI:Risk': originalEstimateField,
  'CMMI:Task': originalEstimateField
}

export const getInstanceId = (url: URL | string) => {
  const urlObj = typeof url === 'string' ? new URL(url) : url
  const index = urlObj.pathname.indexOf('/', 1)
  return urlObj.hostname + urlObj.pathname.substring(0, index)
}
