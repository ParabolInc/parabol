import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';
import tinycolor from 'tinycolor2';
import FontAwesome from 'react-fontawesome';
import DashNavListContainer from 'universal/containers/DashNavList/DashNavListContainer';
import DashNavItem from './DashNavItem';
import StandardHubContainer from 'universal/containers/StandardHub/StandardHubContainer';
import Logo from 'universal/styles/theme/images/brand/parabol-lockup-h.svg';
import {Link, withRouter} from 'react-router';

const DashSidebar = (props) => {
  const {location, router, styles} = props;
  const newTeamIsActive = router.isActive('/newteam') || router.isActive('/newteam/1');
  const addNewStyles = css(
    styles.addTeam,
    newTeamIsActive && styles.addTeamDisabled
  );
  return (
    <div className={css(styles.root)}>
      <StandardHubContainer location={location} />
      <nav className={css(styles.nav)}>
        <div className={css(styles.singleNavItem)}>
          <DashNavItem
            href="/me"
            label="My Dashboard"
          />
        </div>
        <div className={css(styles.navLabel, styles.navLabelForList)}>
          My Teams
        </div>
        <DashNavListContainer/>
        <Link className={addNewStyles} title="Add New Team" to="/newteam">
          <div className={css(styles.addTeamIcon)}>
            <FontAwesome name="plus-square"/>
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
  location: PropTypes.string,
  router: PropTypes.object,
  styles: PropTypes.object
};

const textColor = tinycolor.mix(appTheme.palette.mid10l, '#fff', 50).toHexString();
const linkBaseStyles = {
  color: textColor,
  textDecoration: 'none'
};

const styleThunk = () => ({
  root: {
    backgroundColor: ui.dashSidebarBackgroundColor,
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
    padding: '.5rem 0'
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

  navLabelForList: {
    paddingBottom: '.5rem'
  },

  addTeam: {
    ...linkBaseStyles,
    cursor: 'pointer',
    display: 'block',
    marginTop: '.5rem',
    position: 'relative',
    transition: `opacity ${ui.transitionFastest}`,
    userSelect: 'none',

    ...makeHoverFocus({
      ...linkBaseStyles,
      opacity: '.5'
    })
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
