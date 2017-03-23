import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const RejoinFacilitatorButton = (props) => {
  const {styles, onClickHandler} = props;
  const inlineBlock = {
    display: 'inline-block',
    lineHeight: '1.25rem',
    verticalAlign: 'top'
  };
  const iconStyle = {
    ...inlineBlock,
    color: 'white',
    fontSize: ui.iconSize,
    marginRight: '.625rem'
  };
  return (
    <div
      className={css(styles.rejoinFacilitatorButton)}
      onClick={onClickHandler}
    >
      <FontAwesome
        name="user"
        style={iconStyle}
      />
      <span style={inlineBlock}>
        Rejoin Facilitator
      </span>
    </div>
  );
};

RejoinFacilitatorButton.propTypes = {
  styles: PropTypes.object,
  onClickHandler: PropTypes.func
};

const styleThunk = () => ({
  rejoinFacilitatorButton: {
    ...ui.buttonBaseStyles,
    backgroundColor: appTheme.palette.warm,
    borderRadius: ui.buttonBorderRadius,
    bottom: '2rem',
    boxShadow: '.25rem .25rem 1rem rgba(0, 0, 0, .4)',
    color: 'white',
    fontSize: appTheme.typography.s4,
    padding: '.75rem',
    position: 'fixed',
    right: '2rem',

    ':hover': {
      opacity: '.65'
    }
  }
});

export default withStyles(styleThunk)(RejoinFacilitatorButton);
