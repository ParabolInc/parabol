import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import {Link} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import AddSlackChannel from 'universal/modules/teamDashboard/components/AddSlackChannel/AddSlackChannel';
import IntegrationRow from 'universal/modules/teamDashboard/components/IntegrationRow/IntegrationRow';
import RemoveSlackChannelMutation from 'universal/mutations/RemoveSlackChannelMutation';
import goBackLabel from 'universal/styles/helpers/goBackLabel';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import withSubscriptions from 'universal/decorators/withSubscriptions.js/withSubscriptions';
import SlackChannelSubscription from 'universal/subscriptions/SlackChannel';

const inlineBlockStyle = {
  display: 'inline-block',
  lineHeight: ui.dashSectionHeaderLineHeight,
  marginRight: '.5rem',
  verticalAlign: 'middle'
};


const SlackIntegrations = (props) => {
  const {relay: {environment}, styles, teamId, teamMemberId, viewer} = props;
  const {id: viewerId, slackChannels, integrationProvider} = viewer;
  const handleRemove = (slackGlobalId) => () => {
    RemoveSlackChannelMutation(environment, slackGlobalId, teamId, viewerId);
  }
  const accessToken = integrationProvider && integrationProvider.accessToken;
  return (
    <div className={css(styles.slackIntegrations)}>
      <Link className={css(styles.link)} to={`/team/${teamId}/settings/integrations`} title="Back to Integrations">
        <FontAwesome name="arrow-circle-left" style={inlineBlockStyle}/>
        <div style={inlineBlockStyle}>Back to <b>Integrations</b></div>
      </Link>
      {/* TODO: see if we can share this with ProviderIntegrationRow even though it has a Link component */}
      <div className={css(styles.providerDetails)}>
        <div className={css(styles.providerAvatar)}>
          <FontAwesome name="slack" className={css(styles.providerIcon)}/>
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
      </div>
      <Panel label="Channels">
        <div className={css(styles.integrations)}>
          <div className={css(styles.addChannel)}>
            {accessToken &&
            <AddSlackChannel
              accessToken={accessToken}
              environment={environment}
              teamMemberId={teamMemberId}
              viewerId={viewer.id}
              subbedChannels={slackChannels.edges}
            />
            }
          </div>
          {slackChannels &&
          <div className={css(styles.integrationsList)}>
            {slackChannels.edges.map((channel) => {
              const {id, channelId, channelName} = channel.node;
              return (
                <IntegrationRow key={`${channelId}-row`}>
                  <div className={css(styles.channelName)}>{channelName}</div>
                  <Button
                    buttonStyle="flat"
                    colorPalette="dark"
                    label="Remove"
                    onClick={handleRemove(id)}
                    size="smallest"
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
  relay: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  slackIntegrations: {
    maxWidth: ui.settingsPanelMaxWidth,
    width: '100%'
  },

  link: {
    ...goBackLabel,
    display: 'block',
    margin: '1rem 0'
  },

  providerDetails: {
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
    paddingLeft: '1rem'
  },

  subHeading: {
    ...ui.rowSubheading
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
    fontWeight: 700
  }
});

const subscriptionThunk = ({teamId, viewer: {id}}) => SlackChannelSubscription(teamId, id);

export default createFragmentContainer(
  withSubscriptions(subscriptionThunk)(withStyles(styleThunk)(SlackIntegrations)),
  graphql`
    fragment SlackIntegrations_viewer on User {
      id
      integrationProvider(teamMemberId: $teamMemberId, service: $service) {
        accessToken
      }
      slackChannels(first: 100, teamId: $teamId) @connection(key: "SlackIntegrations_slackChannels", filters: ["teamId"]) {
        edges {
          node {
            id
            channelId
            channelName
          }
        }
      }
    }
  `
);
