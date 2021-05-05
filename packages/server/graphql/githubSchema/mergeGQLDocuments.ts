import {
  DefinitionNode,
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  print,
  SelectionNode,
  SelectionSetNode,
  VariableDefinitionNode
} from 'graphql'

interface MutableSelectionSetNode extends SelectionSetNode {
  selections: SelectionSetNode['selections'][0][]
}

interface BaseOperationDefinitionNode extends OperationDefinitionNode {
  variableDefinitions: NonNullable<OperationDefinitionNode['variableDefinitions']>[0][]
  selectionSet: MutableSelectionSetNode
}

export interface AliasMapper {
  [aliasedName: string]: string
}

interface CachedExecParams {
  document: DocumentNode
  variables: Record<string, any>
}

const addNewFragmentDefinition = (
  baseDefinitions: DefinitionNode[],
  definition: FragmentDefinitionNode
) => {
  const {name} = definition
  const {value: definitionName} = name
  const baseFragmentNames = new Set<string>()
  baseDefinitions.forEach((definition) => {
    if (definition.kind === 'FragmentDefinition') {
      baseFragmentNames.add(definition.name.value)
    }
  })
  if (!baseFragmentNames.has(definitionName)) {
    baseDefinitions.push(definition)
  }
}

const getSelectionNamesAndAliases = (selections: SelectionNode[]) => {
  const usedNames = new Set<string>()
  selections.forEach((selection) => {
    if (selection.kind === 'Field') {
      usedNames.add(selection.name.value)
      const alias = selection.alias?.value
      if (alias) {
        usedNames.add(alias)
      }
    }
  })
  return usedNames
}

const gqlNodesAreEqual = (leftNode: FieldNode, rightNode: FieldNode) => {
  const leftStr = print(leftNode)
  const rightStr = print(rightNode)
  return leftStr === rightStr
}

const aliasFieldNode = (node: FieldNode, alias: string) => {
  return {
    ...node,
    alias: {
      kind: 'Name',
      value: alias
    }
  } as FieldNode
}

const addNewVariableDefinitions = (
  baseVarDefs: VariableDefinitionNode[],
  variableDefinitions: VariableDefinitionNode[]
) => {
  variableDefinitions.forEach((curVarDef) => {
    const {variable} = curVarDef
    const {name} = variable
    const {value: varDefName} = name
    const isPresent = baseVarDefs.find((varDef) => {
      varDef.variable.name.value === varDefName
    })
    if (!isPresent) {
      baseVarDefs.push(curVarDef)
    }
  })
}

const addNewSelections = (
  baseSelections: SelectionNode[],
  selections: SelectionNode[],
  aliasIdx: number,
  aliasMapper: AliasMapper,
  isMutation: boolean
) => {
  selections.forEach((selection) => {
    if (selection.kind === 'InlineFragment') {
      // GQL engine will dedupe if there are multiple that are exactly the same
      baseSelections.push(selection)
      return
    }
    const {name} = selection
    const {value: selectionName} = name
    if (selection.kind === 'FragmentSpread') {
      // if it's a new fragment spread, add it, else ignore
      const existingFrag = baseSelections.find(
        (selection) => selection.kind === 'FragmentSpread' && selection.name.value === selectionName
      )
      if (!existingFrag) {
        baseSelections.push(selection)
      }
      return
    }

    // if it's a new field node, add it
    const existingField = baseSelections.find(
      (selection) => selection.kind === 'Field' && selection.name.value === selectionName
    ) as FieldNode
    if (!existingField) {
      baseSelections.push(selection)
      return
    }

    // If this node is already present, don't include it again
    // Mutations are the exception. we want to run them all
    if (!isMutation && gqlNodesAreEqual(existingField, selection)) return

    // if the node has the same name but different children or arguments, alias it
    // there is some high hanging fruit where we could alias the children inside this
    const usedNames = getSelectionNamesAndAliases(baseSelections)
    let aliasedName = `${selectionName}_${aliasIdx}`
    while (usedNames.has(aliasedName)) {
      aliasedName = `${aliasedName}X`
    }
    const aliasedSelection = aliasFieldNode(selection, aliasedName)
    aliasMapper[aliasedName] = selection.alias?.value ?? selectionName
    baseSelections.push(aliasedSelection)
  })
}

const addNewOperationDefinition = (
  baseDefinitions: DefinitionNode[],
  definition: DefinitionNode,
  aliasIdx: number,
  aliasMapper: AliasMapper,
  isMutation: boolean
) => {
  const {operation, variableDefinitions, selectionSet} = definition as BaseOperationDefinitionNode
  // add completely new ops
  const matchingOp = baseDefinitions.find(
    (curDef) => curDef.kind === 'OperationDefinition' && curDef.operation === operation
  ) as BaseOperationDefinitionNode
  if (!matchingOp) {
    baseDefinitions.push(definition)
    return
  }
  // merge var defs
  const {variableDefinitions: baseVarDefs, selectionSet: baseSelectionSet} = matchingOp
  const {selections: baseSelections} = baseSelectionSet
  addNewVariableDefinitions(baseVarDefs, variableDefinitions)

  // merge selection set
  const {selections} = selectionSet
  addNewSelections(baseSelections, selections, aliasIdx, aliasMapper, isMutation)
}

const mergeGQLDocuments = (cachedExecParams: CachedExecParams[], isMutation?: boolean) => {
  if (cachedExecParams.length === 1) {
    return {
      ...cachedExecParams[0],
      aliasMappers: [{}] as AliasMapper[]
    }
  }
  const aliasMappers = [] as AliasMapper[]
  const baseDefinitions = [] as DefinitionNode[]
  const baseVariables = {}

  cachedExecParams.forEach((execParams, aliasIdx) => {
    const aliasMapper = {}
    const {document, variables} = execParams
    const {definitions} = document
    definitions.forEach((definition) => {
      if (definition.kind === 'OperationDefinition') {
        addNewOperationDefinition(baseDefinitions, definition, aliasIdx, aliasMapper, !!isMutation)
      } else if (definition.kind === 'FragmentDefinition') {
        addNewFragmentDefinition(baseDefinitions, definition)
      }
    })
    Object.assign(baseVariables, variables)
    aliasMappers.push(aliasMapper)
  })
  const mergedDoc = {
    kind: 'Document' as const,
    definitions: baseDefinitions
  }
  return {document: mergedDoc, variables: baseVariables, aliasMappers}
}

export default mergeGQLDocuments
