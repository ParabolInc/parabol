import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import CreateCardRootStyles from './CreateCardRootStyles';
import {cardBorderTop} from 'universal/styles/helpers';

const CreateCard = (props) => {
  const {
    handleAddTask,
    hasControls,
    styles
  } = props;

  const cardStyles = css(
    styles.root,
    (hasControls) && styles.hasControls
  );

  return (
    <div className={cardStyles}>
      {hasControls &&
        <div className={css(styles.controlsBlock)} onClick={handleAddTask} title="Add a Task (just press “t”)">
          <div className={css(styles.label)}>
            {'Add a '}<u>{'T'}</u>{'ask'}
          </div>
          <div className={css(styles.hint)}>
            {'(tag '}<b>{'#private'}</b>{' for personal Tasks)'}
          </div>
        </div>
      }
    </div>
  );
};

CreateCard.propTypes = {
  handleAddTask: PropTypes.func,
  hasControls: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    ...CreateCardRootStyles,
    backgroundColor: 'transparent',
    border: `1px dashed ${appTheme.palette.mid30l}`,
    boxShadow: 'none',
    paddingLeft: 0,
    paddingRight: 0
  },

  hasControls: {
    ...CreateCardRootStyles,
    borderTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    ':hover': {
      boxShadow: ui.shadow[1]
    },
    ':focus': {
      boxShadow: ui.shadow[2]
    }
  },

  controlsBlock: {
    alignContent: 'center',
    alignSelf: 'stretch',
    color: appTheme.palette.mid,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    lineHeight: '1.5',
    textAlign: 'center',
    width: '100%',

    ':hover': {
      color: appTheme.palette.mid80d,
      cursor: 'pointer'
    },
    ':focus': {
      color: appTheme.palette.mid80d,
      cursor: 'pointer'
    }
  },

  label: {
    fontSize: appTheme.typography.s4,
    fontWeight: 600
  },

  hint: {
    fontSize: appTheme.typography.s2
  }
});

export default withStyles(styleThunk)(CreateCard);
