import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
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
      syncsById: {}
    };
    this.lastUpdated = 0;
    this.channelList = [];
    this.getChannelList();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.service && nextProps.service) {
      console.log('got the service');
      this.getChannelList();
    }
  }

  async getChannelList() {
    if (!this.props.service) {
      return [];
    }
    console.log('getting channelList)');
    const accessToken = this.props.service && this.props.service.id;
    const uri = `https://slack.com/api/channels.list?token=${accessToken}&exclude_archived=1`;
    const res = await fetch(uri);
    const resJson = await res.json();
    if (resJson && resJson.ok) {
      this.channelList = res.channels;
      return res.channels;
    }
    return [];
  }

  dropdownMapper = async () => {
    const now = new Date();
    if (now - this.lastUpdated > ms('30s')) {
      this.lastUpdated = now;
      const channels = await this.getChannelList();
      this.setState({
        options: channels.map((channel) => ({id: channel.id, label: channel.name}))
      });
    }
  };

  handleItemClick = (option) => () => {
    const {teamMemberId} = this.props;
    console.log('you clicked', option.label);
    cashay.mutate('addSlackChannel', {variables: {teamMemberId, slackChannelId: option.id}});
  };

  openOauth = () => {
    const {teamMemberId} = this.props;
    const redirect = makeHref('/auth/slack');
    // eslint-disable-next-line
    const uri = `https://slack.com/oauth/authorize?client_id=${__SLACK_CLIENT_ID__}&scope=channels:read,chat:write:bot&state=${teamMemberId}&redirect_uri=${redirect}`;
    window.open(uri);
  };

  removeOauth = () => {
    const {teamMemberId} = this.props;
    cashay.mutate('removeIntegration', {variables: {teamMemberId, service: 'slack'}});
  }

  render() {
    const {service} = this.props;
    return (
      <div>
        <ServiceRow
          accessToken={service && service.id}
          dropdownMapper={this.dropdownMapper}
          dropdownText="Add a Slack Channel"
          handleItemClick={this.handleItemClick}
          logo={slackLogo}
          name="Slack"
          openOauth={this.openOauth}
          options={this.state.options}
          removeOauth={this.removeOauth}
        />
        {service && service.syncs.map((sync) => {
          const channel = this.channelList.find((c) => c.id === sync.id);
          if (!channel) return null;
          return (
            <div>
              {channel.id} - {channel.name}
            </div>
          );
        })}
      </div>
    );
  }
}


IntegrateSlack.propTypes = {
  service: PropTypes.string,
  teamMemberId: PropTypes.string.isRequired

};

const styleThunk = () => ({
  logo: {
    flexShrink: 0
  },

  manageService: {
    display: 'flex'
  },

  name: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem',
    verticalAlign: 'middle'
  }
});

export default withStyles(styleThunk)(IntegrateSlack);
