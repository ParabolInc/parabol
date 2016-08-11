import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {reduxForm, Field} from 'redux-form';
import AgendaInputField from './AgendaInputField';
import Avatar from 'universal/components/Avatar/Avatar';

const AgendaInput = (props) => {
  const {styles} = AgendaInput;
  const {handleAgendaItemSubmit, handleSubmit, teamMemberId, teamMembers} = props;
  const membership = teamMembers.find(m => m.id === teamMemberId) || {};
  return (
    <form className={styles.root} onSubmit={handleSubmit(handleAgendaItemSubmit)}>
      <Field
        name="agendaItem"
        component={AgendaInputField}
      />
      <Avatar picture={membership.picture}></Avatar>
    </form>
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
