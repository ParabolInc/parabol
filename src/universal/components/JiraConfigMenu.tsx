import React from 'react'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
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
    <MenuWithShortcuts ariaLabel={'Configure your Jira integration'} closePortal={closePortal}>
      <MenuItemWithShortcuts label='Refresh token' onClick={openOAuth} />
      <MenuItemWithShortcuts label='Remove Atlassian' onClick={removeAtlassian} />
    </MenuWithShortcuts>
  )
}

export default JiraConfigMenu
