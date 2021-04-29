import {AliasMapper} from './mergeGQLDocuments'

const dealiasResult = (data: Record<string, any>, aliasMapper: AliasMapper) => {
  const usesAlias = Object.keys(aliasMapper).length > 0
  if (!usesAlias) return data
  const returnData = {
    ...data
  }
  Object.entries(aliasMapper).forEach(([alias, name]) => {
    returnData[name] = returnData[alias]
    delete returnData[alias]
  })
  return returnData
}

export default dealiasResult
