import React, {PropTypes} from 'react';
import appTheme from 'universal/styles/theme';
import look, {StyleSheet} from 'react-look';

const AgendaInputField = (field) => {
  const {styles} = AgendaInputField;
  return (
    <div>
      <input className={styles.input} {...field.input} type="text"/>
    </div>
  );
};

AgendaInputField.propTypes = {
  input: PropTypes.object
};

AgendaInputField.styles = StyleSheet.create({
  input: {
    border: 0,
    borderBottom: `1px dashed ${appTheme.palette.dark50l}`,
    boxShadow: 'none',
    fontSize: appTheme.typography.s4,
    fontWeight: 700,
    lineHeight: 1.5,
    margin: '0 0 .5rem',
    padding: '.125rem .5rem',
    width: '100%',

    '::placeholder': {
      color: appTheme.palette.dark50l
    },

    // NOTE: :focus, :active have same styles
    ':focus': {
      borderStyle: 'solid',
      outline: 'none'
    },
    ':active': {
      borderStyle: 'solid',
      outline: 'none'
    }
  },
});

export default look(AgendaInputField);
