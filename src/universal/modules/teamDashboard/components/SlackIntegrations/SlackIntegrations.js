import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {commitMutation, createFragmentContainer} from 'react-relay';
import {Link} from 'react-router-dom';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import appTheme from 'universal/styles/theme/appTheme';
import goBackLabel from 'universal/styles/helpers/goBackLabel';
import Panel from 'universal/components/Panel/Panel';
import IntegrationRow from 'universal/modules/teamDashboard/components/IntegrationRow/IntegrationRow';
import Button from 'universal/components/Button/Button';
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput';
import AddSlackChannel from 'universal/modules/teamDashboard/components/AddSlackChannel/AddSlackChannel';
import relayEnv from 'client/relayEnv';

const inlineBlockStyle = {
  display: 'inline-block',
  lineHeight: ui.dashSectionHeaderLineHeight,
  marginRight: '.5rem',
  verticalAlign: 'middle'
};

const removeSlackChannel = graphql`
  mutation SlackIntegrationsMutation($slackChannelId: ID!) {
    removeSlackChannel(slackChannelId: $slackChannelId)
  }
`;

const SlackIntegrations = (props) => {
  const {styles, teamId, teamMemberId, viewer} = props;
  const {slackChannels, integrationProvider} = viewer;
  const handleRemove = (channelId, channelName) => () => {
    commitMutation(
      relayEnv.get(),
      {
        mutation: removeSlackChannel,
        variables: {slackChannelId: channelId},
        optimisticResponse: {
          addSlackChannel: {
            channelId,
            channelName
          }
        },
        onError: (err) => {
          console.log('err', err)
        }
      }
    )
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
                teamMemberId={teamMemberId}
                viewerId={viewer.id}
                subbedChannels={slackChannels.edges}
              />
            }
          </div>
          {slackChannels &&
            <div className={css(styles.integrationsList)}>
              {slackChannels.edges.map((channel) => {
                const {channelId, channelName} = channel.node;
                return (
                  <IntegrationRow key={`${channelId}-row`}>
                    <div className={css(styles.channelName)}>{channelName}</div>
                    <Button
                      buttonStyle="flat"
                      colorPalette="dark"
                      label="Remove"
                      onClick={handleRemove(channelId, channelName)}
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
    fontWeight: 700,
  }
});

//export default withStyles(styleThunk)(SlackIntegrations);
export default createFragmentContainer(
  withStyles(styleThunk)(SlackIntegrations),
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
