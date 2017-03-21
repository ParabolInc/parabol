import React, {PropTypes} from 'react';
import FontAwesome from 'react-fontawesome';
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
import CreditCardModalContainer from 'universal/modules/userDashboard/containers/CreditCardModal/CreditCardModalContainer';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import {withRouter} from 'react-router';
import shouldValidate from 'universal/validation/shouldValidate';
import {MONTHLY_PRICE} from 'universal/utils/constants';
import StripeTokenField from 'universal/modules/newTeam/components/NewTeamForm/StripeTokenField';
import TextAreaField from 'universal/components/TextAreaField/TextAreaField';

const validate = (values, props) => {
  const {isNewOrg} = props;
  const schema = isNewOrg ? addOrgSchema() : makeAddTeamSchema();
  return schema(values).errors;
};

const NewTeamForm = (props) => {
  const {
    change,
    handleSubmit,
    last4,
    isNewOrg,
    organizations,
    router,
    setLast4,
    styles
  } = props;

  const setToken = (stripeToken, myLast4) => {
    setLast4(myLast4);
    change('stripeToken', stripeToken);
  };

  const handleCreateNew = () => {
    router.push('/newteam/1');
  };
  const addBilling = <Button colorPalette="cool" isBlock label="Add Billing Information" size="small" />;
  const resetOrgSelection = () => {
    router.push('/newteam');
  };
  return (
    <form className={css(styles.form)} onSubmit={handleSubmit}>
      <h1 className={css(styles.heading)}>Create a New Team</h1>
      {isNewOrg ?
        <div className={css(styles.formBlock)}>
          <Field
            colorPalette="gray"
            component={InputField}
            label="Organization Name"
            name="orgName"
            placeholder={randomPlaceholderTheme.orgName}
          />
          <FieldBlock>
            <div className={css(styles.billingBlock)}>
              <h3 className={css(styles.billingHeading)}>Billing information (required)</h3>
              <div className={css(styles.billingCopy)}>
                Your card will be charged ${MONTHLY_PRICE} for the first month.
                The members that you invite will be prorated on their
                join date and added to your second invoice.
              </div>
              <Field
                component={StripeTokenField}
                name="stripeToken"
              />
              {last4 === undefined ?
                <div className={css(styles.billingButtonBlock)}>
                  <CreditCardModalContainer
                    handleToken={setToken}
                    toggle={addBilling}
                  />
                  <div className={css(styles.cancelNewOrgButtonBlock)}>
                    <Button
                      colorPalette="dark"
                      isBlock
                      label="Nevermind, select an existing organization"
                      onClick={resetOrgSelection}
                      size="smallest"
                      buttonStyle="flat"
                    />
                  </div>
                </div> :
                <div className={css(styles.cardInfoBlock)}>
                  <div className={css(styles.fill)}>
                    <FontAwesome name="credit-card" />
                    <div className={css(styles.cardInfoLabel)}>Info added for <b>{last4}</b></div>
                  </div>
                  <CreditCardModalContainer
                    isUpdate
                    handleToken={setToken}
                    toggle={<Button colorPalette="cool" label="Update" size="smallest" buttonStyle="flat" />}
                  />

                </div>
              }
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
          label="Team Name"
          name="teamName"
          placeholder={randomPlaceholderTheme.teamName}
        />
      </div>
      <div className={css(styles.formBlock)}>
        <Field
          component={TextAreaField}
          name="inviteesRaw"
          label="Invite Team Members (optional)"
          placeholder={randomPlaceholderTheme.emailMulti}
        />
      </div>
      <Button
        colorPalette="warm"
        isBlock
        label="Create Team"
        size="medium"
        type="submit"
      />
    </form>
  );
};

NewTeamForm.propTypes = {
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  last4: PropTypes.string,
  isNewOrg: PropTypes.bool,
  organizations: PropTypes.array,
  router: PropTypes.object.isRequired,
  setLast4: PropTypes.func.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  form: {
    margin: 0,
    maxWidth: '25rem',
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
    padding: '.75rem .75rem .5rem'
  },

  billingHeading: {
    fontSize: appTheme.typography.sBase,
    fontWeight: 700,
    margin: '0 0 .125rem'
  },

  billingCopy: {
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.s4
  },

  billingButtonBlock: {
    margin: '1rem 0 0'
  },

  cancelNewOrgButtonBlock: {
    paddingTop: '.5rem'
  },

  cardInfoBlock: {
    alignItems: 'center',
    backgroundColor: '#fff',
    border: `.0625rem solid ${appTheme.palette.mid30l}`,
    borderRadius: ui.borderRadiusSmall,
    color: appTheme.palette.dark,
    display: 'flex',
    fontSize: appTheme.typography.s3,
    margin: '1rem 0 .25rem',
    paddingLeft: '.75rem'
  },

  fill: {
    alignItems: 'center',
    display: 'flex',
    flex: 1
  },

  cardInfoLabel: {
    marginLeft: '.5rem'
  }
});

export default reduxForm({form: 'newTeam', shouldValidate, validate})(withRouter(withStyles(styleThunk)(NewTeamForm)));
