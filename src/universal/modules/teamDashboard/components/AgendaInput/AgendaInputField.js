import React, {PropTypes} from 'react';
import theme from 'universal/styles/theme';
import look, {StyleSheet} from 'react-look';
import {makePlaceholderStyles} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import withHotkey from 'react-hotkey-hoc';
import FontAwesome from 'react-fontawesome';

const iconStyle = {
  color: theme.palette.warm,
  display: 'block',
  height: ui.fontSize,
  left: '2.5rem',
  lineHeight: ui.fontSize,
  position: 'absolute',
  top: '.8125rem',
  width: ui.fontSize,
  zIndex: 100
};

const AgendaInputField = (props) => {
  const {styles} = AgendaInputField;
  const {bindHotkey} = props;
  let inputRef;
  const setRef = (c) => {
    inputRef = c;
  };
  const focusOnInput = (e) => {
    e.preventDefault();
    inputRef.focus();
  };
  bindHotkey('+', focusOnInput);
  return (
    <div className={styles.root}>
      <input
        {...props.input}
        autoCapitalize="off"
        autoComplete="off"
        className={styles.input}
        placeholder="Add an item"
        ref={setRef}
        title="Add agenda items here"
        type="text"
      />
      <FontAwesome name="plus-circle" style={iconStyle} />
    </div>
  );
};

const inputPlaceholderStyles = makePlaceholderStyles(theme.palette.warm);
const inputFocusActivePlaceholderStyles = makePlaceholderStyles(theme.palette.dark50l);

const inputFocusActive = {
  backgroundColor: theme.palette.light,
  ...inputFocusActivePlaceholderStyles
};

AgendaInputField.propTypes = {
  bindHotkey: PropTypes.func,
  input: PropTypes.object
};

AgendaInputField.styles = StyleSheet.create({
  root: {
    position: 'relative'
  },

  input: {
    backgroundColor: 'transparent',
    border: 0,
    boxShadow: 'none',
    color: theme.palette.dark10d,
    display: 'block',
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    lineHeight: '1.5rem',
    margin: 0,
    outline: 'none',
    // padding: '0 1rem 0 3rem',
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

export default withHotkey(look(AgendaInputField));
