import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import DashNavItem from 'universal/components/Dashboard/DashNavItem';
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const iconStyles = {
  color: appTheme.palette.light,
  fontSize: `${ui.iconSize} !important`,
  position: 'absolute',
  right: '100%',
  textAlign: 'center',
  width: 24
};

const DashNavTeam = (props) => {
  const {styles, team} = props;
  return (
    <div className={css(styles.iconAndLink)}>
      {!team.isPaid &&
      <FontAwesome name="warning" styles={iconStyles} title="Team is disabled for nonpayment" />}
      <DashNavItem
        href={`/team/${team.id}`}
        label={team.name}
      />
    </div>
  );
};

DashNavTeam.propTypes = {
  styles: PropTypes.object,
  team: PropTypes.object.isRequired
};

const styleThunk = () => ({
  iconAndLink: {
    alignItems: 'center',
    display: 'flex',
    position: 'relative'
  }
});

export default createFragmentContainer(
  withRouter(withStyles(styleThunk)(DashNavTeam)),
  graphql`
    fragment DashNavTeam_team on Team {
      id
      isPaid
      name
    }
  `
);
