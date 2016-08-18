import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import layoutStyle from 'universal/styles/layout';
import tinycolor from 'tinycolor2';
import FontAwesome from 'react-fontawesome';
import DashNavListContainer from 'universal/containers/DashNavList/DashNavListContainer';
import DashNavItem from './DashNavItem';
import SettingsHub from 'universal/components/SettingsHub/SettingsHub';
import StandardHubContainer from 'universal/containers/StandardHub/StandardHubContainer';

const textColor = tinycolor.mix(theme.palette.mid10l, '#fff', 50).toHexString();
let styles = {};

const DashSidebar = (props) => {
  const {activeArea} = props;
  const isSettings = activeArea === 'settings';
  return (
    <div className={styles.root}>
      {isSettings ? <SettingsHub/> : <StandardHubContainer/>}
      <nav className={styles.nav}>
        <div className={styles.singleNavItem}>
          <DashNavItem
            href="/me"
            label="My Dashboard"
          />
        </div>
        <div className={styles.navLabel}>
          My Teams
        </div>
        <DashNavListContainer/>
        <div className={styles.addTeam} title="Add New Team">
          <div className={styles.addTeamIcon}>
            <FontAwesome name="plus-square" />
          </div>
          <div className={styles.addTeamLabel}>
            Add New Team
          </div>
        </div>
      </nav>
    </div>
  );
};

DashSidebar.propTypes = {
  activeArea: PropTypes.oneOf([
    'outcomes',
    'settings',
    'team'
  ]).isRequired,
};

styles = StyleSheet.create({
  root: {
    backgroundColor: theme.palette.mid,
    color: textColor,
    paddingBottom: '1.25rem',
    width: layoutStyle.dashSidebarWidth,
  },

  nav: {
    paddingLeft: '3.75rem',
    width: '100%'
  },

  singleNavItem: {
    padding: '1.25rem 0'
  },

  navLabel: {
    borderTop: '1px solid rgba(255, 255, 255, .5)',
    fontSize: theme.typography.s2,
    fontWeight: 700,
    marginLeft: '1rem',
    padding: '1rem 0',
    textTransform: 'uppercase'
  },

  addTeam: {
    cursor: 'pointer',
    marginTop: '.5rem',
    position: 'relative',

    ':hover': {
      opacity: '.5'
    },
    ':focus': {
      opacity: '.5'
    }
  },

  addTeamIcon: {
    fontSize: '28px',
    height: '28px',
    lineHeight: '28px',
    position: 'absolute',
    right: '100%',
    top: '1px',
    width: '24px',
  },

  addTeamLabel: {
    fontSize: theme.typography.s2,
    fontWeight: 700,
    lineHeight: theme.typography.s4,
    padding: '.4375rem .5rem .4375rem 1rem',
    textTransform: 'uppercase'
  }
});

export default look(DashSidebar);
