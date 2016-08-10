import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import Field from 'universal/components/Field/Field';
import {reduxForm} from 'redux-form';

const AgendaInput = (props) => {
  const {styles} = AgendaInput;
  return (
    <div className={styles.root}>
      <Field
        hasShortcutHint
        name="agendaItemInput"
        placeholder="Add an item..."
        type="text"
      />
    </div>
  );
};

AgendaInput.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});
const reduxFormOptions = {form: 'agendaInput'};
export default reduxForm(reduxFormOptions)(look(AgendaInput));
