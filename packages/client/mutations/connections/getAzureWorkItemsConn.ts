import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getAzureWorkItemsConn = (
  azureDevOpsIntegration: ReadOnlyRecordProxy | null | undefined,
  isWIQL: boolean | undefined,
  queryString: string | undefined,
  projectKeyFilters: string[] | undefined
) => {
  if (azureDevOpsIntegration) {
    return ConnectionHandler.getConnection(
      azureDevOpsIntegration,
      'AzureDevOpsScopingSearchResults_workItems',
      {
        isWIQL: isWIQL || false,
        projectKeyFilters: projectKeyFilters || [],
        queryString: queryString || ''
      }
    )
  }
  return null
}

export default getAzureWorkItemsConn
