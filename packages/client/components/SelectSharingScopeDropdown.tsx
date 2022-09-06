import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerTemplateScopeMutation from '../mutations/UpdatePokerTemplateScopeMutation'
import UpdateReflectTemplateScopeMutation from '../mutations/UpdateReflectTemplateScopeMutation'
import {SelectSharingScopeDropdown_template} from '../__generated__/SelectSharingScopeDropdown_template.graphql'
import DropdownMenuIconItemLabel from './DropdownMenuIconItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  template: SelectSharingScopeDropdown_template
}

const SelectSharingScopeDropdown = (props: Props) => {
  const {menuProps, template} = props

  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const {id: templateId, scope, team, type} = template
  const {name: teamName, organization} = team
  const {name: orgName} = organization
  const setScope = (newScope: any) => () => {
    if (submitting) return
    submitMutation()
    if (type === 'retrospective') {
      UpdateReflectTemplateScopeMutation(
        atmosphere,
        {scope: newScope, templateId},
        {onError, onCompleted}
      )
    } else if (type === 'poker') {
      UpdatePokerTemplateScopeMutation(
        atmosphere,
        {scope: newScope, templateId},
        {onError, onCompleted}
      )
    }
  }
  return (
    <Menu
      ariaLabel={t('SelectSharingScopeDropdown.SelectTheSuitableScopeForSharing')}
      {...menuProps}
    >
      {scope === 'TEAM' ? null : (
        <MenuItem
          label={
            <DropdownMenuIconItemLabel
              label={`Share only with ${teamName}`}
              icon={t('SelectSharingScopeDropdown.Group')}
            />
          }
          onClick={setScope('TEAM')}
        />
      )}
      {scope === 'ORGANIZATION' ? null : (
        <MenuItem
          label={
            <DropdownMenuIconItemLabel
              label={`Share with all of ${orgName}`}
              icon={t('SelectSharingScopeDropdown.Business')}
            />
          }
          onClick={setScope('ORGANIZATION')}
        />
      )}
      {scope === 'PUBLIC' ? null : (
        <MenuItem
          label={
            <DropdownMenuIconItemLabel
              label={`Share with the world`}
              icon={t('SelectSharingScopeDropdown.Public')}
            />
          }
          onClick={setScope('PUBLIC')}
        />
      )}
    </Menu>
  )
}

export default createFragmentContainer(SelectSharingScopeDropdown, {
  template: graphql`
    fragment SelectSharingScopeDropdown_template on MeetingTemplate {
      id
      scope
      type
      team {
        name
        organization {
          name
        }
      }
    }
  `
})
