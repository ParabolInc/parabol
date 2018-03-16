import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';

const DashHeader = (props) => {
  const {area, children, hasOverlay, styles} = props;
  const rootStyles = css(
    styles.root,
    hasOverlay && styles.hasOverlay
  );
  const innerStyles = css(
    styles.inner,
    styles[`${area}Inner`]
  );
  return (
    <div className={rootStyles}>
      <div className={innerStyles}>
        {children}
      </div>
    </div>
  );
};

DashHeader.propTypes = {
  area: PropTypes.oneOf([
    'teamDash',
    'teamSettings',
    'userDash',
    'userSettings'
  ]),
  children: PropTypes.any,
  hasOverlay: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottom: `1px solid ${ui.dashBorderColor}`,
    display: 'flex',
    width: '100%'
  },

  hasOverlay: {
    filter: ui.filterBlur
  },

  inner: {
    alignItems: 'center',
    display: 'flex',
    margin: '0 auto',
    minHeight: ui.dashHeaderMinHeight,
    padding: `0 ${ui.dashGutterSmall}`,
    width: '100%',
    [ui.dashBreakpoint]: {
      padding: `0 ${ui.dashGutterLarge}`
    }
  },

  teamDashInner: {
    [`@media (min-width: ${ui.dashTeamMaxWidthUp})`]: {
      maxWidth: ui.dashTeamMaxWidth
    }
  },

  userDashInner: {
    maxWidth: ui.taskColumnsMaxWidth
  }
});

export default withStyles(styleThunk)(DashHeader);
