import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {Field, reduxForm, SubmissionError} from 'redux-form'
import FieldLabel from 'universal/components/FieldLabel/FieldLabel'
import InputField from 'universal/components/InputField/InputField'
import Radio from 'universal/components/Radio/Radio'
import TextAreaField from 'universal/components/TextAreaField/TextAreaField'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import DropdownInput from 'universal/modules/dropdown/components/DropdownInput/DropdownInput'
import AddOrgMutation from 'universal/mutations/AddOrgMutation'
import AddTeamMutation from 'universal/mutations/AddTeamMutation'
import ui from 'universal/styles/ui'
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder'
import parseEmailAddressList from 'universal/utils/parseEmailAddressList'
import addOrgSchema from 'universal/validation/addOrgSchema'
import makeAddTeamSchema from 'universal/validation/makeAddTeamSchema'
import Panel from 'universal/components/Panel/Panel'
import PrimaryButton from 'universal/components/PrimaryButton'
import styled from 'react-emotion'

const radioStyles = {
  color: ui.palette.dark
}

const StyledForm = styled('form')({
  margin: 0,
  maxWidth: '40rem',
  padding: '0 2rem .5rem',
  width: '100%'
})

const FormHeading = styled('div')({
  ...ui.dashHeaderTitleStyles,
  padding: '0 0 2rem',
  textAlign: 'center',
  width: '100%'
})

const FormInner = styled('div')({
  padding: '2rem'
})

const FormBlock = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  justifyContent: 'space-between',
  margin: '0 auto 1rem',
  width: '100%'
})

const FormBlockInline = styled(FormBlock)({
  marginTop: '3rem'
})

const FieldBlock = styled('div')({
  width: '16rem'
})

const TextAreaBlock = styled('div')({
  margin: '2rem auto'
})

const StyledButton = styled(PrimaryButton)({
  margin: '0 auto',
  width: '16rem'
})

const validate = (values, props) => {
  const {isNewOrganization} = props
  const schema = isNewOrganization ? addOrgSchema() : makeAddTeamSchema()
  return schema(values).errors
}

const makeInvitees = (invitees) => {
  return invitees
    ? invitees.map((email) => ({
      email: email.address,
      fullName: email.fullName
    }))
    : []
}

const mapStateToProps = (state) => {
  const formState = state.form.newTeam
  if (formState) {
    const {isNewOrganization} = formState.values
    return {isNewOrganization: isNewOrganization === 'true'}
  }
  return {}
}

class NewTeamForm extends Component {
  onSubmit = async (submittedData) => {
    const {atmosphere, dispatch, isNewOrganization, history} = this.props
    if (isNewOrganization) {
      const schema = addOrgSchema()
      const {
        data: {teamName, inviteesRaw, orgName},
        errors
      } = schema(submittedData)
      if (Object.keys(errors).length) {
        throw new SubmissionError(errors)
      }
      const parsedInvitees = parseEmailAddressList(inviteesRaw)
      const invitees = makeInvitees(parsedInvitees)
      const newTeam = {
        name: teamName
      }
      const handleError = (err) => {
        throw new SubmissionError(err)
      }
      const variables = {newTeam, invitees, orgName}
      AddOrgMutation(atmosphere, variables, {dispatch, history}, handleError)
    } else {
      const schema = makeAddTeamSchema()
      const {
        data: {teamName, inviteesRaw, orgId}
      } = schema(submittedData)
      const parsedInvitees = parseEmailAddressList(inviteesRaw)
      const invitees = makeInvitees(parsedInvitees)
      const newTeam = {
        name: teamName,
        orgId
      }

      AddTeamMutation(atmosphere, {newTeam, invitees}, {dispatch, history})
    }
  }

  render () {
    const {handleSubmit, isNewOrganization, submitting, organizations} = this.props

    const controlSize = 'medium'

    return (
      <StyledForm onSubmit={handleSubmit(this.onSubmit)}>
        <Panel>
          <FormInner>
            <FormHeading>{'Create a New Team'}</FormHeading>
            <FormBlock>
              <FieldLabel fieldSize={controlSize} indent label='Add Team to…' />
            </FormBlock>
            <FormBlock>
              <Field
                name='isNewOrganization'
                component={Radio}
                value='false'
                customStyles={radioStyles}
                fieldSize={controlSize}
                indent
                inline
                label='an existing organization:'
                type='radio'
              />
              <FieldBlock>
                <Field
                  component={DropdownInput}
                  disabled={isNewOrganization}
                  fieldSize={controlSize}
                  name='orgId'
                  organizations={organizations}
                />
              </FieldBlock>
            </FormBlock>
            <FormBlock>
              <Field
                name='isNewOrganization'
                component={Radio}
                value='true'
                customStyles={radioStyles}
                fieldSize={controlSize}
                indent
                inline
                label='a new organization:'
                type='radio'
              />
              <FieldBlock>
                <Field
                  component={InputField}
                  disabled={!isNewOrganization}
                  fieldSize={controlSize}
                  name='orgName'
                  placeholder={randomPlaceholderTheme.orgName}
                />
              </FieldBlock>
            </FormBlock>
            <FormBlockInline>
              <FieldLabel
                fieldSize={controlSize}
                htmlFor='teamName'
                indent
                inline
                label='Team Name'
              />
              <FieldBlock>
                <Field
                  component={InputField}
                  fieldSize={controlSize}
                  name='teamName'
                  placeholder={randomPlaceholderTheme.teamName}
                />
              </FieldBlock>
            </FormBlockInline>
            <TextAreaBlock>
              <Field
                component={TextAreaField}
                fieldSize={controlSize}
                name='inviteesRaw'
                label='Invite Team Members (optional)'
                placeholder={randomPlaceholderTheme.emailMulti}
              />
            </TextAreaBlock>
            <StyledButton buttonSize='large' depth={1} waiting={submitting}>
              {isNewOrganization ? 'Create Team & Org' : 'Create Team'}
            </StyledButton>
          </FormInner>
        </Panel>
      </StyledForm>
    )
  }
}

NewTeamForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  isNewOrganization: PropTypes.bool,
  submitting: PropTypes.bool.isRequired,
  organizations: PropTypes.array.isRequired
}

export default withAtmosphere(
  reduxForm({form: 'newTeam', validate})(connect(mapStateToProps)(withRouter(NewTeamForm)))
)
