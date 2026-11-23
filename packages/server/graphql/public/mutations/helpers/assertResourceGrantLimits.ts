import {GraphQLError} from 'graphql'

const MAX_GRANTED_IDS = 100

interface GrantedIds {
  grantedOrgIds?: readonly string[] | null
  grantedTeamIds?: readonly string[] | null
  grantedPageIds?: readonly string[] | null
}

const assertResourceGrantLimits = ({grantedOrgIds, grantedTeamIds, grantedPageIds}: GrantedIds) => {
  const grantedIdsByResource = {
    organizations: grantedOrgIds,
    teams: grantedTeamIds,
    pages: grantedPageIds
  }
  for (const [resource, ids] of Object.entries(grantedIdsByResource)) {
    if (ids && ids.length > MAX_GRANTED_IDS) {
      throw new GraphQLError(`Cannot grant access to more than ${MAX_GRANTED_IDS} ${resource}`, {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
  }
}

export default assertResourceGrantLimits
