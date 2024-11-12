import graphql from 'babel-plugin-relay/macro'
import {forwardRef, useMemo} from 'react'
import {useFragment} from 'react-relay'
import {
  NewBillingLeaderMenu_organization$data,
  NewBillingLeaderMenu_organization$key
} from '~/__generated__/NewBillingLeaderMenu_organization.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import {EmptyDropdownMenuItemLabel} from '../../../../components/EmptyDropdownMenuItemLabel'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import TypeAheadLabel from '../../../../components/TypeAheadLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useFilteredItems from '../../../../hooks/useFilteredItems'
import {MenuProps} from '../../../../hooks/useMenu'
import useMutationProps from '../../../../hooks/useMutationProps'
import SetOrgUserRoleMutation from '../../../../mutations/SetOrgUserRoleMutation'

interface Props {
  menuProps: MenuProps
  organizationRef: NewBillingLeaderMenu_organization$key
  newLeaderSearchQuery: string
}

const getOrgUserPreferredName = (
  orgUser: NewBillingLeaderMenu_organization$data['organizationUsers']['edges'][0]
) => orgUser.node.user.preferredName.toLowerCase()

const NewBillingLeaderMenu = forwardRef((props: Props, ref: any) => {
  const {menuProps, organizationRef, newLeaderSearchQuery} = props
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
    <Menu ariaLabel='Select New Billing Leader' keepParentFocus {...menuProps}>
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
          <MenuItem
            ref={ref}
            key={userId}
            label={
              <MenuItemLabel>
                <div className='pr-8'>
                  <Avatar picture={picture} className='h-8 w-8' />
                </div>
                <TypeAheadLabel query={newLeaderSearchQuery} label={preferredName} />
              </MenuItemLabel>
            }
            onClick={() => handleClick(userId)}
          />
        )
      })}
    </Menu>
  )
})

export default NewBillingLeaderMenu
