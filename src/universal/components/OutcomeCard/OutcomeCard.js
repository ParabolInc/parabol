import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';
import {cardBorderTop} from 'universal/styles/helpers';

const combineStyles = StyleSheet.combineStyles;
let styles = {};

const OutcomeCard = (props) => {
  const {
    children,
    isArchived,
    isProject,
    onEnterCard,
    onLeaveCard,
    status
  } = props;
  let rootStyles;
  const rootStyleOptions = [
    styles.root,
    styles.cardBlock
  ];

  if (isProject) {
    rootStyleOptions.push(styles[status]);
  } else {
    rootStyleOptions.push(styles.isAction);
  }

  if (isArchived) {
    rootStyleOptions.push(styles.isArchived);
  }

  rootStyles = combineStyles(...rootStyleOptions);

  return (
    <div
      className={rootStyles}
      onMouseEnter={() => onEnterCard()}
      onMouseLeave={() => onLeaveCard()}
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

OutcomeCard.defaultProps = {
  isArchived: false,
  isProject: true,
  status: labels.projectStatus.active.slug
};

styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    border: `1px solid ${ui.cardBorderColor}`,
    borderRadius: ui.cardBorderRadius,
    maxWidth: '20rem',
    paddingTop: '.1875rem',
    position: 'relative',
    width: '100%',

    '::after': {
      ...cardBorderTop
    }
  },

  [`${ACTIVE}`]: {
    '::after': {
      color: labels.projectStatus[ACTIVE].color
    }
  },

  [`${STUCK}`]: {
    '::after': {
      color: labels.projectStatus[STUCK].color
    }
  },

  [`${DONE}`]: {
    '::after': {
      color: labels.projectStatus[DONE].color
    }
  },

  [`${FUTURE}`]: {
    '::after': {
      color: labels.projectStatus[FUTURE].color
    }
  },

  // TODO: Cards need block containers, not margin (TA)
  cardBlock: {
    marginBottom: '.5rem'
  },

  isAction: {
    backgroundColor: theme.palette.light50l,

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

export default look(OutcomeCard);
