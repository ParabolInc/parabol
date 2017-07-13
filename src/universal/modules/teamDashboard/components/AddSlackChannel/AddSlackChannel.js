import {css} from 'aphrodite-local-styles/no-important';
import ms from 'ms';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from 'universal/components/Button/Button';
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput';
import AddSlackChannelMutation from 'universal/mutations/AddSlackChannelMutation';
import formError from 'universal/styles/helpers/formError';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

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
    const {selectedChannel} = this.state;
    if (!selectedChannel.channelId) return;
    const onError = ({_error}) => {
      this.setState({
        error: _error
      })
    };
    const onCompleted = () => {
      if (this.state.error) {
        this.setState({
          error: null
        })
      }
    }
    AddSlackChannelMutation(environment, selectedChannel, teamMemberId, viewerId, onError, onCompleted);
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
    const {accessToken, styles} = this.props;
    return (
      <div className={css(styles.addChannel)}>
        <div className={css(styles.dropdownAndError)}>
          <ServiceDropdownInput
            accessToken={accessToken}
            dropdownMapper={this.dropdownMapper}
            dropdownText={channelName}
            handleItemClick={this.updateDropdownItem}
            options={options}
          />
          <div className={css(styles.error)}>
            {this.state.error}
          </div>
        </div>
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

const styleThunk = () => ({
  addChannel: {
    display: 'flex',
    width: '100%'
  },
  dropdownAndError: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column'
  },
  error: {
    ...formError,
    textAlign: 'right'
  }
});


export default withStyles(styleThunk)(AddSlackChannel);
