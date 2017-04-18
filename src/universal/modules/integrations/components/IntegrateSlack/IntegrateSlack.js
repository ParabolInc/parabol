import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import appTheme from 'universal/styles/theme/appTheme';
import {reduxForm} from 'redux-form';
import slackLogo from 'universal/styles/theme/images/graphics/Slack_Mark.svg';
import {cashay} from 'cashay';
import makeHref from "universal/utils/makeHref";
import ServiceRow from "../ServiceRow/ServiceRow";
import ms from 'ms';

class IntegrateSlack extends Component {
  constructor() {
    super();
    this.state = {
      options: []
    };
    this.lastUpdated = 0;
  }

  dropdownMapper = () => {
    const now = new Date();
    if (now - this.lastUpdated > ms('3s')) {
      const {accessToken} = this.props;
      this.lastUpdated = now;
      const uri = `https://slack.com/api/channels.list?token=${accessToken}&exclude_archived=1`;
      fetch(uri).then((res) => res.json())
        .then((res) => {
          console.log('slack response', res);
          if (res && res.ok) {
            this.setState({
              options: res.channels.map((channel) => ({id: channel.id, label: channel.name}))
            });
          }
        }).catch((e) => {
        console.log(e)
      })
    }
  };

  handleItemClick = (option) => () => {
    const {teamMemberId} = this.props;
    console.log('you clicked', option.label);
    cashay.mutate('addSlackChannel', {variables: {teamMemberId, slackChannelId: option.id}})
  };

  openOauth = () => {
    const {teamMemberId} = this.props;
    const redirect = makeHref('/auth/slack');
    const uri = `https://slack.com/oauth/authorize?client_id=${__SLACK_CLIENT_ID__}&scope=channels:read,chat:write:bot&state=${teamMemberId}&redirect_uri=${redirect}`;
    window.open(uri);
  };

  removeOauth = () => {
    const {teamMemberId} = this.props;
    cashay.mutate('removeIntegration', {variables: {teamMemberId, service: 'slack'}});
  }

  render() {
    const {accessToken} = this.props;
    return (
      <ServiceRow
        accessToken={accessToken}
        dropdownMapper={this.dropdownMapper}
        dropdownText="Add a Slack Channel"
        handleItemClick={this.handleItemClick}
        logo={slackLogo}
        name="Slack"
        openOauth={this.openOauth}
        options={this.state.options}
        removeOauth={this.removeOauth}
        form="slack"
      />
    );
  }
}
;


IntegrateSlack.propTypes = {
  actions: PropTypes.any,
  email: PropTypes.string,
  invitedAt: PropTypes.string,
  isAdmin: PropTypes.bool,
  isLead: PropTypes.bool,
  picture: PropTypes.string,
  name: PropTypes.string,
  styles: PropTypes.object,
  teamMemberId: PropTypes.string
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
  },
});

export default reduxForm()(
  withStyles(styleThunk)(IntegrateSlack)
);
