import React, {PropTypes} from 'react';
import InputField from 'universal/components/InputField/InputField';
import {Field, reduxForm, arrayPush, change} from 'redux-form';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import makeStep3RawSchema from 'universal/validation/makeStep3RawSchema';


const validate = (values, props) => {
  const schema = makeStep3RawSchema();
  return schema(values).errors;
};

const Step3RawInvitees = (props) => {
  const {doFocus, inviteesRaw} = props;

  const onAddInviteesButtonClick = event => {
    event.preventDefault();
    const {dispatch, inviteesRaw} = props;
    const parsedAddresses = emailAddresses.parseAddressList(inviteesRaw);
    // clear the inviteesRaw form component:
    dispatch(change('welcomeWizard', 'inviteesRaw', ''));
    if (!parsedAddresses) {
      return;
    }
    parsedAddresses.forEach(email => {
      dispatch(arrayPush('welcomeWizard', 'invitees', {
        email: email.address,
        fullName: email.name,
        label: email.name ? `"${email.name}" <${email.address}>` : email.address
      }));
    });
  };
  return (
    <div style={{margin: '0 auto', width: '30rem'}}>
      <Field
        autoFocus={doFocus}
        buttonDisabled={!inviteesRaw}
        buttonIcon="check-circle"
        component={InputField}
        hasButton
        isLarger
        isWider
        name="inviteesRaw"
        onButtonClick={onAddInviteesButtonClick}
        placeholder={randomPlaceholderTheme.emailMulti}
        type="text"
      />
    </div>
  );
}

export default reduxForm({
  form: 'welcomeWizard',
  destroyOnUnmount: false,
  validate
})(Step3RawInvitees);
