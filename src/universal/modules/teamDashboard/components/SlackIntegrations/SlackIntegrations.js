import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import AddSlackChannel from 'universal/modules/teamDashboard/components/AddSlackChannel/AddSlackChannel'
import IntegrationRow from 'universal/modules/teamDashboard/components/IntegrationRow/IntegrationRow'
import IntegrationsNavigateBack from 'universal/modules/teamDashboard/components/IntegrationsNavigateBack/IntegrationsNavigateBack'
import {providerLookup} from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow'
import RemoveProviderMutation from 'universal/mutations/RemoveProviderMutation'
import RemoveSlackChannelMutation from 'universal/mutations/RemoveSlackChannelMutation'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {SLACK} from 'universal/utils/constants'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'
import FlatButton from 'universal/components/FlatButton'
import RaisedButton from 'universal/components/RaisedButton'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import Panel from 'universal/components/Panel/Panel'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import styled from 'react-emotion'

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

const ProviderIcon = styled(StyledFontAwesome)({
  alignItems: 'center',
  color: ui.palette.white,
  display: 'flex !important',
  fontSize: `${ui.iconSize2x} !important`,
  height: ui.providerIconSize,
  justifyContent: 'center',
  width: ui.providerIconSize
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

const {makeUri} = providerLookup[SLACK]

const SlackIntegrations = (props) => {
  const {
    relay: {environment},
    jwt,
    teamId,
    teamMemberId,
    viewer
  } = props
  const {slackChannels, integrationProvider} = viewer
  const handleRemoveChannel = (slackGlobalId) => () => {
    RemoveSlackChannelMutation(environment, slackGlobalId, teamId)
  }
  const accessToken = integrationProvider && integrationProvider.accessToken
  const openOauth = () => {
    const uri = makeUri(jwt, teamId)
    window.open(uri)
  }
  return (
    <SettingsWrapper>
      <IntegrationsNavigateBack teamId={teamId} />
      {/* TODO: see if we can share this with ProviderIntegrationRow even though it has a Link component */}
      <ProviderDetails>
        <ProviderAvatar>
          <ProviderIcon name='slack' />
        </ProviderAvatar>
        <RowInfo>
          <ProviderName>{ui.providers.slack.providerName}</ProviderName>
          <SubHeading>{ui.providers.slack.description}</SubHeading>
        </RowInfo>
        {accessToken && (
          <RowActions>
            <FlatButton
              onClick={() =>
                RemoveProviderMutation(environment, integrationProvider.id, SLACK, teamId)
              }
              palette='mid'
            >
              {'Remove Slack'}
            </FlatButton>
            <FlatButton onClick={openOauth} palette='mid'>
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
              environment={environment}
              teamMemberId={teamMemberId}
              subbedChannels={slackChannels}
            />
          </Row>
        ) : (
          <AddSlackButton buttonSize='medium' onClick={openOauth} palette='warm'>
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

SlackIntegrations.propTypes = {
  jwt: PropTypes.string.isRequired,
  relay: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired,
  teamMemberId: PropTypes.string.isRequired
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
