import React, {PropTypes} from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {makePlaceholderStyles} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import withHotkey from 'react-hotkey-hoc';
import FontAwesome from 'react-fontawesome';

const defaultColor = appTheme.palette.dark;
const iconStyle = {
  color: defaultColor,
  display: 'block',
  height: ui.fontSize,
  left: '2.5rem',
  lineHeight: ui.fontSize,
  position: 'absolute',
  top: '.8125rem',
  width: ui.fontSize,
  zIndex: 100
};

const stopHotKeyCallbackMw = (e, event, combo, next) => {
  if (!(e.key === 'Escape' || e.key === '+')) {
    /*
     * Don't allow any other hotkey events to process
     * *except* for Escape and '+'.
     */
    return true;
  }
  return next();
};

const AgendaInputField = (props) => {
  const {addHotkeyStopMw, removeHotkeyStopMw, bindHotkey, styles} = props;
  let inputRef;
  const setRef = (c) => {
    inputRef = c;
  };
  const focusOnInput = (e) => {
    e.preventDefault();
    inputRef.focus();
  };
  const blurInput = (e) => {
    e.preventDefault();
    inputRef.blur();
  };
  bindHotkey('+', focusOnInput);
  bindHotkey('esc', blurInput);
  return (
    <div className={css(styles.root)}>
      <input
        {...props.input}
        autoCapitalize="off"
        autoComplete="off"
        className={`${css(styles.input)} mousetrap`}
        onBlur={() => removeHotkeyStopMw(stopHotKeyCallbackMw)}
        onFocus={() => addHotkeyStopMw(stopHotKeyCallbackMw)}
        placeholder="Add Agenda Item"
        ref={setRef}
        title="Add Agenda Item"
        type="text"
      />
      <FontAwesome name="plus-circle" style={iconStyle} />
    </div>
  );
};

AgendaInputField.propTypes = {
  bindHotkey: PropTypes.func,
  addHotkeyStopMw: PropTypes.func,
  removeHotkeyStopMw: PropTypes.func,
  input: PropTypes.object,
  styles: PropTypes.object
};

const inputPlaceholderStyles = makePlaceholderStyles(defaultColor);
const inputFocusActivePlaceholderStyles = makePlaceholderStyles(appTheme.palette.dark50l);
const inputFocusActive = {
  backgroundColor: appTheme.palette.light,
  ...inputFocusActivePlaceholderStyles
};


const styleThunk = () => ({
  root: {
    position: 'relative'
  },

  input: {
    backgroundColor: 'transparent',
    border: 0,
    boxShadow: 'none',
    color: appTheme.palette.dark10d,
    display: 'block',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    lineHeight: '1.5rem',
    margin: 0,
    outline: 'none',
    padding: '.5rem 2.5rem .5rem 3rem',
    position: 'relative',
    textIndent: '1rem',
    width: '100%',
    zIndex: 200,

    ...inputPlaceholderStyles,

    ':focus': {
      ...inputFocusActive
    },
    ':active': {
      ...inputFocusActive
    }
  }
});

export default withHotkey(withStyles(styleThunk)(AgendaInputField));
