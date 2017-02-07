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

const validate = (values, props) => {
  const {isNewOrg} = props;
  const schema = isNewOrg ? addOrgSchema() : makeAddTeamSchema();
  return schema(values).errors;
};

const NewTeamForm = (props) => {
  const {change, dispatch, handleSubmit, isNewOrg, organizations, styles} = props;
  const handleCreateNew = () => {
    change('orgId', null);
  };
  const addBilling = <Button colorPalette="cool" isBlock label="Add Billing Information"/>;
  const setToken = (stripeToken) => {
    change('stripeToken', stripeToken);
  };
  const resetOrgSelection = () => {
    change('orgId', organizations[0].id);
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
            <div className={css(styles.billingBlock)}>
              <h3 className={css(styles.billingHeading)}>Billing information (required)</h3>
              <p className={css(styles.billingCopy)}>
                Your card will be charged $5 for the first month.
                The members that you invite will be prorated on their
                join date and added to your second invoice.
                <div className={css(styles.billingButtonBlock)}>
                  <CreditCardModal
                    handleToken={setToken}
                    toggle={addBilling}
                  />
                </div>
              </p>
              <div className={css(styles.billingCancelLink)} onClick={resetOrgSelection}>
                Nevermind, select an existing organization
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

  billingBlock: {
    border: `1px solid ${appTheme.palette.mid30l}`,
    background: appTheme.palette.light50l,
    boxShadow: '0 1px 2px rgba(0, 0, 0, .2)',
    color: appTheme.palette.dark50d,
    margin: '1rem 0',
    padding: '.75rem .75rem 1rem'
  },

  billingHeading: {
    fontSize: appTheme.typography.sBase,
    fontWeight: 700,
    margin: '0 0 .125rem'
  },

  billingCopy: {
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.s4,
  },

  billingButtonBlock: {
    marginTop: '1rem'
  },

  billingCancelLink: {
    cursor: 'pointer',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    textAlign: 'center',
    textDecoration: 'underline',
    transition: `opacity ${ui.transitionFastest}`,

    ':hover': {
      opacity: '.5'
    }
  }
});

export default reduxForm({form: 'newTeam', validate})(withStyles(styleThunk)(NewTeamForm));
