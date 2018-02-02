import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';
import {css} from 'aphrodite-local-styles/no-important';
import {reduxForm, Field} from 'redux-form';
import AgendaInputField from './AgendaInputField';

const AgendaInput = (props) => {
  const {afterSubmitAgendaItem, agenda, disabled, handleSubmit, setAgendaInputRef, team, styles} = props;
  return (
    <div className={css(styles.agendaInputBlock)}>
      <Field
        agenda={agenda}
        name="agendaItem"
        component={AgendaInputField}
        disabled={disabled}
        handleSubmit={handleSubmit}
        afterSubmitAgendaItem={afterSubmitAgendaItem}
        setAgendaInputRef={setAgendaInputRef}
        team={team}
      />
    </div>
  );
};

AgendaInput.propTypes = {
  agenda: PropTypes.array,
  disabled: PropTypes.bool,
  handleSubmit: PropTypes.func,
  afterSubmitAgendaItem: PropTypes.func.isRequired,
  setAgendaInputRef: PropTypes.func,
  styles: PropTypes.object,
  team: PropTypes.object.isRequired
};

const styleThunk = () => ({
  agendaInputBlock: {
    padding: `${ui.meetingSidebarGutter} 0`,
    position: 'relative'
  }
});

/*
 * This form's redux data is automatically cleared after it is
 * submitted.
 *
 * See: universal/redux/makeReducer.js
 */
export default reduxForm({form: 'agendaInput'})(
  withStyles(styleThunk)(AgendaInput)
);
