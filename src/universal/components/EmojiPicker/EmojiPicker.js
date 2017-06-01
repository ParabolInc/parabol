import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import portal from 'react-portal-hoc';
import MentionEmoji from 'universal/components/MentionEmoji/MentionEmoji';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const EmojiPicker = (props) => {
  const {
    isClosing, suggestions, active, left, top, handleItemClick, styles
  } = props;
  const menuStyle = {
    left,
    top,
    position: 'absolute'
  };
  const menuStyles = css(
    styles.mentionMenu,
    isClosing && styles.closing
  );

  return (
    <div style={menuStyle} className={menuStyles}>
      {suggestions.map((option, idx) => {
        return (
          <div key={idx} onMouseDown={handleItemClick(idx)}>
            <MentionEmoji active={active === idx} {...option}/>
          </div>
        )
      })}
    </div>
  )
};

const animateIn = {
  '0%': {
    opacity: '0',
    transform: 'translate3d(0, -32px, 0)'

  },
  '100%': {
    opacity: '1',
    transform: 'translate3d(0, 0, 0)'
  }
};

const animateOut = {
  '0%': {
    opacity: '1',
    transform: 'translate3d(0, 0, 0)'

  },
  '100%': {
    opacity: '0',
    transform: 'translate3d(0, -32px, 0)'
  }
};

const styleThunk = (theme, props) => ({
  closing: {
    animationDuration: `${props.closeAfter}ms`,
    animationName: animateOut
  },

  mentionMenu: {
    background: '#fff',
    border: `1px solid ${ui.cardBorderCoor}`,
    borderRadius: ui.borderRadiusSmall,
    boxShadow: ui.menuBoxShadow,
    color: ui.palette.dark,
    padding: ui.borderRadiusSmall,
    zIndex: 1,
    animationName: animateIn,
    animationDuration: '200ms'
  },

  active: {
    backgroundColor: appTheme.palette.dark,
    color: '#fff'
  },

  description: {
    marginLeft: '.5rem'
  },

  row: {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    padding: '.5rem'
  },

  value: {
    fontWeight: 700
  }
});

export default
portal({closeAfter: 100})(
  withStyles(styleThunk)(EmojiPicker)
);