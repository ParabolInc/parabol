import {Add as AddIcon, Close as CloseIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {MattermostProviderRow_viewer$key} from '~/__generated__/MattermostProviderRow_viewer.graphql'
import MattermostProviderLogo from '../../../../components/MattermostProviderLogo'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {Providers} from '../../../../types/constEnums'
import MattermostConfigMenu from './MattermostConfigMenu'
import MattermostPanel from './MattermostPanel'
import ProviderRow from './ProviderRow'

interface Props {
  teamId: string
  viewerRef: MattermostProviderRow_viewer$key
}

graphql`
  fragment MattermostProviderRowTeamMemberIntegrations on TeamMemberIntegrations {
    mattermost {
      auth {
        provider {
          id
        }
      }
      teamNotificationSettings {
        ...NotificationSettings_settings
      }
    }
  }
`
const MattermostProviderRow = (props: Props) => {
  const {viewerRef, teamId} = props
  const viewer = useFragment(
    graphql`
      fragment MattermostProviderRow_viewer on User {
        ...MattermostPanel_viewer
        teamMember(teamId: $teamId) {
          integrations {
            ...MattermostProviderRowTeamMemberIntegrations @relay(mask: false)
          }
        }
      }
    `,
    viewerRef
  )
  const [isConnectClicked, setConnectClicked] = useState(false)
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const {submitting, submitMutation, error, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {mattermost} = integrations
  const {auth} = mattermost

  if (window.__ACTION__.mattermostGlobal || window.__ACTION__.mattermostDisabled) return null

  return (
    <>
      <ProviderRow
        connected={!!auth}
        onConnectClick={() => setConnectClicked(!isConnectClicked)}
        submitting={submitting}
        togglePortal={togglePortal}
        menuRef={originRef}
        providerName={Providers.MATTERMOST_NAME}
        providerDescription={Providers.MATTERMOST_DESC}
        providerLogo={<MattermostProviderLogo />}
        connectButtonText={!isConnectClicked ? 'Connect' : 'Cancel'}
        connectButtonIcon={!isConnectClicked ? <AddIcon /> : <CloseIcon />}
        error={error?.message}
      >
        {(auth || isConnectClicked) && <MattermostPanel teamId={teamId} viewerRef={viewer} />}
      </ProviderRow>
      {auth &&
        menuPortal(
          <MattermostConfigMenu
            menuProps={menuProps}
            mutationProps={mutationProps}
            providerId={auth.provider.id}
          />
        )}
    </>
  )
}

export default MattermostProviderRow
