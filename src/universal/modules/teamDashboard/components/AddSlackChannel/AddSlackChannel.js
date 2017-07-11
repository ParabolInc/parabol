import ms from 'ms';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from 'universal/components/Button/Button';
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput';
import AddSlackChannelMutation from 'universal/mutations/AddSlackChannelMutation';

import ui from 'universal/styles/ui';

const defaultSelectedChannel = () => ({
  channelId: undefined,
  channelName: 'Select a Slack channel'
});

class AddSlackChannel extends Component {
  static propTypes = {
    accessToken: PropTypes.string,
    environment: PropTypes.object,
    teamMemberId: PropTypes.string,
    viewerId: PropTypes.string
  }
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      channelList: [],
      selectedChannel: defaultSelectedChannel()
    };
    this.lastUpdated = 0;
    this.getChannelList(props.accessToken);
  }

  componentWillReceiveProps(nextProps) {
    const {accessToken} = nextProps;
    if (!this.props.accessToken !== accessToken) {
      this.getChannelList(accessToken);
    }
  }

  async getChannelList(accessToken) {
    const now = new Date();
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

  updateDropdownItem = (option) => () => {
    this.setState({
      selectedChannel: {
        channelId: option.id,
        channelName: option.label
      }
    });
  };

  handleAddChannel = () => {
    const {environment, teamMemberId, viewerId} = this.props;
    const {selectedChannel: {channelId, channelName}} = this.state;
    if (!channelId) return;
    AddSlackChannelMutation(environment, channelId, channelName, teamMemberId, viewerId);
    this.setState({
      selectedChannel: defaultSelectedChannel()
    });
  };

  dropdownMapper = async () => {
    const channels = await this.getChannelList(this.props.accessToken);
    // filter out channels that have already been added
    const {subbedChannels} = this.props;
    const subbedChannelIds = subbedChannels.map((channel) => channel.channelId);
    const options = channels.filter((channel) => !subbedChannelIds.includes(channel.id))
      .map((channel) => ({id: channel.id, label: channel.name}));
    this.setState({
      options
    });
  };

  render() {
    const {options, selectedChannel: {channelName}} = this.state;
    const {accessToken} = this.props;
    return (
      <div style={{display: 'flex', width: '100%'}}>
        <ServiceDropdownInput
          accessToken={accessToken}
          dropdownMapper={this.dropdownMapper}
          dropdownText={channelName}
          handleItemClick={this.updateDropdownItem}
          options={options}
        />
        <div style={{paddingLeft: ui.rowGutter, minWidth: '11rem'}}>
          <Button
            colorPalette="cool"
            isBlock
            label="Add Channel"
            size="small"
            onClick={this.handleAddChannel}
          />
        </div>
      </div>
    );
  }
}

export default AddSlackChannel;
