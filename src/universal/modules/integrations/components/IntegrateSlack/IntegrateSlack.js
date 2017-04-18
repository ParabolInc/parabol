import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import appTheme from 'universal/styles/theme/appTheme';
import {Field, reduxForm} from 'redux-form';
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
    console.log('you clicked', option.label);
    cashay.mutate('addSlackChannel', {variables: {teamMemberId, slackChannelId: option.id}})
  };

  render() {
    const {
      accessToken,
      teamMemberId
    } = this.props;
    return (
      <ServiceRow
        accessToken={accessToken}
        dropdownMapper={this.dropdownMapper}
        handleItemClick={this.handleItemClick}
        label="Sync a channel"
        logo={slackLogo}
        name="Slack"
        openOauth={() => {
          const redirect = makeHref('/auth/slack');
          const uri = `https://slack.com/oauth/authorize?client_id=${__SLACK_CLIENT_ID__}&scope=channels:read,chat:write:bot&state=${teamMemberId}&redirect_uri=${redirect}`;
          window.open(uri);
        }}
        options={this.state.options}
        removeOauth={() => {
          cashay.mutate('removeIntegration', {variables: {teamMemberId, service: 'slack'}})
        }}
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
  styles: PropTypes.object
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
