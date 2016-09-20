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
  const lastAgendaItem = agenda[agenda.length - 1];
  const nextSort = lastAgendaItem ? lastAgendaItem.sortOrder + SORT_STEP : 0;
  const handleAgendaItemSubmit = (submittedData) => {
    // TODO replace this with redux-form synchronous validation
    const content = submittedData.agendaItem;
    if (!content) return;
    const options = {
      variables: {
        newAgendaItem: {
          id: `${teamId}::${shortid.generate()}`,
          content,
          sortOrder: nextSort,
          teamMemberId: myTeamMember.id
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
      <div className={styles.author}>
        <Avatar hasBadge={false} picture={myTeamMember.picture} size="smallest"/>
      </div>
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
    backgroundColor: 'transparent',
    color: theme.palette.cool,
    fontSize: theme.typography.s3,
    position: 'relative',
    width: '100%',
    zIndex: 100,

    ':hover': {
      backgroundColor: theme.palette.dark20l
    }
  },

  author: {
    position: 'absolute',
    right: '.5rem',
    top: '.5rem',
    zIndex: 200
  }
});

const reduxFormOptions = {form: 'agendaInput'};
export default reduxForm(reduxFormOptions)(look(AgendaInput));
