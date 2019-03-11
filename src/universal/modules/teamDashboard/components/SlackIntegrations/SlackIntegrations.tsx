import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import AddSlackChannel from 'universal/modules/teamDashboard/components/AddSlackChannel/AddSlackChannel'
import IntegrationRow from 'universal/modules/teamDashboard/components/IntegrationRow/IntegrationRow'
import IntegrationsNavigateBack from 'universal/modules/teamDashboard/components/IntegrationsNavigateBack/IntegrationsNavigateBack'
import RemoveProviderMutation from 'universal/mutations/RemoveProviderMutation'
import RemoveSlackChannelMutation from 'universal/mutations/RemoveSlackChannelMutation'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {SLACK} from 'universal/utils/constants'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'
import FlatButton from 'universal/components/FlatButton'
import RaisedButton from 'universal/components/RaisedButton'
import Panel from 'universal/components/Panel/Panel'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import styled from 'react-emotion'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import {WithAtmosphereProps} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {SlackIntegrations_viewer} from '__generated__/SlackIntegrations_viewer.graphql'
import SlackProviderLogo from '../../../../SlackProviderLogo'

const ProviderDetails = styled(Row)({
  border: 0,
  justifyContent: 'flex-start',
  paddingRight: 0
})

const ProviderAvatar = styled('div')({
  backgroundColor: ui.providers.slack.color,
  borderRadius: ui.providerIconBorderRadius
})

const ProviderName = styled('div')({
  ...ui.providerName
})

const SubHeading = styled('div')({
  ...ui.rowSubheading
})

const AddSlackButton = styled(RaisedButton)({
  margin: '0 auto',
  marginBottom: ui.rowGutter
})

const ChannelName = styled('div')({
  fontSize: appTheme.typography.s3,
  fontWeight: 600
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
      <ProviderDetails>
        <ProviderAvatar>
          <SlackProviderLogo />
        </ProviderAvatar>
        <RowInfo>
          <ProviderName>{ui.providers.slack.providerName}</ProviderName>
          <SubHeading>{ui.providers.slack.description}</SubHeading>
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
              palette='mid'
            >
              {'Remove Slack'}
            </FlatButton>
            <FlatButton onClick={openOAuth} palette='mid'>
              {'Refresh Token'}
            </FlatButton>
          </RowActions>
        )}
      </ProviderDetails>
      <Panel label='Channels'>
        {accessToken ? (
          <Row>
            <AddSlackChannel
              accessToken={accessToken}
              environment={atmosphere}
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
