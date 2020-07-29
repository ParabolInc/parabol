import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import useMutationProps from '../hooks/useMutationProps'
import UpdateTemplateScopeMutation from '../mutations/UpdateTemplateScopeMutation'
import {SelectSharingScopeDropdown_template} from '../__generated__/SelectSharingScopeDropdown_template.graphql'
import DropdownMenuItemLabel from './DropdownMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  template: SelectSharingScopeDropdown_template
}

const SelectSharingScopeDropdown = (props: Props) => {
  const {menuProps, template} = props
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const {id: templateId, scope, team} = template
  const {name: teamName, organization} = team
  const {name: orgName} = organization
  const setScope = (newScope: any) => () => {
    if (submitting) return
    submitMutation()
    UpdateTemplateScopeMutation(atmosphere, {scope: newScope, templateId}, {onError, onCompleted})
  }
  return (
    <Menu ariaLabel={'Select the suitable scope for sharing'} {...menuProps}>
      {scope === 'TEAM' ? null : <MenuItem
        label={<DropdownMenuItemLabel>{`Only visible to ${teamName}`}</DropdownMenuItemLabel>}
        onClick={setScope('TEAM')}
      />}
      {scope === 'ORGANIZATION' ? null : <MenuItem
        label={<DropdownMenuItemLabel>{`Share with all of ${orgName}`}</DropdownMenuItemLabel>}
        onClick={setScope('ORGANIZATION')}
      />}
      {scope === 'PUBLIC' ? null : <MenuItem
        label={<DropdownMenuItemLabel>{`Share with the world`}</DropdownMenuItemLabel>}
        onClick={setScope('PUBLIC')}
      />}
    </Menu>
  )
}

export default createFragmentContainer(SelectSharingScopeDropdown, {
  template: graphql`
    fragment SelectSharingScopeDropdown_template on ReflectTemplate {
      id
      scope
      team {
        name
        organization {
          name
        }
      }
    }
  `
})
