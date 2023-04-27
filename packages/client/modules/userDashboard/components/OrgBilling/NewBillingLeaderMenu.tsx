import React, {forwardRef, useMemo} from 'react'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import {MenuProps} from '../../../../hooks/useMenu'
import {useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {
  NewBillingLeaderMenu_organization$data,
  NewBillingLeaderMenu_organization$key
} from '~/__generated__/NewBillingLeaderMenu_organization.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import styled from '@emotion/styled'
import TypeAheadLabel from '../../../../components/TypeAheadLabel'
import useFilteredItems from '../../../../hooks/useFilteredItems'
import {EmptyDropdownMenuItemLabel} from '../../../../components/EmptyDropdownMenuItemLabel'

const AvatarBlock = styled('div')({
  paddingRight: 32
})

interface Props {
  menuProps: MenuProps
  organizationRef: NewBillingLeaderMenu_organization$key
  newLeaderSearchQuery: string
}

const getValue = (
  orgUser: NewBillingLeaderMenu_organization$data['organizationUsers']['edges'][0]
) => orgUser.node.user.preferredName

const NewBillingLeaderMenu = forwardRef((props: Props, ref: any) => {
  const {menuProps, organizationRef, newLeaderSearchQuery} = props
  const organization = useFragment(
    graphql`
      fragment NewBillingLeaderMenu_organization on Organization {
        billingLeaders {
          id
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
  const {organizationUsers, billingLeaders} = organization
  const nonLeaderOrgUsers = useMemo(() => {
    return organizationUsers.edges.filter((organizationUser) => {
      const {node} = organizationUser
      const {user} = node
      const {id: userId} = user
      return !billingLeaders.some((billingLeader) => {
        const {id: billingLeaderId} = billingLeader
        return billingLeaderId === userId
      })
    })
  }, [billingLeaders, organizationUsers])

  const query = newLeaderSearchQuery.toLowerCase()
  const filteredOrgUsers = useFilteredItems(query, nonLeaderOrgUsers, (orgUser) =>
    getValue(orgUser).toLowerCase()
  )

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
        // const {id: projectId, fullPath} = project
        // const onClick = () => {
        // handleSelectFullPath(fullPath)
        // }

        return (
          <MenuItem
            ref={ref}
            key={userId}
            label={
              <MenuItemLabel>
                <AvatarBlock>
                  <Avatar picture={picture} size={32} />
                </AvatarBlock>
                <TypeAheadLabel query={newLeaderSearchQuery} label={preferredName} />
                {preferredName}
              </MenuItemLabel>
            }
            // onClick={onClick}
          />
        )
      })}
    </Menu>
  )
})

export default NewBillingLeaderMenu
