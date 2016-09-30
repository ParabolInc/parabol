import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, DONE} from 'universal/utils/constants';
import FontAwesome from 'react-fontawesome';
import {ib, cardBorderTop, cardRootStyles} from 'universal/styles/helpers';

const combineStyles = StyleSheet.combineStyles;

const iconStyle = {
  ...ib,
  fontSize: ui.iconSize
};

const SummaryQuickStats = (props) => {
  const {styles} = SummaryQuickStats;
  const {
    countNewActions,
    countNewProjects,
    countUpdates,
    countDone
  } = props;

  const actions = combineStyles(styles.cardRootStyles, styles.actions);
  const done = combineStyles(styles.cardRootStyles, styles.done);
  const projects = combineStyles(styles.cardRootStyles, styles.projects);
  const updates = combineStyles(styles.cardRootStyles, styles.updates);

  return (
    <div className={styles.root}>
      <div className={styles.heading}>
        <span className={styles.headingLabel}>Quick Stats</span>
      </div>
      <div className={styles.cardGroup}>
        <div className={projects}>
          <div className={styles.count}>{countNewProjects}</div>
          <FontAwesome name={labels.project.icon} style={iconStyle} />
          <div className={styles.label}>New Projects</div>
        </div>
        <div className={actions}>
          <div className={styles.count}>{countNewActions}</div>
          <FontAwesome name={labels.action.icon} style={iconStyle} />
          <div className={styles.label}>New Actions</div>
        </div>
        <div className={updates}>
          <div className={styles.count}>{countUpdates}</div>
          <FontAwesome name="random" style={iconStyle} />
          <div className={styles.label}>Updates</div>
        </div>
        <div className={done}>
          <div className={styles.count}>{countDone}</div>
          <FontAwesome name={labels.projectStatus.done.icon} style={iconStyle} />
          <div className={styles.label}>Done</div>
        </div>
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
  countDone: 5
};

SummaryQuickStats.styles = StyleSheet.create({
  root: {
    maxWidth: '37.5rem',
    width: '100%'
  },

  heading: {
    position: 'relative',
    textAlign: 'center',
    textTransform: 'uppercase',

    '::before': {
      backgroundColor: theme.palette.mid30l,
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
    color: theme.palette.dark,
    fontSize: theme.typography.s4,
    fontWeight: 700,
    lineHeight: theme.typography.s5,
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
    fontSize: theme.typography.s8
  },

  label: {
    ...ib,
    fontSize: theme.typography.s3,
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
    color: theme.palette.warm,
    '::after': {
      color: theme.palette.warm
    }
  },

  done: {
    color: labels.projectStatus[DONE].color,
    '::after': {
      color: labels.projectStatus[DONE].color
    }
  },

  actions: {
    backgroundColor: theme.palette.light50l,
    color: labels.action.color,

    '::after': {
      color: labels.action.color
    }
  }
});

export default look(SummaryQuickStats);
