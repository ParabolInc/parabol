import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
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
    countNewActions,
    countNewProjects,
    countUpdates,
    countDone,
    styles
  } = props;

  const actions = css(styles.cardRootStyles, styles.actions);
  const done = css(styles.cardRootStyles, styles.done);
  const projects = css(styles.cardRootStyles, styles.projects);
  const updates = css(styles.cardRootStyles, styles.updates);

  return (
    <div className={css(styles.root)}>
      <div className={projects}>
        <div className={css(styles.count)}>{countNewActions}</div>
        <FontAwesome name="calendar" style={iconStyle} />
        <div className={css(styles.label)}>New Actions</div>
      </div>
      <div className={actions}>
        <div className={css(styles.count)}>{countNewProjects}</div>
        <FontAwesome name="calendar" style={iconStyle} />
        <div className={css(styles.label)}>New Projects</div>
      </div>
      <div className={updates}>
        <div className={css(styles.count)}>{countUpdates}</div>
        <FontAwesome name="calendar" style={iconStyle} />
        <div className={css(styles.label)}>Updates</div>
      </div>
      <div className={done}>
        <div className={css(styles.count)}>{countDone}</div>
        <FontAwesome name="calendar" style={iconStyle} />
        <div className={css(styles.label)}>Done</div>
      </div>
    </div>
  );
};

SummaryQuickStats.propTypes = {
  countNewActions: PropTypes.number,
  countNewProjects: PropTypes.number,
  countUpdates: PropTypes.number,
  countDone: PropTypes.number
};

SummaryQuickStats.defaultProps = {
  countNewActions: 12,
  countNewProjects: 4,
  countUpdates: 9,
  countDone: 4
};

console.log(cardRootStyles);

const styleThunk = () => ({
  root: {
    display: 'flex',
    maxWidth: '37.5rem',
    width: '100%'
  },

  cardRootStyles: {
    ...cardRootStyles,
    margin: '0 .625rem',
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
