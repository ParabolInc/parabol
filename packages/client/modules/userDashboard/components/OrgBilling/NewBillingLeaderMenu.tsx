import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {
  NewBillingLeaderMenu_organization$data,
  NewBillingLeaderMenu_organization$key
} from '~/__generated__/NewBillingLeaderMenu_organization.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import {EmptyDropdownMenuItemLabel} from '../../../../components/EmptyDropdownMenuItemLabel'
import TypeAheadLabel from '../../../../components/TypeAheadLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useFilteredItems from '../../../../hooks/useFilteredItems'
import useMutationProps from '../../../../hooks/useMutationProps'
import SetOrgUserRoleMutation from '../../../../mutations/SetOrgUserRoleMutation'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../../ui/Menu/MenuItem'

interface Props {
  organizationRef: NewBillingLeaderMenu_organization$key
  newLeaderSearchQuery: string
}

const getOrgUserPreferredName = (
  orgUser: NewBillingLeaderMenu_organization$data['organizationUsers']['edges'][0]
) => orgUser.node.user.preferredName.toLowerCase()

const NewBillingLeaderMenu = (props: Props) => {
  const {organizationRef, newLeaderSearchQuery} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()
  const organization = useFragment(
    graphql`
      fragment NewBillingLeaderMenu_organization on Organization {
        id
        billingLeaders {
          userId
        }
        organizationUsers {
          edges {
            node {
              id
              user {
                id
                preferredName
                picture
              }
            }
          }
        }
      }
    `,
    organizationRef
  )
  const {id: orgId, organizationUsers, billingLeaders} = organization
  const nonLeaderOrgUsers = useMemo(() => {
    return organizationUsers.edges.filter((organizationUser) => {
      const {node} = organizationUser
      const {user} = node
      const {id: userId} = user
      return !billingLeaders.some((billingLeader) => {
        const {userId: billingLeaderId} = billingLeader
        return billingLeaderId === userId
      })
    })
  }, [billingLeaders, organizationUsers])

  const query = newLeaderSearchQuery.toLowerCase()
  const filteredOrgUsers = useFilteredItems(query, nonLeaderOrgUsers, (orgUser) =>
    getOrgUserPreferredName(orgUser)
  )

  const handleClick = (userId: string) => {
    const role = 'BILLING_LEADER' as const
    const variables = {orgId, userId, role}
    SetOrgUserRoleMutation(atmosphere, variables, {onError, onCompleted})
  }

  return (
    <MenuContent align='start' onCloseAutoFocus={(e) => e.preventDefault()}>
      {filteredOrgUsers.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No team members found!
        </EmptyDropdownMenuItemLabel>
      )}
      {filteredOrgUsers.slice(0, 10).map((organizationUser) => {
        const {node} = organizationUser
        const {user} = node
        const {id: userId, preferredName, picture} = user
        return (
          <MenuItem key={userId} onClick={() => handleClick(userId)}>
            <div className='pr-8'>
              <Avatar picture={picture} className='h-8 w-8' />
            </div>
            <TypeAheadLabel query={newLeaderSearchQuery} label={preferredName} />
          </MenuItem>
        )
      })}
    </MenuContent>
  )
}

export default NewBillingLeaderMenu
