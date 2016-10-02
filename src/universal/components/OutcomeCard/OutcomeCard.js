import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';
import {cardBorderTop} from 'universal/styles/helpers';

const OutcomeCard = (props) => {
  const {
    children,
    isArchived,
    isProject,
    onEnterCard,
    onLeaveCard,
    status,
    styles
  } = props;

  const rootStyles = css(
    styles.root,
    styles.cardBlock,
    isProject ? styles[status] : styles.isAction,
    isArchived && styles.isArchived
  );

  return (
    <div
      className={rootStyles}
      onMouseEnter={onEnterCard}
      onMouseLeave={onLeaveCard}
    >
      {children}
    </div>
  );
};

OutcomeCard.propTypes = {
  children: PropTypes.any,
  isArchived: PropTypes.bool,
  isProject: PropTypes.bool,
  onEnterCard: PropTypes.func,
  onLeaveCard: PropTypes.func,
  status: PropTypes.oneOf(labels.projectStatus.slugs)
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    border: `1px solid ${ui.cardBorderColor}`,
    borderRadius: ui.cardBorderRadius,
    maxWidth: '20rem',
    minHeight: ui.cardMinHeight,
    paddingTop: '.1875rem',
    position: 'relative',
    width: '100%',

    '::after': {
      ...cardBorderTop
    }
  },

  [ACTIVE]: {
    '::after': {
      color: labels.projectStatus[ACTIVE].color
    }
  },

  [STUCK]: {
    '::after': {
      color: labels.projectStatus[STUCK].color
    }
  },

  [DONE]: {
    '::after': {
      color: labels.projectStatus[DONE].color
    }
  },

  [FUTURE]: {
    '::after': {
      color: labels.projectStatus[FUTURE].color
    }
  },

  // TODO: Cards need block containers, not margin (TA)
  cardBlock: {
    marginBottom: '.5rem'
  },

  isAction: {
    backgroundColor: appTheme.palette.light50l,

    '::after': {
      color: labels.action.color
    }
  },

  isArchived: {
    '::after': {
      color: labels.archived.color
    }
  }
});

export default withStyles(styleThunk)(OutcomeCard);
