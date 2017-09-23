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
    handleAddProject,
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
        <div className={css(styles.controlsBlock)} onClick={handleAddProject} title="Add a Project (just press “p”)">
          <div className={css(styles.label)}>
            {'Add a '}<u>{'P'}</u>{'roject'}
          </div>
          <div className={css(styles.hint)}>
            {'(tag '}<b>{'#private'}</b>{' for personal Projects)'}
          </div>
        </div>
      }
    </div>
  );
};

CreateCard.propTypes = {
  handleAddProject: PropTypes.func,
  hasControls: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    ...CreateCardRootStyles,
    paddingLeft: 0,
    paddingRight: 0,

    '::after': {
      ...cardBorderTop,
      color: appTheme.palette.mid40l
    }
  },

  hasControls: {
    '::after': {
      color: appTheme.palette.mid
    },
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
    color: appTheme.palette.cool,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    lineHeight: '1.5',
    textAlign: 'center',
    width: '100%',

    ':hover': {
      color: appTheme.palette.cool80d,
      cursor: 'pointer'
    },
    ':focus': {
      color: appTheme.palette.cool80d,
      cursor: 'pointer'
    }
  },

  label: {
    fontSize: appTheme.typography.s4,
    fontWeight: 700
  },

  hint: {
    fontSize: appTheme.typography.s2
  }
});

export default withStyles(styleThunk)(CreateCard);
