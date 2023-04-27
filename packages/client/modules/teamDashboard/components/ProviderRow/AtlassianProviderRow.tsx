import graphql from 'babel-plugin-relay/macro'
import jwtDecode from 'jwt-decode'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import AtlassianProviderLogo from '../../../../AtlassianProviderLogo'
import AtlassianConfigMenu from '../../../../components/AtlassianConfigMenu'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {AuthToken} from '../../../../types/AuthToken'
import {Providers} from '../../../../types/constEnums'
import AtlassianClientManager from '../../../../utils/AtlassianClientManager'
import {AtlassianProviderRow_viewer$key} from '../../../../__generated__/AtlassianProviderRow_viewer.graphql'
import ProviderRow from './ProviderRow'

interface Props {
  teamId: string
  retry: () => void
  viewer: AtlassianProviderRow_viewer$key
}

const useFreshToken = (accessToken: string | undefined, retry: () => void) => {
  useEffect(() => {
    if (!accessToken) return
    const decodedToken = jwtDecode(accessToken) as AuthToken | null
    const delay = (decodedToken && decodedToken.exp * 1000 - Date.now()) || -1
    if (delay <= 0) return
    const cancel = window.setTimeout(() => {
      retry()
    }, delay)
    return () => {
      window.clearTimeout(cancel)
    }
  }, [accessToken, retry])
}

const AtlassianProviderRow = (props: Props) => {
  const {retry, viewer: viewerRef, teamId} = props
  const viewer = useFragment(
    graphql`
      fragment AtlassianProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          integrations {
            atlassian {
              ...AtlassianProviderRowAtlassianIntegration @relay(mask: false)
            }
          }
        }
      }
    `,
    viewerRef
  )
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {atlassian} = integrations
  const accessToken = atlassian?.accessToken ?? undefined
  useFreshToken(accessToken, retry)

  const openOAuth = () => {
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }

  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  return (
    <>
      <ProviderRow
        connected={!!accessToken}
        onConnectClick={openOAuth}
        submitting={submitting}
        togglePortal={togglePortal}
        menuRef={originRef}
        providerName={Providers.ATLASSIAN_NAME}
        providerDescription={Providers.ATLASSIAN_DESC}
        providerLogo={<AtlassianProviderLogo />}
      />
      {menuPortal(
        <AtlassianConfigMenu mutationProps={mutationProps} menuProps={menuProps} teamId={teamId} />
      )}
    </>
  )
}

graphql`
  fragment AtlassianProviderRowAtlassianIntegration on AtlassianIntegration {
    accessToken
  }
`

export default AtlassianProviderRow
