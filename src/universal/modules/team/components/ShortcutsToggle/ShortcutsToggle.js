import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import t from 'universal/styles/theme';
import {srOnly} from 'universal/styles/helpers';

let s = {};

const ShortcutsToggle = (props) => {
  const handleClick = (e) => {
    e.preventDefault();
    props.onClick();
  };

  return (
    <a className={s.root} href="#" onClick={(e) => handleClick(e)} title="Show shortcuts">
      <FontAwesome name="keyboard-o" />
      &nbsp;
      <FontAwesome name="question-circle" />
      <span className={s.srOnly}>Show shortcuts</span>
    </a>
  );
};

const hoverFocus = {
  backgroundColor: t.palette.dark30l,
  color: t.palette.dark10d,
  textDecoration: 'none'
};

ShortcutsToggle.propTypes = {
  onClick: PropTypes.func
};

s = StyleSheet.create({
  root: {
    backgroundColor: t.palette.dark10l,
    borderRadius: '4em',
    bottom: '2rem',
    color: t.palette.dark50d,
    fontSize: t.typography.s3,
    display: 'inline-block',
    padding: '.25rem .75rem',
    position: 'fixed',
    right: '2rem',

    ':hover': {
      ...hoverFocus
    },
    ':focus': {
      ...hoverFocus
    }
  },

  srOnly: {
    ...srOnly
  }
});

export default look(ShortcutsToggle);
