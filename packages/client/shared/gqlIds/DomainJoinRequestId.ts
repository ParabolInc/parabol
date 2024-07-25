import {GraphQLID} from 'graphql'

/**
 * Takes a type name and an ID specific to that type name, and returns a
 * "global ID" that is unique among all types.
 */
const toGlobalId = (type: string, id: string | number) => {
  return btoa([type, GraphQLID.serialize(id)].join(':'))
}

/**
 * Takes the "global ID" created by toGlobalID, and returns the type name and ID
 * used to create it.
 */
const fromGlobalId = (globalId: string) => {
  const unbasedGlobalId = atob(globalId)
  const delimiterPos = unbasedGlobalId.indexOf(':')
  return {
    type: unbasedGlobalId.substring(0, delimiterPos),
    id: unbasedGlobalId.substring(delimiterPos + 1)
  }
}

const DomainJoinRequestId = {
  join: (id: number): string => toGlobalId('DomainJoinRequest', id),
  split: (id: string): number => {
    return parseInt(fromGlobalId(id).id, 10)
  }
}

export default DomainJoinRequestId
