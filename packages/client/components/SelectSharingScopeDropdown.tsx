import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {SelectSharingScopeDropdown_template$key} from '../__generated__/SelectSharingScopeDropdown_template.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerTemplateScopeMutation from '../mutations/UpdatePokerTemplateScopeMutation'
import UpdateReflectTemplateScopeMutation from '../mutations/UpdateReflectTemplateScopeMutation'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import DropdownMenuIconItemLabel from './DropdownMenuIconItemLabel'

interface Props {
  template: SelectSharingScopeDropdown_template$key
}

const SelectSharingScopeDropdown = (props: Props) => {
  const {template: templateRef} = props
  const template = useFragment(
    graphql`
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
    `,
    templateRef
  )
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
    <MenuContent align='start' className='min-w-80'>
      {scope === 'TEAM' ? null : (
        <MenuItem onClick={setScope('TEAM')}>
          <DropdownMenuIconItemLabel label={`Share only with ${teamName}`} icon={'group'} />
        </MenuItem>
      )}
      {scope === 'ORGANIZATION' ? null : (
        <MenuItem onClick={setScope('ORGANIZATION')}>
          <DropdownMenuIconItemLabel label={`Share with all of ${orgName}`} icon={'business'} />
        </MenuItem>
      )}
      {scope === 'PUBLIC' ? null : (
        <MenuItem onClick={setScope('PUBLIC')}>
          <DropdownMenuIconItemLabel label={`Share with the world`} icon={'public'} />
        </MenuItem>
      )}
    </MenuContent>
  )
}

export default SelectSharingScopeDropdown
