import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {reduxForm, Field} from 'redux-form';
import AgendaInputField from './AgendaInputField';
import Avatar from 'universal/components/Avatar/Avatar';
import theme from 'universal/styles/theme';
import shortid from 'shortid';
import {SORT_STEP} from 'universal/utils/constants';
import {cashay} from 'cashay';

const AgendaInput = (props) => {
  const {styles} = AgendaInput;
  const {agenda, handleSubmit, teamId, myTeamMember} = props;
  const [userId] = myTeamMember.id.split('::');
  const myTeamMemberId = `${userId}::${teamId}`;
  const lastAgendaItem = agenda[agenda.length - 1];
  const nextSort = lastAgendaItem ? lastAgendaItem.sortOrder + SORT_STEP : 0;
  const handleAgendaItemSubmit = (submittedData) => {
    const options = {
      variables: {
        newAgendaItem: {
          id: `${teamId}::${shortid.generate()}`,
          content: submittedData.agendaItem,
          sortOrder: nextSort,
          teamMemberId: myTeamMemberId
        }
      }
    };
    cashay.mutate('createAgendaItem', options);
  };
  return (
    <form className={styles.root} onSubmit={handleSubmit(handleAgendaItemSubmit)}>
      <Field
        name="agendaItem"
        component={AgendaInputField}
      />
      <Avatar hasBadge={false} picture={myTeamMember.picture} size="smallest"/>
    </form>
  );
};

AgendaInput.propTypes = {
  agenda: PropTypes.array,
  handleSubmit: PropTypes.func,
  teamId: PropTypes.string,
  myTeamMember: PropTypes.object,
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
