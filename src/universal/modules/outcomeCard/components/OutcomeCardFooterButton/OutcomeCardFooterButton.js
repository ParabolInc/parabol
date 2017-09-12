import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const faStyle = {
  fontSize: ui.iconSize,
  lineHeight: '1.375rem'
};

const OutcomeCardFooterButton = (props) => {
  const {
    icon,
    onClick,
    onMouseEnter,
    styles
  } = props;

  const buttonStyles = css(
    styles.cardFooterButton
  );

  const handleOnClick = (e) => {
    if (onClick) onClick(e);
    // e.currentTarget.blur();
  };

  // NOTE: name="cardButton" used to detect activeElement (SEE: MeetingContainer.js)
  return (
    <button
      className={buttonStyles}
      name="cardButton"
      onClick={handleOnClick}
      onMouseEnter={onMouseEnter}
      type="button"
    >
      <FontAwesome name={icon} style={faStyle} />
    </button>
  );
};

OutcomeCardFooterButton.propTypes = {
  icon: PropTypes.string,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  styles: PropTypes.object
};

const styleThunk = () => ({
  cardFooterButton: {
    appearance: 'none',
    backgroundColor: 'transparent',
    border: '.0625rem solid transparent',
    borderRadius: ui.borderRadiusSmall,
    boxShadow: 'none',
    color: ui.palette.dark,
    cursor: 'pointer',
    height: '1.5rem',
    lineHeight: '1.5rem',
    opacity: '.5',
    outline: 'none',
    padding: 0,
    textAlign: 'center',
    userSelect: 'none',
    verticalAlign: 'middle',
    width: '1.5rem',

    ':hover': {
      opacity: 1
    },

    ':focus': {
      borderColor: appTheme.palette.mid50l,
      opacity: 1
    }
  }
});

export default withStyles(styleThunk)(OutcomeCardFooterButton);
