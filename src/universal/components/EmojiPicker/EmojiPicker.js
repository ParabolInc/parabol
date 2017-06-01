import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import portal from 'react-portal-hoc';
import MentionEmoji from 'universal/components/MentionEmoji/MentionEmoji';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const EmojiPicker = (props) => {
  const {
    suggestions, active, left, top, selectItem = () => {
    }, styles
  } = props;
  const menuStyle = {
    left,
    top,
    position: 'absolute'
  };
  console.log('opening picker', props.isClosing)
  return (
    <div style={menuStyle} className={css(styles.mentionMenu)}>
      {suggestions.map((option, idx) => {
        return (
          <div key={idx} onClick={selectItem(idx)}>
            <MentionEmoji active={active === idx} {...option}/>
          </div>
        )
      })}
    </div>
  )
};


const styleThunk = () => ({
  mentionMenu: {
    background: '#fff',
    border: `1px solid ${ui.cardBorderCoor}`,
    borderRadius: ui.borderRadiusSmall,
    boxShadow: ui.menuBoxShadow,
    color: ui.palette.dark,
    padding: ui.borderRadiusSmall,
    zIndex: 1
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
portal({})(
  withStyles(styleThunk)(EmojiPicker)
);