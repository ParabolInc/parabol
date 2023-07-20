import {toGlobalId, fromGlobalId} from 'graphql-relay'

const DomainJoinRequestId = {
  join: (id: number): string => toGlobalId('DomainJoinRequest', id),
  split: (id: string): number => {
    return parseInt(fromGlobalId(id).id, 10)
  }
}

export default DomainJoinRequestId
