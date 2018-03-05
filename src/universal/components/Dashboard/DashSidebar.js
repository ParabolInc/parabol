import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import {NavLink} from 'react-router-dom';
import tinycolor from 'tinycolor2';
import DashNavList from 'universal/components/DashNavList/DashNavList';
import StandardHub from 'universal/components/StandardHub/StandardHub';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';
import appTheme from 'universal/styles/theme/appTheme';
import logoMark from 'universal/styles/theme/images/brand/mark-white.svg';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import DashNavItem from './DashNavItem';

const DashSidebar = (props) => {
  const {location, styles, viewer} = props;
  return (
    <div className={css(styles.root)}>
      <StandardHub viewer={viewer} />
      <div className={css(styles.navBlock)}>
        <nav className={css(styles.nav)}>
          <div className={css(styles.navTop)}>
            <div className={css(styles.singleNavItem)}>
              <DashNavItem
                location={location}
                href="/me"
                icon="table"
                label="My Dashboard"
              />
            </div>
            <div className={css(styles.navLabel)}>
              {'My Teams'}
            </div>
          </div>
          <div className={css(styles.navMain)}>
            <DashNavList location={location} viewer={viewer} />
          </div>
          <div className={css(styles.navBottom)}>
            <NavLink
              className={css(styles.addTeam)}
              activeClassName={css(styles.addTeamDisabled)}
              title="Add New Team"
              to="/newteam/1"
            >
              <div className={css(styles.addTeamIcon)}>
                <FontAwesome name="plus-circle" />
              </div>
              <div className={css(styles.addTeamLabel)}>
                {'Add New Team'}
              </div>
            </NavLink>
          </div>
        </nav>
      </div>
      <div className={css(styles.brand)}>
        <a href="http://www.parabol.co/" rel="noopener noreferrer" title="Parabol" target="_blank">
          <img alt="Parabol" className={css(styles.logo)} src={logoMark} />
        </a>
      </div>
    </div>
  );
};

DashSidebar.propTypes = {
  // required to update highlighting
  location: PropTypes.object.isRequired,
  styles: PropTypes.object,
  viewer: PropTypes.object
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

  navBlock: {
    flex: 1,
    position: 'relative'
  },

  nav: {
    display: 'flex',
    // flex: 1,
    flexDirection: 'column',
    left: 0,
    maxHeight: '100%',
    paddingBottom: '1.25rem',
    position: 'absolute',
    top: 0,
    // paddingLeft: '3.75rem',
    width: '100%'
  },

  navTop: {
    // Define (div for flex layout)
  },

  navMain: {
    flex: 1,
    overflowY: 'auto'
  },

  navBottom: {
    // Define (div for flex layout)
  },

  singleNavItem: {
    borderBottom: ui.dashMenuBorder,
    marginBottom: '1rem'
  },

  navLabel: {
    color: 'rgba(255, 255, 255, .5)',
    cursor: 'default',
    fontSize: appTheme.typography.s1,
    fontWeight: 600,
    marginLeft: '2.1875rem',
    padding: '1.25rem 0',
    textTransform: 'uppercase'
  },

  addTeam: {
    ...linkBaseStyles,
    alignItems: 'center',
    borderLeft: `${ui.navMenuLeftBorderWidth} solid transparent`,
    cursor: 'pointer',
    display: 'flex',
    margin: '.75rem 0 0',
    opacity: '.65',
    padding: '.625rem .5rem .625rem 2rem',
    position: 'relative',
    transition: `opacity ${ui.transition[0]}`,
    userSelect: 'none',

    ...makeHoverFocus({
      ...linkBaseStyles,
      backgroundColor: ui.navMenuDarkBackgroundColorHover,
      opacity: 1
    })
  },

  addTeamDisabled: {
    backgroundColor: ui.navMenuDarkBackgroundColorActive,
    cursor: 'default',
    opacity: 1,

    ...makeHoverFocus({
      backgroundColor: ui.navMenuDarkBackgroundColorActive,
      opacity: 1
    })
  },

  addTeamIcon: {
    fontSize: ui.iconSize,
    height: ui.iconSize,
    lineHeight: ui.iconSize,
    paddingLeft: '.1875rem',
    width: '1.625rem'
  },

  addTeamLabel: {
    fontSize: ui.navMenuFontSize,
    lineHeight: ui.navMenuLineHeight
  },

  brand: {
    fontSize: 0,
    padding: '.75rem',
    textAlign: 'center'
  },

  logo: {
    display: 'inline-block',
    verticalAlign: 'top'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(DashSidebar),
  graphql`
    fragment DashSidebar_viewer on User {
      ...StandardHub_viewer
      ...DashNavList_viewer
    }
  `
);
