import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React from 'react';
import portal from 'react-portal-hoc';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import Button from 'universal/components/Button/Button';
import {DashModal} from 'universal/components/Dashboard';
import TextAreaField from 'universal/components/TextAreaField/TextAreaField';
import Type from 'universal/components/Type/Type';
import formError from 'universal/styles/helpers/formError';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import rejectOrgApprovalValidation from './rejectOrgApprovalValidation';

const validate = (values) => {
  const schema = rejectOrgApprovalValidation();
  return schema(values).errors;
};

const RejectOrgApprovalModal = (props) => {
  const {
    closeAfter,
    closePortal,
    error,
    handleSubmit,
    isClosing,
    dbNotificationId,
    inviteeEmail,
    inviterName,
    submitting,
    styles
  } = props;
  const onSubmit = async (submissionData) => {
    const schema = rejectOrgApprovalValidation();
    const {data: {reason}} = schema(submissionData);
    const variables = {reason, dbNotificationId};
    const {error: anError} = await cashay.mutate('rejectOrgApproval', {variables});
    if (anError) throw new SubmissionError(anError);
    closePortal();
  };
  return (
    <DashModal closeAfter={closeAfter} closePortal={closePortal} isClosing={isClosing} onBackdropClick={closePortal}>
      <Type align="center" bold marginBottom=".5rem" scale="s6" colorPalette="mid">
        Care to say why?
      </Type>
      <Type align="center" marginBottom="1rem" scale="sBase" colorPalette="black">
        Type a response below and <br />we’ll pass it along to {inviterName}.
      </Type>
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && <div className={css(styles.error)}>{error}</div>}
        <Field
          component={TextAreaField}
          name="reason"
          placeholder="Comment"
        />
        <div className={css(styles.buttonBlock)}>
          <Button
            colorPalette="cool"
            isBlock
            label={`Reject ${inviteeEmail}`}
            size={ui.modalButtonSize}
            type="submit"
            onClick={handleSubmit(onSubmit)}
            waiting={submitting}
          />
        </div>
      </form>
    </DashModal>
  );
};

RejectOrgApprovalModal.propTypes = {
  closeAfter: PropTypes.number.isRequired,
  closePortal: PropTypes.func.isRequired,
  error: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  isClosing: PropTypes.bool,
  inviteeEmail: PropTypes.string,
  inviterName: PropTypes.string,
  dbNotificationId: PropTypes.string.isRequired,
  submitting: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  buttonBlock: {
    marginTop: '1rem'
  },

  error: formError
});

export default portal({escToClose: true, closeAfter: 100})(
  reduxForm({form: 'rejectOrgApproval', validate})(
    withStyles(styleThunk)(RejectOrgApprovalModal)
  )
);
