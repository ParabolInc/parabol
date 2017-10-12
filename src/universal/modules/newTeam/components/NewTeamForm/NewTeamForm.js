import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import Radio from 'universal/components/Radio/Radio';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import InputField from 'universal/components/InputField/InputField';
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder';
import {Field, reduxForm} from 'redux-form';
import DropdownInput from 'universal/modules/dropdown/components/DropdownInput/DropdownInput';
import makeAddTeamSchema from 'universal/validation/makeAddTeamSchema';
import addOrgSchema from 'universal/validation/addOrgSchema';
import TextAreaField from 'universal/components/TextAreaField/TextAreaField';

const validate = (values, props) => {
  const {isNewOrg} = props;
  const schema = isNewOrg ? addOrgSchema() : makeAddTeamSchema();
  return schema(values).errors;
};

const NewTeamForm = (props) => {
  const {
    handleSubmit,
    isNewOrg,
    organizations,
    history,
    styles
  } = props;

  const handleCreateNew = () => {
    history.push('/newteam/1');
  };
  const resetOrgSelection = () => {
    history.push('/newteam');
  };

  // TODO: yank these, cheating lint
  console.log(handleCreateNew);
  console.log(resetOrgSelection);

  const radioStyles = {
    color: ui.palette.dark
  };
  const controlSize = 'medium';
  const reallyIsNewOrg = false || isNewOrg; // Just faking ;)
  const showHelpBox = true; // Just an easy way to hide in the future
  return (
    <div className={css(styles.layout)}>
      <form className={css(styles.form)} onSubmit={handleSubmit}>
        <Panel label="Create a New Team">
          <div className={css(styles.formInner)}>
            <div className={css(styles.formBlock)}>
              <FieldLabel
                fieldSize={controlSize}
                indent
                label="Add Team to…"
              />
            </div>
            <div className={css(styles.formBlock)}>
              <Radio
                customStyles={radioStyles}
                fieldSize={controlSize}
                indent
                inline
                label="an existing organization:"
                group="orgRadioGroup"
              />
              <div className={css(styles.fieldBlock)}>
                <Field
                  colorPalette="gray"
                  component={DropdownInput}
                  disabled={reallyIsNewOrg}
                  fieldSize={controlSize}
                  handleCreateNew={handleCreateNew}
                  name="orgId"
                  organizations={organizations}
                />
              </div>
            </div>
            <div className={css(styles.formBlock)}>
              <Radio
                customStyles={radioStyles}
                fieldSize={controlSize}
                indent
                inline
                label="a new organization:"
                group="orgRadioGroup"
              />
              <div className={css(styles.fieldBlock)}>
                <Field
                  colorPalette="gray"
                  component={InputField}
                  disabled={!reallyIsNewOrg}
                  fieldSize={controlSize}
                  name="orgName"
                  placeholder={randomPlaceholderTheme.orgName}
                />
              </div>
            </div>
            <div className={css(styles.formBlock, styles.formBlockInline)}>
              <FieldLabel
                fieldSize={controlSize}
                htmlFor="teamName"
                indent
                inline
                label="Team Name"
              />
              <div className={css(styles.fieldBlock)}>
                <Field
                  colorPalette="gray"
                  component={InputField}
                  fieldSize={controlSize}
                  name="teamName"
                  placeholder={randomPlaceholderTheme.teamName}
                />
              </div>
            </div>
            <div className={css(styles.textAreaBlock)}>
              <Field
                component={TextAreaField}
                fieldSize={controlSize}
                name="inviteesRaw"
                label="Invite Team Members (optional)"
                placeholder={randomPlaceholderTheme.emailMulti}
              />
            </div>
            <div className={css(styles.buttonBlock)}>
              <Button
                buttonSize="large"
                colorPalette="warm"
                depth={1}
                isBlock
                label="Create Team"
                type="submit"
              />
            </div>
          </div>
        </Panel>
      </form>
      {showHelpBox &&
        <div className={css(styles.helpLayout)}>
          <div className={css(styles.helpBlock)}>
            <div className={css(styles.helpHeading)}>
              {'What’s an Organization?'}
            </div>
            <div className={css(styles.helpCopy)}>
              {`Every Team belongs to an Organization.
                New Organizations start out on the `}
              <b>{'Free Personal Plan'}</b>{'.'}
            </div>
            <Button
              buttonSize="small"
              buttonStyle="flat"
              colorPalette="cool"
              icon="external-link-square"
              iconPlacement="right"
              label="Learn More"
              onClick={() => console.log('TODO: Link to Pricing Page')}
            />
          </div>
        </div>
      }
    </div>
  );
};

NewTeamForm.propTypes = {
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isNewOrg: PropTypes.bool,
  organizations: PropTypes.array,
  history: PropTypes.object.isRequired,
  setLast4: PropTypes.func.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  layout: {
    display: 'flex',
    width: '100%'
  },

  form: {
    margin: 0,
    maxWidth: '40rem',
    padding: '.5rem 2rem',
    width: '100%'
  },

  formInner: {
    borderTop: `.0625rem solid ${ui.panelBorderColor}`,
    padding: '2rem'
  },

  formBlock: {
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'space-between',
    margin: '0 auto 1rem',
    width: '100%'
  },

  formBlockInline: {
    marginTop: '3rem'
  },

  fieldBlock: {
    width: '16rem'
  },

  textAreaBlock: {
    margin: '2rem auto'
  },

  buttonBlock: {
    margin: '0 auto',
    width: '16rem'
  },

  helpLayout: {
    paddingTop: '6.75rem'
  },

  helpBlock: {
    background: appTheme.palette.light50l,
    boxShadow: ui.shadow[0],
    color: appTheme.palette.dark,
    margin: '1rem 0',
    padding: '.75rem',
    textAlign: 'center',
    width: '16rem'
  },

  helpHeading: {
    fontSize: appTheme.typography.s4,
    fontWeight: 700,
    margin: 0
  },

  helpCopy: {
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.s4,
    margin: '.5rem 0'
  }
});

export default reduxForm({form: 'newTeam', validate})(
  withStyles(styleThunk)(
    NewTeamForm)
);
