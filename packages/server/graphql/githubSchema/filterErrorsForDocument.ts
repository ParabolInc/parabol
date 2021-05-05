import {DocumentNode, FieldNode, OperationDefinitionNode, SelectionSetNode} from 'graphql'
import {GitHubGraphQLError} from './getRequestDataLoader'

const visitDocFotPath = (path: string[], selectionSetNode: SelectionSetNode) => {
  let isPathInDoc = true
  const findPathInDoc = (pathSlice: string[], node: SelectionSetNode | undefined) => {
    if (!pathSlice.length || !node) return
    const [firstPathName] = pathSlice
    const {selections} = node
    const matchingChild = selections.find(
      (selection) => selection.kind === 'Field' && selection.name.value === firstPathName
    ) as FieldNode | undefined
    if (!matchingChild) {
      isPathInDoc = false
      return
    }
    const {selectionSet} = matchingChild
    const nextPath = pathSlice.slice(1)
    findPathInDoc(nextPath, selectionSet)
  }
  findPathInDoc(path, selectionSetNode)
  return isPathInDoc
}
const filterErrorsForDocument = (document: DocumentNode, errors?: GitHubGraphQLError[] | null) => {
  if (!errors || !errors.length) return errors
  const {definitions} = document
  const operationNode = definitions.find(
    (definition) => definition.kind === 'OperationDefinition'
  ) as OperationDefinitionNode | undefined
  if (!operationNode) return errors
  const {selectionSet} = operationNode

  const filteredErrors = errors.filter(({path}) => {
    // If GitHub doesn't give us the path, don't filter it out
    if (!path) return true
    return !path || visitDocFotPath(path, selectionSet)
  })
  return filteredErrors.length ? filteredErrors : null
}

export default filterErrorsForDocument
