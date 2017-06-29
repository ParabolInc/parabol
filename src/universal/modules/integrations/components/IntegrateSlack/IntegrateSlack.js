import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import slackLogo from 'universal/styles/theme/images/graphics/Slack_Mark.svg';
import {cashay} from 'cashay';
import makeHref from 'universal/utils/makeHref';
import ServiceRow from '../ServiceRow/ServiceRow';
import ms from 'ms';

class IntegrateSlack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      channelList: []
    };
    this.lastUpdated = 0;
    this.getChannelList(props.service);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.service && nextProps.service) {
      this.getChannelList(nextProps.service);
    }
  }

  async getChannelList(service = {}) {
    const now = new Date();
    const {accessToken} = service;
    if (accessToken && now - this.lastUpdated > ms('30s')) {
      this.lastUpdated = now;
      const uri = `https://slack.com/api/channels.list?token=${accessToken}&exclude_archived=1`;
      const res = await fetch(uri);
      const resJson = await res.json();
      if (resJson && resJson.ok) {
        this.setState({
          channelList: resJson.channels
        });
      }
    }
    return this.state.channelList;
  }

  dropdownMapper = async () => {
    const channels = await this.getChannelList(this.props.service);
    this.setState({
      options: channels.map((channel) => ({id: channel.id, label: channel.name}))
    });
  };

  handleItemClick = (option) => () => {
    const {teamMemberId} = this.props;
    cashay.mutate('addSlackChannel', {variables: {teamMemberId, slackChannelId: option.id}});
  };

  openOauth = () => {
    const {teamMemberId} = this.props;
    //console.log('sending tmi', teamMemberId);
    const redirect = makeHref('/auth/slack');
    // eslint-disable-next-line
    const uri = `https://slack.com/oauth/authorize?client_id=${window.__ACTION__.slack}&scope=identity.basic,channels:read,chat:write:bot&state=${teamMemberId}&redirect_uri=${redirect}`;
    window.open(uri);
  };

  removeOauth = () => {
    const {teamMemberId} = this.props;
    cashay.mutate('removeIntegration', {variables: {teamMemberId, service: 'slack'}});
  };

  render() {
    const {service, styles} = this.props;
    return (
      <div>
        <ServiceRow
          accessToken={service && service.accessToken}
          dropdownMapper={this.dropdownMapper}
          dropdownText="Add a Slack Channel"
          handleItemClick={this.handleItemClick}
          logo={slackLogo}
          name="Slack"
          openOauth={this.openOauth}
          options={this.state.options}
          removeOauth={this.removeOauth}
        />
        {service &&
          <div className={css(styles.channelHeader)}>
            <div>Channels</div>
            <div>ID</div>
          </div>
        }
        {service && service.syncs.map((sync) => {
          const channel = this.state.channelList.find((c) => c.id === sync.slackChannelId);
          if (!channel) return null;
          return (
            <div className={css(styles.channel)} key={channel.id}>
              <div>#{channel.name}</div>
              <div>{channel.id}</div>
            </div>
          );
        })}
      </div>
    );
  }
}


IntegrateSlack.propTypes = {
  service: PropTypes.object,
  styles: PropTypes.object,
  teamMemberId: PropTypes.string.isRequired
};

const marginLeft = '4.75rem'; // gutter + avatar + gutter
const paddingLeft = 0;
const paddingRight = ui.rowGutter;
const padding = '.5rem';

const styleThunk = () => ({
  channelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 700,
    marginLeft,
    padding,
    paddingLeft,
    paddingRight
  },

  channel: {
    borderTop: `1px solid ${appTheme.palette.mid30l}`,
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft,
    padding,
    paddingLeft,
    paddingRight
  }
});

export default withStyles(styleThunk)(IntegrateSlack);
