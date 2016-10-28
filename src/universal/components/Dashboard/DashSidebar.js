import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import tinycolor from 'tinycolor2';
import FontAwesome from 'react-fontawesome';
import DashNavListContainer from 'universal/containers/DashNavList/DashNavListContainer';
import DashNavItem from './DashNavItem';
import SettingsHub from 'universal/components/SettingsHub/SettingsHub';
import StandardHubContainer from 'universal/containers/StandardHub/StandardHubContainer';
import Logo from 'universal/styles/theme/images/brand/parabol-lockup-h.svg';
import {Link, withRouter} from 'react-router';

const DashSidebar = (props) => {
  const {isNewTeam, isUserSettings, router, styles} = props;
  const isActive = router.isActive('/newteam', true);
  const addNewStyles = css(
    styles.addTeam,
    !isActive && styles.addTeamDisabled
  );
  return (
    <div className={css(styles.root)}>
      {isUserSettings ? <SettingsHub/> : <StandardHubContainer/>}
      <nav className={css(styles.nav)}>
        <div className={css(styles.singleNavItem)}>
          <DashNavItem
            href="/me"
            label="My Dashboard"
          />
        </div>
        <div className={css(styles.navLabel)}>
          My Teams
        </div>
        <DashNavListContainer isNewTeam={isNewTeam}/>
        <Link className={addNewStyles} title="Add New Team" to="/newteam">
          <div className={css(styles.addTeamIcon)}>
            <FontAwesome name="plus-square" />
          </div>
          <div className={css(styles.addTeamLabel)}>
            Add New Team
          </div>
        </Link>
      </nav>
      <div className={css(styles.brand)}>
        <a href="http://www.parabol.co/" title="Action by Parabol, Inc." target="_blank">
          <img alt="Action by Parabol, Inc." className={css(styles.logo)} src={Logo} />
        </a>
      </div>
    </div>
  );
};

DashSidebar.propTypes = {
  styles: PropTypes.object,
  isNewTeam: PropTypes.bool,
  isUserSettings: PropTypes.bool
};

const textColor = tinycolor.mix(appTheme.palette.mid10l, '#fff', 50).toHexString();

const styleThunk = () => ({
  root: {
    backgroundColor: appTheme.palette.mid,
    color: textColor,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: ui.dashSidebarWidth,
    minWidth: ui.dashSidebarWidth
  },

  nav: {
    flex: 1,
    paddingBottom: '1.25rem',
    paddingLeft: '3.75rem',
    width: '100%'
  },

  singleNavItem: {
    padding: '1.25rem 0'
  },

  navLabel: {
    borderTop: '1px solid rgba(255, 255, 255, .5)',
    cursor: 'default',
    fontSize: appTheme.typography.s2,
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

  addTeamDisabled: {
    cursor: 'default',
    opacity: '.5'
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
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4,
    padding: '.4375rem .5rem .4375rem 1rem',
    textTransform: 'uppercase'
  },

  brand: {
    borderTop: '1px solid rgba(255, 255, 255, .2)',
    fontSize: 0,
    padding: '.75rem',
    textAlign: 'center'
  },

  logo: {
    display: 'inline-block',
    opacity: '.5',
    verticalAlign: 'top'
  }
});

export default withRouter(
  withStyles(styleThunk)(DashSidebar)
);
