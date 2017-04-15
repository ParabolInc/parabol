import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Row from 'universal/components/Row/Row';
import Button from "../../../../components/Button/Button";
import {Field, reduxForm} from 'redux-form';
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput';
import slackLogo from 'universal/styles/theme/images/graphics/Slack_Mark.svg';
import {cashay} from 'cashay';
import makeHref from "universal/utils/makeHref";
import ServiceRow from "../ServiceRow/ServiceRow";

const IntegrateSlack = (props) => {
  const {
    accessToken,
    teamMemberId
  } = props;
  return (
    <ServiceRow
      accessToken={accessToken}
      dropdownMapper={dropdownMapper}
      label="Sync a channel"
      logo={slackLogo}
      name="Slack"
      openOauth={() => {
        const redirect = makeHref('/auth/slack');
        const uri = `https://slack.com/oauth/authorize?client_id=${__SLACK_CLIENT_ID__}&scope=chat:write:bot&state=${teamMemberId}&redirect_uri=${redirect}`;
        window.open(uri);
      }}
      removeOauth={() => {
        cashay.mutate('removeIntegration', {variables: {teamMemberId, service: 'slack'}})
      }}
      form={`${service}Form`}
    />
  );
};

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
