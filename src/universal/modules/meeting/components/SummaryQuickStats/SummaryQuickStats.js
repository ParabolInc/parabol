import PropTypes from 'prop-types';
import React from 'react';
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
    taskCount,
    styles
  } = props;

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.heading)}>
        <span className={css(styles.headingLabel)}>Quick Stats</span>
      </div>
      <div className={css(styles.cardGroup)}>
        <div className={css(styles.cardRootStyles, styles.tasks)}>
          <div className={css(styles.count)}>{taskCount}</div>
          <FontAwesome name={labels.task.icon} style={iconStyle} />
          <div className={css(styles.label)}>New Tasks</div>
        </div>
      </div>
    </div>
  );
};

SummaryQuickStats.propTypes = {
  taskCount: PropTypes.number,
  styles: PropTypes.object
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

  tasks: {
    color: labels.taskStatus[ACTIVE].color,
    '::after': {
      color: labels.taskStatus[ACTIVE].color
    }
  },

  updates: {
    color: appTheme.palette.warm,
    '::after': {
      color: appTheme.palette.warm
    }
  },

  done: {
    color: labels.taskStatus[DONE].color,
    '::after': {
      color: labels.taskStatus[DONE].color
    }
  }
});

export default withStyles(styleThunk)(SummaryQuickStats);
