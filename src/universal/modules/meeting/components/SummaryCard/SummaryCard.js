import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';
import {cardBorderTop} from 'universal/styles/helpers';

const SummaryCard = (props) => {
  const {
    content,
    status,
    styles,
    type,
  } = props;

  const rootStyles = css(
    styles.root,
    // TODO sure this shouldn't be Project, not project?
    type === 'project' ? styles[status] : styles.isAction
  );

  return (
    <div className={rootStyles}>
      <div className={css(styles.content)}>{content}</div>
    </div>
  );
};

SummaryCard.propTypes = {
  content: PropTypes.string,
  status: PropTypes.oneOf(labels.projectStatus.slugs),
  styles: PropTypes.object,
  type: PropTypes.oneOf([
    'project',
    'action'
  ])
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
    backgroundColor: appTheme.palette.light50l,

    '::after': {
      color: labels.action.color
    }
  }
});

export default withStyles(styleThunk)(SummaryCard);
