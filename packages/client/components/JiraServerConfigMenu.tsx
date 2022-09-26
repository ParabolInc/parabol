import React from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import RemoveTeamMemberIntegrationAuthMutation from '../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Duration} from '../types/constEnums'
import JiraServerClientManager from '../utils/JiraServerClientManager'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  providerId: string
  teamId: string
}

const JiraServerConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId, providerId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    JiraServerClientManager.openOAuth(atmosphere, providerId, teamId, mutationProps)
  }

  const removeJiraServer = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveTeamMemberIntegrationAuthMutation(
        atmosphere,
        {teamId, service: 'jiraServer'},
        {onCompleted, onError}
      )
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <Menu ariaLabel={'Configure your Jira Serverintegration'} {...menuProps}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove Jira Server' onClick={removeJiraServer} />
    </Menu>
  )
}

export default JiraServerConfigMenu
