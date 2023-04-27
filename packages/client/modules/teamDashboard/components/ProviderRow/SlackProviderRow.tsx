import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import SlackConfigMenu from '../../../../components/SlackConfigMenu'
import SlackProviderLogo from '../../../../components/SlackProviderLogo'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {Providers} from '../../../../types/constEnums'
import SlackClientManager from '../../../../utils/SlackClientManager'
import {SlackProviderRow_viewer$key} from '../../../../__generated__/SlackProviderRow_viewer.graphql'
import ProviderRow from './ProviderRow'
import SlackNotificationList from './SlackNotificationList'

interface Props {
  teamId: string
  viewer: SlackProviderRow_viewer$key
}

const SlackProviderRow = (props: Props) => {
  const {viewer: viewerRef, teamId} = props
  const viewer = useFragment(
    graphql`
      fragment SlackProviderRow_viewer on User {
        ...SlackProviderRowViewer @relay(mask: false)
      }
    `,
    viewerRef
  )
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {slack} = integrations
  const isActive = slack?.isActive
  const openOAuth = () => {
    SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  return (
    <>
      <ProviderRow
        connected={!!isActive}
        onConnectClick={openOAuth}
        submitting={submitting}
        togglePortal={togglePortal}
        menuRef={originRef}
        providerName={Providers.SLACK_NAME}
        providerDescription={Providers.SLACK_DESC}
        providerLogo={<SlackProviderLogo />}
      >
        {isActive && <SlackNotificationList teamId={teamId} viewer={viewer} />}
      </ProviderRow>
      {menuPortal(
        <SlackConfigMenu menuProps={menuProps} mutationProps={mutationProps} teamId={teamId} />
      )}
    </>
  )
}

graphql`
  fragment SlackProviderRowViewer on User {
    ...SlackNotificationList_viewer
    teamMember(teamId: $teamId) {
      integrations {
        slack {
          isActive
          slackTeamName
          slackUserName
        }
      }
    }
  }
`

export default SlackProviderRow
