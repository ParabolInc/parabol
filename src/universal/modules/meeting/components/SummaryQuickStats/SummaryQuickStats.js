import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, DONE} from 'universal/utils/constants';
import FontAwesome from 'react-fontawesome';
import {ib, cardBorderTop, cardRootStyles} from 'universal/styles/helpers';

const iconStyle = {
  ...ib,
  fontSize: ui.iconSize
};

const SummaryQuickStats = (props) => {
  const {
    actionCount,
    projectCount,
    styles
  } = props;

  const actions = css(styles.cardRootStyles, styles.actions);
  const projects = css(styles.cardRootStyles, styles.projects);

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.heading)}>
        <span className={css(styles.headingLabel)}>Quick Stats</span>
      </div>
      <div className={css(styles.cardGroup)}>
        <div className={projects}>
          <div className={css(styles.count)}>{projectCount}</div>
          <FontAwesome name={labels.project.icon} style={iconStyle} />
          <div className={css(styles.label)}>New Projects</div>
        </div>
        <div className={actions}>
          <div className={css(styles.count)}>{actionCount}</div>
          <FontAwesome name={labels.action.icon} style={iconStyle} />
          <div className={css(styles.label)}>New Actions</div>
        </div>
      </div>
    </div>
  );
};

SummaryQuickStats.propTypes = {
  actionCount: PropTypes.number,
  projectCount: PropTypes.number,
  styles: PropTypes.object
};

SummaryQuickStats.defaultProps = {
  actionCount: 12,
  projectCount: 4
};

const styleThunk = () => ({
  root: {
    maxWidth: '37.5rem',
    width: '100%'
  },

  heading: {
    position: 'relative',
    textAlign: 'center',
    textTransform: 'uppercase',

    '::before': {
      backgroundColor: appTheme.palette.mid30l,
      content: '""',
      display: 'block',
      height: '2px',
      margin: '-1px auto auto',
      position: 'absolute',
      top: '50%',
      width: '100%',
      zIndex: 200
    },
    '::after': {
      backgroundColor: '#fff',
      content: '""',
      display: 'none',
      height: '1px',
      margin: '-.5px auto auto',
      position: 'absolute',
      top: '50%',
      width: '100%',
      zIndex: 200
    }
  },

  headingLabel: {
    ...ib,
    backgroundColor: '#fff',
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s4,
    fontWeight: 700,
    lineHeight: appTheme.typography.s5,
    padding: '1.25rem .75rem',
    position: 'relative',
    zIndex: 400
  },

  cardGroup: {
    display: 'flex',
    margin: '0 -.625rem',
    width: '38.75rem'
  },

  count: {
    fontSize: appTheme.typography.s8
  },

  label: {
    ...ib,
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    marginLeft: '.25rem'
  },

  cardRootStyles: {
    ...cardRootStyles,
    margin: '0 .625rem',
    padding: '.5rem',
    textAlign: 'center',

    '::after': {
      ...cardBorderTop
    }
  },

  projects: {
    color: labels.projectStatus[ACTIVE].color,
    '::after': {
      color: labels.projectStatus[ACTIVE].color
    }
  },

  updates: {
    color: appTheme.palette.warm,
    '::after': {
      color: appTheme.palette.warm
    }
  },

  done: {
    color: labels.projectStatus[DONE].color,
    '::after': {
      color: labels.projectStatus[DONE].color
    }
  },

  actions: {
    backgroundColor: appTheme.palette.light50l,
    color: labels.action.color,

    '::after': {
      color: labels.action.color
    }
  }
});

export default withStyles(styleThunk)(SummaryQuickStats);
