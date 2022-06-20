import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import GitHubConfigMenu from '../../../../components/GitHubConfigMenu'
import GitHubProviderLogo from '../../../../components/GitHubProviderLogo'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {Providers} from '../../../../types/constEnums'
import GitHubClientManager from '../../../../utils/GitHubClientManager'
import {GitHubProviderRow_viewer} from '../../../../__generated__/GitHubProviderRow_viewer.graphql'
import ProviderRow from './ProviderRow'

interface Props {
  teamId: string
  viewer: GitHubProviderRow_viewer
}

const GitHubProviderRow = (props: Props) => {
  const {viewer, teamId} = props
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {github} = integrations
  const accessToken = github?.accessToken ?? undefined
  const openOAuth = () => {
    GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  return (
    <>
      <ProviderRow
        connected={!!accessToken}
        onConnectClick={openOAuth}
        submitting={submitting}
        togglePortal={togglePortal}
        originRef={originRef}
        providerName={Providers.GITHUB_NAME}
        providerDescription={Providers.GITHUB_DESC}
        providerLogo={<GitHubProviderLogo />}
      />
      {menuPortal(
        <GitHubConfigMenu menuProps={menuProps} mutationProps={mutationProps} teamId={teamId} />
      )}
    </>
  )
}

graphql`
  fragment GitHubProviderRowGitHubIntegration on GitHubIntegration {
    accessToken
    login
  }
`

export default createFragmentContainer(GitHubProviderRow, {
  viewer: graphql`
    fragment GitHubProviderRow_viewer on User {
      teamMember(teamId: $teamId) {
        integrations {
          github {
            ...GitHubProviderRowGitHubIntegration @relay(mask: false)
          }
        }
      }
    }
  `
})
