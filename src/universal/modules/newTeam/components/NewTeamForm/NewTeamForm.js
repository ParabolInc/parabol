import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import InputField from 'universal/components/InputField/InputField';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import {Field, reduxForm} from 'redux-form';
import DropdownInput from 'universal/modules/dropdown/components/DropdownInput/DropdownInput';
import makeAddTeamSchema from 'universal/validation/makeAddTeamSchema';
import addOrgSchema from 'universal/validation/addOrgSchema';
import CreditCardModal from 'universal/modules/userDashboard/components/CreditCardModal/CreditCardModal';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import {withRouter} from 'react-router';
import shouldValidate from 'universal/validation/shouldValidate';

const validate = (values, props) => {
  const {isNewOrg} = props;
  const schema = isNewOrg ? addOrgSchema() : makeAddTeamSchema();
  // const {errors} = schema(values);
  // if (Object.keys(errors).length ===1 && errors[])
  return schema(values).errors;
};

const NewTeamForm = (props) => {
  const {change, dispatch, handleSubmit, isNewOrg, organizations, router, styles, untouch} = props;
  const handleCreateNew = () => {
    router.push('/newteam/1');
  };
  const addBilling = <Button colorPalette="cool" label="Add Billing Information"/>;
  const setToken = (stripeToken) => {
    change('stripeToken', stripeToken);
  };
  const resetOrgSelection = () => {
    // untouch('orgName');
    router.push('/newteam');
    // change('orgId', organizations[0].id);
  };
  return (
    <form className={css(styles.form)} onSubmit={handleSubmit}>
      <h1 className={css(styles.heading)}>Create a New Team</h1>
      {isNewOrg ?
        <div className={css(styles.formBlock)}>
          <Field
            autoFocus
            colorPalette="gray"
            component={InputField}
            label="Organization Name (required)"
            name="orgName"
            placeholder={randomPlaceholderTheme.orgName}
          />
          <Field
            component="input"
            type="hidden"
            name="stripeToken"
          />
          <FieldBlock>
            <div className={css(styles.addBillingBlock)}>
              <div className={css(styles.addBillingBody)}>
                <h3>Billing information (required)</h3>
                <span>
              Your card will be charged $5 for the first month.
              The members that you invite will be prorated on their
              join date and added to your second invoice.
                <CreditCardModal
                  handleToken={setToken}
                  toggle={addBilling}
                />
            </span>
                <div className={css(styles.nevermind)} onClick={resetOrgSelection}>
                  Nevermind, select an existing organization
                </div>
              </div>
            </div>
          </FieldBlock>
        </div>
        :
        <div className={css(styles.formBlock)}>
          <Field
            colorPalette="gray"
            component={DropdownInput}
            handleCreateNew={handleCreateNew}
            label="Add Team to..."
            name="orgId"
            organizations={organizations}
          />
        </div>
      }
      <div className={css(styles.formBlock)}>
        <Field
          colorPalette="gray"
          component={InputField}
          label="Team Name (required)"
          name="teamName"
          placeholder={randomPlaceholderTheme.teamName}
        />
      </div>
      <div className={css(styles.formBlock)}>
        <Field
          colorPalette="gray"
          component={InputField}
          name="inviteesRaw"
          label="Invite Team Members (optional)"
          placeholder={randomPlaceholderTheme.emailMulti}
          useTextarea
        />
      </div>
      <Button
        colorPalette="warm"
        isBlock
        label="Create Team"
        size="small"
        type="submit"
      />
    </form>
  );
};

NewTeamForm.propTypes = {
  styles: PropTypes.object
};

const styleThunk = () => ({
  addBillingBlock: {
    border: `1px solid ${appTheme.palette.mid}`,
    background: appTheme.palette.light,
    margin: '1rem 0'
  },

  addBillingBody: {
    margin: '1rem'
  },

  form: {
    margin: 0,
    maxWidth: '24rem',
    padding: '2rem'
  },

  heading: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s6,
    fontWeight: 400,
    lineHeight: '2rem',
    margin: '0 auto 1.5rem',
    padding: `0 ${ui.fieldPaddingHorizontal}`
  },

  formBlock: {
    margin: '0 auto 1.5rem'
  },

  nevermind: {
    cursor: 'pointer',
    fontSize: appTheme.typography.s3
  }
});

export default reduxForm({form: 'newTeam', shouldValidate, validate})(withRouter(withStyles(styleThunk)(NewTeamForm)));
