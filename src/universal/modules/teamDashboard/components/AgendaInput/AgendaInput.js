import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import {reduxForm, Field} from 'redux-form';
import AgendaInputField from './AgendaInputField';
import Avatar from 'universal/components/Avatar/Avatar';
import appTheme from 'universal/styles/theme/appTheme';
import shortid from 'shortid';
import getNextSortOrder from 'universal/utils/getNextSortOrder';
import {cashay} from 'cashay';

const AgendaInput = (props) => {
  const {styles} = AgendaInput;
  const {agenda, handleSubmit, teamId, myTeamMember} = props;
  const handleAgendaItemSubmit = (submittedData) => {
    // TODO replace this with redux-form synchronous validation
    const content = submittedData.agendaItem;
    if (!content) return;
    const options = {
      variables: {
        newAgendaItem: {
          id: `${teamId}::${shortid.generate()}`,
          content,
          sortOrder: getNextSortOrder(agenda, 'sortOrder'),
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

AgendaInput.const styleThunk = () => ({
  root: {
    backgroundColor: 'transparent',
    color: appTheme.palette.cool,
    fontSize: appTheme.typography.s3,
    position: 'relative',
    width: '100%',
    zIndex: 100,

    ':hover': {
      backgroundColor: appTheme.palette.dark20l
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
export default reduxForm(reduxFormOptions)(withStyles(styleThunk)(AgendaInput));
