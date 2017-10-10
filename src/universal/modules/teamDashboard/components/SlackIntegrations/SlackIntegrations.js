import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import AddSlackChannel from 'universal/modules/teamDashboard/components/AddSlackChannel/AddSlackChannel';
import IntegrationRow from 'universal/modules/teamDashboard/components/IntegrationRow/IntegrationRow';
import IntegrationsNavigateBack from 'universal/modules/teamDashboard/components/IntegrationsNavigateBack/IntegrationsNavigateBack';
import {providerLookup} from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow';
import RemoveProviderMutation from 'universal/mutations/RemoveProviderMutation';
import RemoveSlackChannelMutation from 'universal/mutations/RemoveSlackChannelMutation';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {SLACK} from 'universal/utils/constants';

const {makeUri} = providerLookup[SLACK];

const SlackIntegrations = (props) => {
  const {relay: {environment}, jwt, styles, teamId, teamMemberId, viewer} = props;
  const {slackChannels, integrationProvider} = viewer;
  const handleRemoveChannel = (slackGlobalId) => () => {
    RemoveSlackChannelMutation(environment, slackGlobalId, teamId);
  };
  const accessToken = integrationProvider && integrationProvider.accessToken;
  const openOauth = () => {
    const uri = makeUri(jwt, teamId);
    window.open(uri);
  };
  return (
    <div className={css(styles.slackIntegrations)}>
      <IntegrationsNavigateBack teamId={teamId} />
      {/* TODO: see if we can share this with ProviderIntegrationRow even though it has a Link component */}
      <div className={css(styles.providerDetails)}>
        <div className={css(styles.providerAvatar)}>
          <FontAwesome name="slack" className={css(styles.providerIcon)} />
        </div>
        <div className={css(styles.providerInfo)}>
          <div className={css(styles.nameAndTags)}>
            <div className={css(styles.providerName)}>
              {ui.providers.slack.providerName}
            </div>
            <div className={css(styles.subHeading)}>
              {ui.providers.slack.description}
            </div>
          </div>
        </div>
        {accessToken &&
        <div className={css(styles.providerActions)}>
          <Button
            buttonSize="small"
            buttonStyle="flat"
            colorPalette="warm"
            label="Remove Slack"
            onClick={() => RemoveProviderMutation(environment, integrationProvider.id, SLACK, teamId)}
          />
          <Button
            buttonSize="small"
            buttonStyle="flat"
            colorPalette="cool"
            label="Refresh Token"
            onClick={openOauth}
          />
        </div>
        }
      </div>
      <Panel label="Channels">
        <div className={css(styles.integrations)}>
          {accessToken ?
            <div className={css(styles.addChannel)}>
              <AddSlackChannel
                accessToken={accessToken}
                environment={environment}
                teamMemberId={teamMemberId}
                subbedChannels={slackChannels}
              />
            </div> :
            <div className={css(styles.addSlack)}>
              <Button
                buttonSize="medium"
                buttonStyle="solid"
                colorPalette="cool"
                label="Authorize Slack to Add a Channel"
                onClick={openOauth}
              />
            </div>
          }
          {slackChannels &&
          <div className={css(styles.integrationsList)}>
            {slackChannels.map((channel) => {
              const {id, channelId, channelName} = channel;
              return (
                <IntegrationRow key={`${channelId}-row`}>
                  <div className={css(styles.channelName)}>{channelName}</div>
                  <Button
                    buttonStyle="flat"
                    colorPalette="dark"
                    label="Remove"
                    onClick={handleRemoveChannel(id)}
                    buttonSize="small"
                  />
                </IntegrationRow>
              );
            })}
          </div>
          }
        </div>
      </Panel>
    </div>
  );
};

SlackIntegrations.propTypes = {
  jwt: PropTypes.string.isRequired,
  relay: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamId: PropTypes.string.isRequired,
  teamMemberId: PropTypes.string.isRequired
};

const styleThunk = () => ({
  slackIntegrations: {
    maxWidth: ui.settingsPanelMaxWidth,
    width: '100%'
  },

  providerDetails: {
    alignItems: 'center',
    display: 'flex'
  },

  providerAvatar: {
    backgroundColor: ui.providers.slack.color,
    borderRadius: ui.providerIconBorderRadius
  },

  providerName: {
    ...ui.providerName
  },

  providerIcon: {
    alignItems: 'center',
    color: '#fff',
    display: 'flex !important',
    fontSize: `${ui.iconSize2x} !important`,
    height: ui.providerIconSize,
    justifyContent: 'center',
    width: ui.providerIconSize
  },

  providerInfo: {
    paddingLeft: ui.rowGutter
  },

  providerActions: {
    flex: 1,
    marginLeft: 'auto',
    paddingLeft: ui.rowGutter,
    textAlign: 'right'
  },

  subHeading: {
    ...ui.rowSubheading
  },

  addSlack: {
    paddingBottom: ui.rowGutter,
    textAlign: 'center'
  },

  addChannel: {
    borderTop: `1px solid ${ui.rowBorderColor}`,
    display: 'flex',
    padding: ui.rowGutter
  },

  integrationsList: {
    paddingLeft: ui.rowGutter
  },

  channelName: {
    color: ui.palette.cool,
    fontSize: appTheme.typography.s3,
    fontWeight: 700
  }
});


export default createFragmentContainer(
  withStyles(styleThunk)(SlackIntegrations),
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
);
