import {Kind, parse} from 'graphql'

type OperationKind = 'query' | 'mutation' | 'subscription' | 'invalid'

const getOperationKind = (document: string, operationName?: string): OperationKind => {
  try {
    const operations = parse(document).definitions.filter(
      (definition) => definition.kind === Kind.OPERATION_DEFINITION
    )
    const operation = operationName
      ? operations.find(({name}) => name?.value === operationName)
      : operations.length === 1
        ? operations[0]
        : undefined
    return operation?.operation ?? 'invalid'
  } catch {
    return 'invalid'
  }
}

export default getOperationKind
