import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import AddSlackChannel from 'universal/modules/teamDashboard/components/AddSlackChannel/AddSlackChannel'
import IntegrationRow from 'universal/modules/teamDashboard/components/IntegrationRow/IntegrationRow'
import IntegrationsNavigateBack from 'universal/modules/teamDashboard/components/IntegrationsNavigateBack/IntegrationsNavigateBack'
import RemoveSlackChannelMutation from 'universal/mutations/RemoveSlackChannelMutation'
import {SLACK} from 'universal/utils/constants'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'
import FlatButton from 'universal/components/FlatButton'
import SecondaryButton from 'universal/components/SecondaryButton'
import Panel from 'universal/components/Panel/Panel'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import styled from 'react-emotion'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import {WithAtmosphereProps} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {SlackIntegrations_viewer} from '__generated__/SlackIntegrations_viewer.graphql'
import SlackProviderLogo from 'universal/components/SlackProviderLogo'
import {Layout, Providers} from 'universal/types/constEnums'

const ProviderDetails = styled(Row)({
  border: 0,
  justifyContent: 'flex-start'
})

const AddSlackButton = styled(SecondaryButton)({
  margin: '0 auto',
  marginBottom: Layout.ROW_GUTTER
})

const ChannelName = styled('div')({
  fontSize: 14
})

interface Props extends WithMutationProps, WithAtmosphereProps {
  teamId: string
  viewer: SlackIntegrations_viewer
  teamMemberId: string
}

const SlackIntegrations = (props: Props) => {
  const {
    teamId,
    viewer,
    submitting,
    submitMutation,
    atmosphere,
    onError,
    onCompleted,
    teamMemberId
  } = props
  const {slackChannels, integrationProvider} = viewer
  const handleRemoveChannel = (slackGlobalId) => () => {
    RemoveSlackChannelMutation(atmosphere, slackGlobalId, teamId)
  }
  const accessToken = integrationProvider && integrationProvider.accessToken
  const openOAuth = handleOpenOAuth({
    name: SLACK,
    submitting,
    submitMutation,
    atmosphere,
    onError,
    onCompleted,
    teamId
  })
  return (
    <SettingsWrapper>
      <IntegrationsNavigateBack teamId={teamId} />
      {/* TODO: see if we can share this with ProviderIntegrationRow even though it has a Link component */}
      <Panel>
        <ProviderDetails>
          <SlackProviderLogo />
          <RowInfo>
            <RowInfoHeading>{Providers.SLACK_NAME}</RowInfoHeading>
            <RowInfoCopy>{Providers.SLACK_DESC}</RowInfoCopy>
          </RowInfo>
          {accessToken && (
            <RowActions>
              <FlatButton
                onClick={() =>
                  RemoveProviderMutation(
                    atmosphere,
                    {providerId: integrationProvider && integrationProvider.id, teamId},
                    {service: SLACK, onError, onCompleted}
                  )
                }
              >
                {'Remove Slack'}
              </FlatButton>
              <FlatButton onClick={openOAuth}>{'Refresh Token'}</FlatButton>
            </RowActions>
          )}
        </ProviderDetails>
        {accessToken ? (
          <Row>
            <AddSlackChannel
              accessToken={accessToken}
              teamMemberId={teamMemberId}
              subbedChannels={slackChannels}
            />
          </Row>
        ) : (
          <AddSlackButton size='medium' onClick={openOAuth} palette='warm'>
            {'Authorize Slack to Add a Channel'}
          </AddSlackButton>
        )}
        {slackChannels && (
          <RowInfo>
            {slackChannels.map((channel) => {
              const {id, channelId, channelName} = channel
              return (
                <IntegrationRow key={`${channelId}-row`}>
                  <ChannelName>{channelName}</ChannelName>
                  <FlatButton onClick={handleRemoveChannel(id)}>{'Remove'}</FlatButton>
                </IntegrationRow>
              )
            })}
          </RowInfo>
        )}
      </Panel>
    </SettingsWrapper>
  )
}

export default createFragmentContainer(
  SlackIntegrations,
  graphql`
    fragment SlackIntegrations_viewer on User {
      integrationProvider(teamId: $teamId, service: $service) {
        id
        accessToken
      }
      slackChannels(teamId: $teamId) {
        id
        channelId
        channelName
      }
    }
  `
)
