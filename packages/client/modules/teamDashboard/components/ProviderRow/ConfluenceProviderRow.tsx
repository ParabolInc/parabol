import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ConfluenceProviderRow_viewer$key} from '../../../../__generated__/ConfluenceProviderRow_viewer.graphql'
import AtlassianProviderLogo from '../../../../AtlassianProviderLogo'
import AtlassianConfigMenu from '../../../../components/AtlassianConfigMenu'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps, {type MenuMutationProps} from '../../../../hooks/useMutationProps'
import {Providers} from '../../../../types/constEnums'
import AtlassianClientManager from '../../../../utils/AtlassianClientManager'
import {hasConfluenceScopes} from '../../../../utils/atlassianScopes'
import ProviderRow from './ProviderRow'

interface Props {
  teamId: string
  viewerRef: ConfluenceProviderRow_viewer$key
}

const ConfluenceProviderRow = (props: Props) => {
  const {teamId, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment ConfluenceProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          team {
            organization {
              hasConfluenceExport: featureFlag(featureName: "ConfluenceExport")
            }
          }
          integrations {
            atlassian {
              accessToken
              scope
            }
          }
        }
      }
    `,
    viewerRef
  )
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, error, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const {teamMember} = viewer
  const atlassian = teamMember?.integrations.atlassian
  const accessToken = atlassian?.accessToken ?? undefined
  const connected = !!accessToken && hasConfluenceScopes(atlassian?.scope)
  const flagOn = teamMember?.team?.organization?.hasConfluenceExport ?? false

  const connectConfluence = () => {
    AtlassianClientManager.openOAuth(
      atmosphere,
      teamId,
      mutationProps,
      [...AtlassianClientManager.CONFLUENCE_SCOPE, 'offline_access' as const],
      atlassian?.scope
    )
  }

  if (!flagOn) return null
  if (!AtlassianClientManager.isAvailable) return null

  return (
    <>
      <ProviderRow
        connected={connected}
        onConnectClick={connectConfluence}
        submitting={submitting}
        togglePortal={togglePortal}
        menuRef={originRef}
        providerName={Providers.CONFLUENCE_NAME}
        providerDescription={
          <>
            {Providers.CONFLUENCE_DESC}
            <div className='text-fg-muted text-xs'>{'Shares your Atlassian sign-in'}</div>
          </>
        }
        providerLogo={<AtlassianProviderLogo />}
        error={error?.message}
      />
      {menuPortal(
        <AtlassianConfigMenu
          mutationProps={mutationProps}
          menuProps={menuProps}
          teamId={teamId}
          heldScopes={atlassian?.scope}
        />
      )}
    </>
  )
}

export default ConfluenceProviderRow
