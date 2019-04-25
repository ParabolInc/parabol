import React from 'react'
import MenuItem from 'universal/components/MenuItem'
import Menu from 'universal/components/Menu'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import RemoveAtlassianAuthMutation from 'universal/mutations/RemoveAtlassianAuthMutation'
import {IntegrationServiceEnum} from 'universal/types/graphql'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props {
  closePortal: () => void
  mutationProps: MenuMutationProps
  teamId: string
}

const AtlassianConfigMenu = (props: Props) => {
  const {closePortal, mutationProps, teamId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = handleOpenOAuth({
    name: IntegrationServiceEnum.atlassian,
    atmosphere,
    teamId,
    ...mutationProps
  })

  const removeAtlassian = () => {
    if (submitting) return
    submitMutation()
    RemoveAtlassianAuthMutation(atmosphere, {teamId}, {onError, onCompleted})
  }
  return (
    <Menu ariaLabel={'Configure your Atlassian integration'} closePortal={closePortal}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove Atlassian' onClick={removeAtlassian} />
    </Menu>
  )
}

export default AtlassianConfigMenu
