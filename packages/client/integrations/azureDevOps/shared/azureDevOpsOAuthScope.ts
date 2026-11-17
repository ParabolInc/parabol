const AZURE_DEVOPS_RESOURCE_ID = '499b84ac-1321-427f-aa17-267ca6975798'

/** Work items and project names only. Never the resource's .default: that grants every permission on the app registration, source code included */
const azureDevOpsOAuthScope = [
  `${AZURE_DEVOPS_RESOURCE_ID}/vso.project`,
  `${AZURE_DEVOPS_RESOURCE_ID}/vso.work_write`,
  'offline_access'
].join(' ')

export default azureDevOpsOAuthScope
