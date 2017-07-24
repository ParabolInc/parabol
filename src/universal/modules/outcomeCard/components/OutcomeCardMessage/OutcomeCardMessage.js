import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';

const OutcomeCardMessage = (props) => {
  const {
    hasClose,
    message,
    styles
  } = props;

  const messageInnerStyles = css(
    styles.messageInner,
    hasClose && styles.hasClose
  );

  return (
    <div className={css(styles.message)}>
      <div className={messageInnerStyles}>
        {message}
        {hasClose &&
          <div
            className={css(styles.messageClose)}
            onClick={() => console.log('Close that card message!')}
            tabIndex="0"
          >
            <FontAwesome
              className={css(styles.messageCloseIcon)}
              name="times-circle"
            />
          </div>
        }
      </div>
    </div>
  );
};

OutcomeCardMessage.propTypes = {
  colorPalette: PropTypes.oneOf([
    'cool',
    'dark',
    'warm'
  ]),
  hasClose: PropTypes.bool,
  message: PropTypes.string,
  styles: PropTypes.object
};

const textShadow = '0 1px rgba(0, 0, 0, .15)';

const styleThunk = (theme, {colorPalette}) => ({
  message: {
    padding: `0 ${ui.cardPaddingBase} ${ui.cardPaddingBase}`
  },

  hasClose: {
    paddingRight: '1.375rem'
  },

  messageInner: {
    backgroundColor: ui.palette[colorPalette] || ui.palette.warm,
    borderRadius: ui.borderRadiusSmall,
    color: '#fff',
    display: 'block',
    fontWeight: 700,
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.s4,
    padding: ui.cardPaddingBase,
    position: 'relative',
    textShadow
  },

  messageClose: {
    cursor: 'pointer',
    fontSize: 0,
    outline: 'none',
    padding: `.25rem`,
    position: 'absolute',
    right: 0,
    textShadow,
    top: 0,

    ':hover': {
      opacity: '.5'
    },
    ':focus': {
      opacity: '.5'
    }
  },

  messageCloseIcon: {
    color: '#fff',
    fontSize: `${ui.iconSize} !important`,
    height: `${ui.iconSize} !important`,
    lineHeight: `${ui.iconSize} !important`,
    width: `${ui.iconSize} !important`
  }
});

export default withStyles(styleThunk)(OutcomeCardMessage);
