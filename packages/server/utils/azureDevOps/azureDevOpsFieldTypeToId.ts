// Agile fields in map, TODO add Scrum and CMMI fields
export const fieldTypeToId = {
  'Basic:Issue': '/fields/Microsoft.VSTS.Scheduling.Effort',
  'Basic:Task': '/fields/Microsoft.VSTS.Scheduling.RemainingWork',
  'Agile:Epic': '/fields/Microsoft.VSTS.Scheduling.Effort',
  'Agile:Feature': '/fields/Microsoft.VSTS.Scheduling.Effort',
  'Agile:User Story': '/fields/Microsoft.VSTS.Scheduling.StoryPoints',
  'Agile:Task': '/fields/Microsoft.VSTS.Scheduling.OriginalEstimate',
  'Agile:Bug': '/fields/Microsoft.VSTS.Scheduling.StoryPoints',
  'Scrum:Bug': '/fields/Microsoft.VSTS.Scheduling.Effort',
  'Scrum:Epic': '/fields/Microsoft.VSTS.Scheduling.Effort',
  'Scrum:Feature': '/fields/Microsoft.VSTS.Scheduling.Effort',
  'Scrum:Product Backlog Item': '/fields/Microsoft.VSTS.Scheduling.Effort',
  'Scrum:Task': '/fields/Microsoft.VSTS.Scheduling.RemainingWork',
  'CMMI:Bug': '/fields/Microsoft.VSTS.Scheduling.Size',
  'CMMI:Change Request': '/fields/Microsoft.VSTS.Scheduling.Effort',
  'CMMI:Epic': '/fields/Microsoft.VSTS.Scheduling.Effort',
  'CMMI:Feature': '/fields/Microsoft.VSTS.Scheduling.Effort',
  'CMMI:Issue': '/fields/Microsoft.VSTS.Scheduling.OriginalEstimate',
  'CMMI:Requirement': '/fields/Microsoft.VSTS.Scheduling.Size',
  'CMMI:Risk': '/fields/Microsoft.VSTS.Scheduling.OriginalEstimate',
  'CMMI:Task': '/fields/Microsoft.VSTS.Scheduling.OriginalEstimate'
}

export const getInstanceId = (url: URL) => {
  const index = url.pathname.indexOf('/', 1)
  return url.hostname + url.pathname.substring(0, index)
}
