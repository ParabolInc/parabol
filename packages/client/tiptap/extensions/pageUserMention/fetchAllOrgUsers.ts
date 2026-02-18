import graphql from 'babel-plugin-relay/macro'
import type {fetchAllOrgUsersQuery} from '../../../__generated__/fetchAllOrgUsersQuery.graphql'
import type Atmosphere from '../../../Atmosphere'

export const fetchAllOrgUsersQueryNode = graphql`
  query fetchAllOrgUsersQuery {
    viewer {
      organizations {
        organizationUsers(first: 1000) {
          edges {
            node {
              user {
                id
                picture
                preferredName
              }
            }
          }
        }
      }
    }
  }
`

export const fetchAllOrgUsers = async (atmosphere: Atmosphere) => {
  const res = await atmosphere.fetchQuery<fetchAllOrgUsersQuery>(fetchAllOrgUsersQueryNode, {
    fetchPolicy: 'store-or-network'
  })
  if (!res || res instanceof Error) return new Map()

  const allUsers = new Map<string, {id: string; picture?: string; preferredName: string}>()

  res.viewer.organizations.forEach((org) => {
    org?.organizationUsers?.edges.forEach((edge) => {
      const user = edge.node.user
      if (!allUsers.has(user.id)) {
        allUsers.set(user.id, {
          id: user.id,
          picture: user.picture,
          preferredName: user.preferredName
        })
      }
    })
  })

  return allUsers
}
