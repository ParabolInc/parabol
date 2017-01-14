import React, {PropTypes} from 'react';
import InputField from 'universal/components/InputField/InputField';
import {Field, reduxForm, arrayPush, change} from 'redux-form';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import makeStep3RawSchema from 'universal/validation/makeStep3RawSchema';
import emailAddresses from 'email-addresses';
import {updateExistingInvites} from 'universal/modules/welcome/ducks/welcomeDuck';

const validate = (values) => {
  const schema = makeStep3RawSchema();
  return schema(values).errors;
};

const Step3RawInvitees = (props) => {
  const {dispatch, handleSubmit, invitees = [], inviteesRaw, untouch} = props;

  const onAddInviteesButtonClick = () => {
    const parsedAddresses = emailAddresses.parseAddressList(inviteesRaw);
    // clear the inviteesRaw form component:
    dispatch(change('welcomeWizardRawInvitees', 'inviteesRaw', ''));
    if (!parsedAddresses) {
      return;
    }
    const uniqueEmails = new Set();
    const distinctParsedAddresses = parsedAddresses.reduce((set, email) => {
      if (!uniqueEmails.has(email.address)) {
        uniqueEmails.add(email.address);
        set.push(email);
      }
      return set;
    }, []);
    const inviteeEmails = invitees.map((i) => i.email);
    const existingInvites = [];
    distinctParsedAddresses
      .forEach((email, idx) => {
        if (inviteeEmails.includes(email.address)) {
          // highlight that email then fade
          existingInvites.push(idx);
        } else {
          dispatch(arrayPush('welcomeWizard', 'invitees', {
            email: email.address,
            fullName: email.name,
            label: email.name ? `"${email.name}" <${email.address}>` : email.address
          }));
        }
      });
    if (existingInvites.length) {
      dispatch(updateExistingInvites(existingInvites));
    }
    untouch('inviteesRaw');
  };
  return (
    <div style={{margin: '0 auto', width: '30rem'}}>
      <Field
        autoFocus={!invitees || invitees.length === 0}
        buttonDisabled={!inviteesRaw}
        buttonIcon="check-circle"
        component={InputField}
        hasButton
        isLarger
        isWider
        name="inviteesRaw"
        onButtonClick={handleSubmit(onAddInviteesButtonClick)}
        placeholder={randomPlaceholderTheme.emailMulti}
        type="text"
      />
    </div>
  );
};

Step3RawInvitees.propTypes = {
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  invitees: PropTypes.array,
  inviteesRaw: PropTypes.string,
  untouch: PropTypes.func.isRequired
};

export default reduxForm({
  form: 'welcomeWizardRawInvitees',
  validate
})(Step3RawInvitees);
