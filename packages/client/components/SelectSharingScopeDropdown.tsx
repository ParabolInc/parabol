import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useLocation, useNavigate} from 'react-router'
import type {SelectSharingScopeDropdown_template$key} from '../__generated__/SelectSharingScopeDropdown_template.graphql'
import type {UpdateTemplateScopeMutation$data} from '../__generated__/UpdateTemplateScopeMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps, {getOnCompletedError} from '../hooks/useMutationProps'
import UpdatePokerTemplateScopeMutation from '../mutations/UpdatePokerTemplateScopeMutation'
import UpdateTemplateScopeMutation from '../mutations/UpdateTemplateScopeMutation'
import type {CompletedHandler} from '../types/relayMutations'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import DropdownMenuIconItemLabel from './DropdownMenuIconItemLabel'

interface Props {
  template: SelectSharingScopeDropdown_template$key
  isEditing: boolean
}

const SelectSharingScopeDropdown = (props: Props) => {
  const {template: templateRef, isEditing} = props
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
  const navigate = useNavigate()
  const location = useLocation() as {state?: object}
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const {id: templateId, scope, team, type} = template
  const {name: teamName, organization} = team
  const {name: orgName} = organization
  const onUpdateTemplateScopeCompleted: CompletedHandler<UpdateTemplateScopeMutation$data> = (
    res,
    errors
  ) => {
    onCompleted(res, errors)
    const error = getOnCompletedError(res, errors)
    if (error) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'updateTemplateScopeError',
        message: error.message,
        autoDismiss: 5
      })
      return
    }
    const clonedTemplateId =
      res.updateTemplateScope.UpdateTemplateScopeMutation_organization?.clonedTemplate?.id
    if (clonedTemplateId) {
      navigate(`/activity-library/details/${clonedTemplateId}`, {
        replace: true,
        state: {...location.state, edit: isEditing}
      })
    }
  }
  const setScope = (newScope: any) => () => {
    if (submitting) return
    submitMutation()
    if (type === 'retrospective' || type === 'teamPrompt') {
      UpdateTemplateScopeMutation(
        atmosphere,
        {scope: newScope, templateId},
        {onError, onCompleted: onUpdateTemplateScopeCompleted}
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
