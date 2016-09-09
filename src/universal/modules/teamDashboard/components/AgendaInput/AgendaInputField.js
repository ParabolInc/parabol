import React, {PropTypes} from 'react';
import theme from 'universal/styles/theme';
import look, {StyleSheet} from 'react-look';
import withHotkey from 'react-hotkey-hoc';

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
    <div>
      <input
        {...props.input}
        ref={setRef}
        className={styles.input}
        type="text"
        placeholder="Add an item"
        title="Add agenda items here"
      />
      <div className={styles.author}>Author name</div>
    </div>
  );
};

AgendaInputField.propTypes = {
  bindHotkey: PropTypes.func,
  input: PropTypes.object
};

AgendaInputField.styles = StyleSheet.create({
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
    margin: 0,
    outline: 'none',
    padding: '0 1rem 0 3rem',
    textIndent: '1rem',
    width: '100%',

    '::placeholder': {
      color: theme.palette.dark50l
    },
  },

  author: {
    display: 'none', // TODO: Show on focus/active
    fontWeight: 700,
    right: '.75rem',
    lineHeight: `${34 / 16}rem`,
    paddingTop: '1px',
    position: 'absolute',
    textAlign: 'right',
    top: 0
  }
});


export default withHotkey(look(AgendaInputField));
