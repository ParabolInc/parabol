import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';
import {cardBorderTop} from 'universal/styles/helpers';

const combineStyles = StyleSheet.combineStyles;

const SummaryCard = (props) => {
  const {styles} = SummaryCard;
  const {
    content,
    status,
    type
  } = props;

  const rootStyleOptions = [styles.root];

  if (type === 'project') {
    rootStyleOptions.push(styles[status]);
  } else {
    rootStyleOptions.push(styles.isAction);
  }

  const rootStyles = combineStyles(...rootStyleOptions);

  return (
    <div className={rootStyles}>
      <div className={styles.content}>{content}</div>
    </div>
  );
};

SummaryCard.propTypes = {
  content: PropTypes.string,
  status: PropTypes.oneOf(labels.projectStatus.slugs),
  type: PropTypes.oneOf([
    'project',
    'action'
  ])
};

SummaryCard.defaultProps = {
  type: 'action'
};

SummaryCard.styles = StyleSheet.create({
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

  content: {
    padding: '.5rem'
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

  isAction: {
    backgroundColor: theme.palette.light50l,

    '::after': {
      color: labels.action.color
    }
  }
});

export default look(SummaryCard);
