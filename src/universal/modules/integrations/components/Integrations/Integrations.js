import React, {PropTypes} from 'react';
import withStyles from '../../../../styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from '../../../../styles/theme/appTheme';
import {overflowTouch} from 'universal/styles/helpers';
import DashModal from "../../../../components/Dashboard/DashModal";
import allServices from 'universal/modules/integrations/helpers/allServices';
import ServiceRow from "../ServiceRow/ServiceRow";
import ui from 'universal/styles/ui';
import githubLogo from 'universal/styles/theme/images/graphics/GitHub-Mark-120px-plus.png';
import {cashay} from 'cashay';
import makeHref from "universal/utils/makeHref";
import IntegrateSlack from 'universal/modules/integrations/components/IntegrateSlack/IntegrateSlack';

const integrationPicker = {
  slack: IntegrateSlack,
  // github:
}
const Integrations = (props) => {
  const {
    closePortal,
    closeAfter,
    isClosing,
    services,
    teamMemberId,
    styles
  } = props;

  const tokenLookup = services.reduce((obj, usedService) => ({[usedService.service]: usedService.id}), {});
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} inheritWidth closeAfter={closeAfter} modalLayout={ui.modalLayoutMain}>
      <div className={css(styles.integrations)}>
        <h2>Integrations</h2>
        <div>Synced Accounts</div>
        <div>...</div>
        <div>Services</div>
        {services.map((service) => {
          const IntegrationComponent = integrationPicker[service.service];
          if (!IntegrationComponent) return null;
          return <IntegrationComponent accessToken={service.id} teamMemberId={teamMemberId}/>
        })}

        {/*<ServiceRow*/}
          {/*accessToken={tokenLookup.slack}*/}
          {/*dropdownMapper={dropdownMapper}*/}
          {/*label="Sync a project"*/}
          {/*logo={githubLogo}*/}
          {/*name="GitHub"*/}
          {/*openOauth={() => {*/}
            {/*const uri = `https://github.com/login/oauth/authorize?scope=user:email,repo,write:repo_hook&state=${teamMemberId}&client_id=${__GITHUB_CLIENT_ID__}`;*/}
            {/*window.open(uri);*/}
          {/*}}*/}
          {/*removeOauth={() => {*/}
            {/*cashay.mutate('removeIntegration', {variables: {teamMemberId, service: 'github'}})*/}
          {/*}}*/}
          {/*form={`${service}Form`}*/}
        {/*/>*/}

        {/*{allServices.map((integration) => {*/}
          {/*const {openOauth, removeOauth, service, logo, name, dropdownMapper} = integration;*/}
          {/*const matchingService = services.find((s) => s.service === service);*/}
          {/*const accessToken = matchingService && matchingService.id;*/}
          {/*return (*/}
            {/*<ServiceRow*/}
              {/*key={service}*/}
              {/*accessToken={accessToken}*/}
              {/*dropdownMapper={dropdownMapper}*/}
              {/*logo={logo}*/}
              {/*name={name}*/}
              {/*openOauth={openOauth(teamMemberId)}*/}
              {/*removeOauth={removeOauth(teamMemberId)}*/}
              {/*form={`${service}Form`}*/}
            {/*/>*/}
          {/*)*/}
        {/*})}*/}
      </div>
    </DashModal>
  );
};

Integrations.propTypes = {
  dispatch: PropTypes.func.isRequired,
  invitations: PropTypes.array.isRequired,
  myTeamMember: PropTypes.object.isRequired,
  orgApprovals: PropTypes.array,
  styles: PropTypes.object,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  inviteBlock: {
    maxWidth: '42rem',
    padding: '0 1rem'
  },

  body: {
    flex: 1,
    position: 'relative',
    width: '100%'
  },

  scrollable: {
    ...overflowTouch,
    bottom: 0,
    left: 0,
    maxWidth: '42rem',
    padding: '0 1rem 1rem',
    position: 'absolute',
    right: 0,
    top: 0,
  },

  actionLinkBlock: {
    fontSize: 0,
    textAlign: 'right'
  },

  actionLink: {
    color: appTheme.palette.dark,
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    lineHeight: appTheme.typography.s5,
    marginLeft: '1.25rem',
    textDecoration: 'underline',
    verticalAlign: 'middle',

    ':hover': {
      opacity: '.5'
    }
  }
});

export default withStyles(styleThunk)(Integrations);
