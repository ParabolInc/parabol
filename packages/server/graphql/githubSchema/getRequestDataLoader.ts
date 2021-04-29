import DataLoader from 'dataloader'
import {DocumentNode} from 'graphql'
import dealiasResult from './dealiasResult'
import executeGitHubFetch from './executeGitHubFetch'
import mergeGQLDocuments from './mergeGQLDocuments'
import transformGitHubResponse from './transformGitHubResponse'

interface DataLoaderKey {
  document: DocumentNode
  variables: Record<string, unknown>
  accessToken: string
  options: {
    prefix: string
    isMutation: boolean
  }
}

type GitHubDataLoader = DataLoader<DataLoaderKey, any>

const queryDataLoaderWeakMap = new WeakMap<Record<string, unknown>, GitHubDataLoader>()

const batchFn = async (keys: readonly DataLoaderKey[]) => {
  const execParamsByToken = {} as {
    [accessToken: string]: {
      document: DocumentNode
      variables: Record<string, unknown>
      idx: number
    }[]
  }
  keys.forEach((key, idx) => {
    const {accessToken} = key
    execParamsByToken[accessToken] = execParamsByToken[accessToken] || []
    execParamsByToken[accessToken].push({
      document: key.document,
      variables: key.variables,
      idx
    })
  })
  const [firstKey] = keys
  const {options} = firstKey
  const {isMutation, prefix} = options
  const results = [] as any[]
  await Promise.all(
    Object.entries(execParamsByToken).map(async ([accessToken, execParams]) => {
      const {document, variables, aliasMappers} = mergeGQLDocuments(execParams, isMutation)
      const aliasedResult = await executeGitHubFetch(document, variables, accessToken)
      transformGitHubResponse(aliasedResult, prefix)
      const {data} = aliasedResult

      execParams.forEach((execParam, idx) => {
        const aliasMapper = aliasMappers[idx]
        const {idx: resultsIdx} = execParam
        results[resultsIdx] = dealiasResult(data, aliasMapper)
      })
    })
  )
  return results
}

const getRequestDataLoader = (key: Record<any, any>) => {
  const existingDataLoader = queryDataLoaderWeakMap.get(key)
  if (existingDataLoader) return existingDataLoader
  const newDataLoader = new DataLoader<DataLoaderKey, any>(batchFn, {
    cache: false
  })
  queryDataLoaderWeakMap.set(key, newDataLoader)
  return newDataLoader
}

export default getRequestDataLoader
