import PropTypes from 'prop-types';
import React from 'react';
import {Menu, MenuItem} from 'universal/modules/menu';
import OutcomeCardFooterButton from '../OutcomeCardFooterButton/OutcomeCardFooterButton';

const OutcomeCardGitHubMenu = (props) => {
  const {outcome, setIntegrationStyles} = props;
  const {id: projectId, status} = outcome;

  const originAnchor = {
    vertical: 'bottom',
    horizontal: 'right'
  };

  const targetAnchor = {
    vertical: 'top',
    horizontal: 'right'
  };

  const toggle = <OutcomeCardFooterButton icon="github" />;

  const itemFactory = () => {
    const listItems = [];
    listItems.push(
      <MenuItem
        key="github1"
        label="mattkrick/cashay"
        onClick={setIntegrationStyles}
      />,
      <MenuItem
        key="github2"
        label="parabolinc/action"
        onClick={setIntegrationStyles}
      />,
      <MenuItem
        key="github3"
        label="parabolinc/chronos"
        onClick={setIntegrationStyles}
      />,
      <MenuItem
        key="github4"
        label="parabolinc/integrations"
        onClick={setIntegrationStyles}
      />,
      <MenuItem
        key="github5"
        label="parabolinc/services"
        onClick={setIntegrationStyles}
      />
    );
    return listItems;
  };

  return (
    <Menu
      itemFactory={itemFactory}
      label="Create a GitHub issue:"
      maxHeight="14.0625rem"
      originAnchor={originAnchor}
      targetAnchor={targetAnchor}
      toggle={toggle}
    />
  );

};

OutcomeCardGitHubMenu.propTypes = {
  outcome: PropTypes.object,
  setIntegrationStyles: PropTypes.func,
};

export default OutcomeCardGitHubMenu;
