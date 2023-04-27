import React, {forwardRef} from 'react'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import MenuItemAvatar from '../../../../components/MenuItemAvatar'
import {MenuProps} from '../../../../hooks/useMenu'
import {useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {NewBillingLeaderMenu_organization$key} from '~/__generated__/NewBillingLeaderMenu_organization.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import styled from '@emotion/styled'
import TypeAheadLabel from '../../../../components/TypeAheadLabel'

const AvatarBlock = styled('div')({
  paddingRight: 32
})

interface Props {
  menuProps: MenuProps
  organizationRef: NewBillingLeaderMenu_organization$key
  newLeaderSearchQuery: string
}

const NewBillingLeaderMenu = forwardRef((props: Props, ref: any) => {
  const {menuProps, organizationRef, newLeaderSearchQuery} = props
  const organization = useFragment(
    graphql`
      fragment NewBillingLeaderMenu_organization on Organization {
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
  console.log('🚀 ~ organization:', organization)
  const {organizationUsers} = organization
  return (
    <Menu ariaLabel='Select New Billing Leader' keepParentFocus {...menuProps}>
      {/* <SearchMenuItem placeholder='Search GitLab' onChange={onQueryChange} value={query} /> */}
      {/* {filteredProjects.length === 0 && ( */}
      {/* <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel> */}
      {/* )} */}
      {organizationUsers.edges.slice(0, 10).map((organizationUser) => {
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
