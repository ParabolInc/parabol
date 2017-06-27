import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import portal from 'react-portal-hoc';
import MentionEmoji from 'universal/components/MentionEmoji/MentionEmoji';
import MentionTag from 'universal/components/MentionTag/MentionTag';
import MentionUser from 'universal/components/MentionUser/MentionUser';
import boundedModal from 'universal/decorators/boundedModal/boundedModal';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import PropTypes from 'prop-types';

const dontTellDraft = (e) => {
  e.preventDefault();
};

const suggestionTypes = {
  emoji: MentionEmoji,
  tag: MentionTag,
  mention: MentionUser
};

const EditorSuggestions = (props) => {
  const {
    active,
    handleSelect,
    isClosing,
    left,
    setRef,
    styles,
    suggestions,
    suggestionType,
    top
  } = props;

  const SuggestionItem = suggestionTypes[suggestionType];

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
    <div style={menuStyle} className={menuStyles} ref={setRef}>
      {suggestions.map((suggestion, idx) => {
        return (
          // eslint-disable-next-line
          <div key={idx} onMouseDown={dontTellDraft} onClick={handleSelect(idx)}>
            <SuggestionItem active={active === idx} {...suggestion} />
          </div>
        );
      })}
    </div>
  );
};

EditorSuggestions.propTypes = {
  active: PropTypes.number,
  handleSelect: PropTypes.func.isRequired,
  isClosing: PropTypes.bool,
  left: PropTypes.number,
  setRef: PropTypes.func,
  styles: PropTypes.object,
  suggestions: PropTypes.array,
  suggestionType: PropTypes.string,
  top: PropTypes.number
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
    animationDuration: '200ms',
    animationName: animateIn,
    background: '#fff',
    borderRadius: ui.menuBorderRadius,
    boxShadow: ui.menuBoxShadow,
    color: ui.palette.dark,
    padding: `${ui.menuGutterVertical} 0`,
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

export default portal({closeAfter: 100})(
  boundedModal(withStyles(styleThunk)(EditorSuggestions))
);
