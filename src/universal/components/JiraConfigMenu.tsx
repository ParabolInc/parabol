import React from 'react'
import MenuItem from 'universal/components/MenuItem'
import Menu from 'universal/components/Menu'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import RemoveAtlassianAuthMutation from 'universal/mutations/RemoveAtlassianAuthMutation'
import {IntegrationServiceEnum} from 'universal/types/graphql'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'

interface Props {
  closePortal: () => void
  teamId: string
}

const noop = () => {
  /**/
}

const JiraConfigMenu = (props: Props) => {
  const {closePortal, teamId} = props
  const atmosphere = useAtmosphere()
  const openOAuth = handleOpenOAuth({
    name: IntegrationServiceEnum.atlassian,
    submitting: false,
    submitMutation: noop,
    atmosphere,
    onError: noop,
    onCompleted: noop,
    teamId
  })

  const removeAtlassian = () => {
    RemoveAtlassianAuthMutation(atmosphere, {teamId}, {onError: noop, onCompleted: noop})
  }
  return (
    <Menu ariaLabel={'Configure your Jira integration'} closePortal={closePortal}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove Atlassian' onClick={removeAtlassian} />
    </Menu>
  )
}

export default JiraConfigMenu
