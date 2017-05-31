import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import portal from 'react-portal-hoc';
import MentionEmoji from 'universal/components/MentionEmoji/MentionEmoji';

const EmojiPicker = (props) => {
  const {} = props;
  const menuStyle = {
    ...style,
    left,
    top,
    position: 'absolute'
  };
  return (
    <div style={menuStyle} className={className}>
      {options.map((option, idx) => {
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

export default portal({clickToClose: true, escToClose: true})(
  withStyles(styleThunk)(EmojiPicker)
);