import React from 'react'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import RemoveProviderMutation from 'universal/mutations/RemoveProviderMutation'
import {IntegrationServiceEnum} from 'universal/types/graphql'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'
import {GITHUB} from 'universal/utils/constants'

interface Props {
  closePortal: () => void
  mutationProps: MenuMutationProps
  teamId: string
  providerId: string
}

const GitHubConfigMenu = (props: Props) => {
  const {closePortal, mutationProps, providerId, teamId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = handleOpenOAuth({
    name: IntegrationServiceEnum.GitHubIntegration,
    atmosphere,
    teamId,
    ...mutationProps
  })

  const removeGitHub = () => {
    if (submitting) return
    submitMutation()
    RemoveProviderMutation(
      atmosphere,
      {
        providerId,
        teamId
      },
      {service: GITHUB, onError, onCompleted}
    )
  }
  return (
    <MenuWithShortcuts ariaLabel={'Configure your GitHub integration'} closePortal={closePortal}>
      <MenuItemWithShortcuts label='Refresh token' onClick={openOAuth} />
      <MenuItemWithShortcuts label='Remove GitHub' onClick={removeGitHub} />
    </MenuWithShortcuts>
  )
}

export default GitHubConfigMenu
