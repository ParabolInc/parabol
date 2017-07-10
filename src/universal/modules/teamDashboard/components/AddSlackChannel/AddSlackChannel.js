
import ms from 'ms';
import React, {Component} from 'react';

import Button from 'universal/components/Button/Button';
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput';
import AddSlackChannelMutation from 'universal/mutations/AddSlackChannelMutation';

import ui from 'universal/styles/ui';

class AddSlackChannel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      channelList: [],
      selectedChannel: undefined
    };
    this.lastUpdated = 0;
    console.log('asc', props)
    this.getChannelList(props.accessToken);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken !== nextProps.accessToken) {
      this.getChannelList(nextProps.accessToken);
    }
  }

  handleAddChannel = () => {
    const {environment, teamMemberId, viewerId} = this.props;
    const {selectedChannel: {channelId, channelName}} = this.state;
    AddSlackChannelMutation(environment, channelId, channelName, teamMemberId, viewerId);
  };

  updateDropdownItem = (option) => () => {
    this.setState({
      selectedChannel: {
        channelId: option.id,
        channelName: option.label
      }
    });
  };

  async getChannelList(accessToken ) {
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

  dropdownMapper = async () => {
    const channels = await this.getChannelList(this.props.accessToken);
    // filter out channels that have already been added
    const {subbedChannels} = this.props;
    const subbedChannelIds = subbedChannels.map(channel => channel.node.channelId);
    const options = channels.filter((channel) => !subbedChannelIds.includes(channel.id))
      .map((channel) => ({id: channel.id, label: channel.name}));
    this.setState({
      options
    });
  };

  render() {
    const {options} = this.state;
    const {accessToken} = this.props;
    return (
      <div style={{display: 'flex', width: '100%'}}>
        <ServiceDropdownInput
          accessToken={accessToken}
          dropdownMapper={this.dropdownMapper}
          dropdownText="Select a Slack channel"
          handleItemClick={this.updateDropdownItem}
          options={options}
        />
        <div style={{paddingLeft: ui.rowGutter}}>
          <Button
            colorPalette="cool"
            label="Add Channel"
            size="small"
            onClick={this.handleAddChannel}
          />
        </div>
      </div>
    )
  }
}

export default AddSlackChannel;
