import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {commitMutation, createFragmentContainer} from 'react-relay';
import {Link} from 'react-router-dom';
import Row from 'universal/components/Row/Row';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import appTheme from 'universal/styles/theme/appTheme'; import Panel from 'universal/components/Panel/Panel'; import Button from 'universal/components/Button/Button'; import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput'; import AddSlackChannel from 'universal/modules/teamDashboard/components/AddSlackChannel/AddSlackChannel';
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
  const handleRemove = (channelId) => () => {
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
        <div style={inlineBlockStyle}>Back to Integrations</div>
      </Link>
      {/* TODO: see if we can share this with ProviderRow even though it has a Link component */}
      <Row>
        <div className={css(styles.providerAvatar)} style={{backgroundColor: 'blue'}}>
          <FontAwesome name="slack" className={css(styles.providerIcon)}/>
          {/*<img className={css(styles.avatarImg)} height={50} width={50} src={image}/>*/}
        </div>
        <div className={css(styles.userInfo)}>
          <div className={css(styles.nameAndTags)}>
            <div className={css(styles.preferredName)}>
              Slack
            </div>
            <div className={css(styles.subHeader)}>
              Notify channels when meetings begin and end for this team
            </div>
          </div>
        </div>
      </Row>
      <Panel label="Channels">
        <div className={css(styles.addChannel)}>
          {accessToken &&
            <AddSlackChannel accessToken={accessToken} teamMemberId={teamMemberId} viewerId={viewer.id} />
          }
          {slackChannels.edges.map((channel) => {
            return (
              <div>
                {channel.node.channelName}
                <span onlick={handleRemove(channel.node.channelId)}>Remove</span>
              </div>
            );
          })}
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
  list: {
    border: '3px solid gray',
    borderRadius: '4px'
  },
  providerAvatar: {
    //height: 50,
    //width: 50,
    borderRadius: '8px'
    // Define
  },
  providerIcon: {
    alignItems: 'center',
    color: '#fff',
    display: 'flex !important',
    fontSize: `${ui.iconSize2x} !important`,
    height: 50,
    justifyContent: 'center',
    width: 50
  },

  userInfo: {
    paddingLeft: '1rem'
  },
  subHeader: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4
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