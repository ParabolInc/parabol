import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {reduxForm, Field} from 'redux-form';
import AgendaInputField from './AgendaInputField';
import Avatar from 'universal/components/Avatar/Avatar';
import theme from 'universal/styles/theme';

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
      <Avatar hasBadge={false} picture={membership.picture} size="smallest"/>
    </form>
  );
};

AgendaInput.propTypes = {
  handleAgendaItemSubmit: PropTypes.func,
  handleSubmit: PropTypes.func,
  teamMemberId: PropTypes.string,
  teamMembers: PropTypes.array
};
AgendaInput.styles = StyleSheet.create({
  root: {
    backgroundColor: theme.palette.light,
    color: theme.palette.cool,
    fontSize: theme.typography.s3,
    padding: '.5rem .5rem .5rem 0',
    position: 'relative',
    width: '100%',
    display: 'flex'
  },
});
const reduxFormOptions = {form: 'agendaInput'};
export default reduxForm(reduxFormOptions)(look(AgendaInput));
