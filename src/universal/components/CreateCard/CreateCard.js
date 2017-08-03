import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import CreateCardRootStyles from './CreateCardRootStyles';
import {cardBorderTop} from 'universal/styles/helpers';
import FontAwesome from 'react-fontawesome';

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

  const iconStyle = {
    display: 'block',
    fontSize: ui.iconSize2x,
    lineHeight: ui.iconSize2x,
    margin: '0 auto'
  };

  return (
    <div className={cardStyles}>
      {hasControls &&
        <div className={css(styles.controlsBlock)} onClick={handleAddProject} title="Add a Project or Task (just press “p”)">
          <FontAwesome
            name="plus-square-o"
            style={iconStyle}
          />
          <span>
            <b>{'Add a Project or Task'}</b><br />
            {'(tag '}<b>{'#private'}</b>{' for personal Tasks)'}
          </span>
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
      boxShadow: ui.cardBoxShadow[1]
    },
    ':focus': {
      boxShadow: ui.cardBoxShadow[2]
    }
  },

  controlsBlock: {
    alignContent: 'center',
    alignSelf: 'stretch',
    color: appTheme.palette.cool,
    display: 'flex',
    flexDirection: 'column',
    fontSize: appTheme.typography.s2,
    justifyContent: 'center',
    lineHeight: appTheme.typography.s5,
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
  }
});

export default withStyles(styleThunk)(CreateCard);
