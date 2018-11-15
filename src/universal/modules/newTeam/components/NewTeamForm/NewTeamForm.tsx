import {NewTeamForm_organizations} from '__generated__/NewTeamForm_organizations.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {connect} from 'react-redux'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {Dispatch} from 'redux'
import FieldLabel from 'universal/components/FieldLabel/FieldLabel'
import Panel from 'universal/components/Panel/Panel'
import PrimaryButton from 'universal/components/PrimaryButton'
import Radio from 'universal/components/Radio/Radio'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import AddOrgMutation from 'universal/mutations/AddOrgMutation'
import AddTeamMutation from 'universal/mutations/AddTeamMutation'
import ui from 'universal/styles/ui'
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder'
import parseEmailAddressList from 'universal/utils/parseEmailAddressList'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import Legitity from 'universal/validation/Legitity'
import {inviteesRawTest} from 'universal/validation/templates'
import teamNameValidation from 'universal/validation/teamNameValidation'
import NewTeamOrgPicker from 'universal/modules/team/components/NewTeamOrgPicker'
import NewTeamFormBlock from './NewTeamFormBlock'
import NewTeamFormInvitees from './NewTeamFormInvitees'
import NewTeamFormOrgName from './NewTeamFormOrgName'
import NewTeamFormTeamName from './NewTeamFormTeamName'

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

export const NewTeamFieldBlock = styled('div')({
  width: '16rem'
})

const StyledButton = styled(PrimaryButton)({
  margin: '0 auto',
  width: '16rem'
})

const controlSize = 'medium'

interface Props extends WithMutationProps, WithAtmosphereProps, RouteComponentProps<{}> {
  dispatch: Dispatch<any>
  isNewOrganization: boolean
  organizations: NewTeamForm_organizations
}

interface State {
  isNewOrg: boolean
  orgId: string
  fields: Fields
}

interface Field {
  dirty?: boolean
  error: string | undefined
  value: string
}

interface Fields {
  rawInvitees: Field
  orgName: Field
  teamName: Field
}

type FieldName = 'rawInvitees' | 'orgName' | 'teamName'
const DEFAULT_FIELD = {value: '', error: undefined, dirty: false}

const makeInvitees = (invitees) => {
  return invitees
    ? invitees.map((email) => ({
      email: email.address,
      fullName: email.fullName
    }))
    : []
}

class NewTeamForm extends Component<Props, State> {
  state = {
    isNewOrg: this.props.isNewOrganization,
    orgId: '',
    fields: {
      rawInvitees: {...DEFAULT_FIELD},
      orgName: {...DEFAULT_FIELD},
      teamName: {...DEFAULT_FIELD}
    }
  }

  setOrgId = (orgId: string) => {
    this.setState(
      {
        orgId
      },
      () => {
        this.validate('teamName')
      }
    )
  }

  validate = (name: FieldName) => {
    const validators = {
      teamName: this.validateTeamName,
      orgName: this.validateOrgName,
      rawInvitees: this.validateInvitees
    }
    const res: Legitity = validators[name]()

    const {fields} = this.state
    const field = fields[name]
    if (res.error !== field.error) {
      this.setState({
        fields: {
          ...fields,
          [name]: {
            ...field,
            error: res.error
          }
        }
      })
    }
    return res
  }

  validateTeamName = () => {
    const {organizations} = this.props
    const {isNewOrg, orgId, fields} = this.state
    const rawTeamName = fields.teamName.value
    let teamNames: Array<string> = []
    if (!isNewOrg) {
      const org = organizations.find((org) => org.id === orgId)
      if (org) {
        teamNames = org.teams.map((team) => team.name)
      }
    }
    return teamNameValidation(rawTeamName, teamNames)
  }

  validateInvitees = () => {
    const {fields} = this.state
    const rawInvitees = fields.rawInvitees.value
    return new Legitity(rawInvitees).test(inviteesRawTest)
  }

  validateOrgName = () => {
    const {fields} = this.state
    const rawOrgName = fields.orgName.value
    return new Legitity(rawOrgName)
      .trim()
      .required('Your new org needs a name!')
      .min(2, 'C’mon, you call that an organization?')
      .max(100, 'Maybe just the legal name?')
  }

  handleBlur = (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    this.setDirty(e.target.name as FieldName)
  }

  setDirty = (name: FieldName) => {
    const {fields} = this.state
    const field = fields[name]
    if (!field.dirty) {
      this.setState({
        fields: {
          ...fields,
          [name]: {
            ...field,
            dirty: true
          }
        }
      })
    }
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {fields} = this.state
    const {value} = e.target
    const name = e.target.name as FieldName
    const field = fields[name]
    this.setState(
      {
        fields: {
          ...fields,
          [name]: {
            ...field,
            value
          }
        }
      },
      () => {
        this.validate(name)
      }
    )
  }

  handleIsNewOrgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isNewOrg = e.target.value === 'true'
    this.setState(
      {
        isNewOrg,
        fields: {
          ...this.state.fields,
          orgName: {
            ...this.state.fields.orgName,
            dirty: false,
            error: undefined
          }
        }
      },
      () => {
        this.validate('teamName')
      }
    )
    // if (isNewOrg) {
    //   setTimeout(() => {
    //     this.newOrgInputRef.current && this.newOrgInputRef.current.focus()
    //   })
    // }
  }

  onSubmit = (e: React.FormEvent) => {
    const {
      atmosphere,
      dispatch,
      history,
      onError,
      onCompleted,
      submitMutation,
      submitting
    } = this.props
    e.preventDefault()
    if (submitting) return
    const {isNewOrg, orgId} = this.state
    const fieldNames: Array<FieldName> = ['teamName', 'rawInvitees']
    fieldNames.forEach(this.setDirty)
    const fieldRes = fieldNames.map(this.validate)
    const hasError = fieldRes.reduce((err: boolean, val) => err || !!val.error, false)
    if (hasError) return
    const [teamRes, rawInviteesRes] = fieldRes
    const parsedInvitees = parseEmailAddressList(rawInviteesRes.value)
    const invitees = makeInvitees(parsedInvitees)
    if (isNewOrg) {
      this.setDirty('orgName')
      const {error, value: orgName} = this.validate('orgName')
      if (error) return
      const newTeam = {
        name: teamRes.value
      }
      const variables = {newTeam, invitees, orgName}
      submitMutation()
      AddOrgMutation(atmosphere, variables, {history}, onError, onCompleted)
    } else {
      const newTeam = {
        name: teamRes.value,
        orgId
      }
      submitMutation()
      AddTeamMutation(atmosphere, {newTeam, invitees}, {dispatch, history}, onError, onCompleted)
    }
  }

  render () {
    const {fields, isNewOrg, orgId} = this.state
    const {submitting, organizations} = this.props

    return (
      <StyledForm onSubmit={this.onSubmit}>
        <Panel>
          <FormInner>
            <FormHeading>{'Create a New Team'}</FormHeading>
            <NewTeamFormBlock>
              <FieldLabel fieldSize={controlSize} indent label='Add Team to…' />
            </NewTeamFormBlock>
            <NewTeamFormBlock>
              <Radio
                checked={!isNewOrg}
                name='isNewOrganization'
                value='false'
                label='an existing organization:'
                onChange={this.handleIsNewOrgChange}
              />
              <NewTeamFieldBlock>
                <NewTeamOrgPicker
                  disabled={isNewOrg}
                  onChange={this.setOrgId}
                  organizations={organizations}
                  orgId={orgId}
                />
              </NewTeamFieldBlock>
            </NewTeamFormBlock>
            <NewTeamFormOrgName
              isNewOrg={isNewOrg}
              onChange={this.handleInputChange}
              onTypeChange={this.handleIsNewOrgChange}
              orgName={fields.orgName.value}
              dirty={fields.orgName.dirty}
              error={fields.orgName.error}
              placeholder={randomPlaceholderTheme.orgName}
              onBlur={this.handleBlur}
            />
            <NewTeamFormTeamName
              dirty={fields.teamName.dirty}
              error={fields.teamName.error}
              onChange={this.handleInputChange}
              teamName={fields.teamName.value}
              onBlur={this.handleBlur}
            />
            <NewTeamFormInvitees
              placeholder={randomPlaceholderTheme.emailMulti}
              dirty={fields.rawInvitees.dirty}
              error={fields.rawInvitees.error}
              onChange={this.handleInputChange}
              rawInvitees={fields.rawInvitees.value}
              onBlur={this.handleBlur}
            />

            <StyledButton size='large' waiting={submitting}>
              {isNewOrg ? 'Create Team & Org' : 'Create Team'}
            </StyledButton>
          </FormInner>
        </Panel>
      </StyledForm>
    )
  }
}

export default createFragmentContainer(
  (connect() as any)(withAtmosphere(withRouter(withMutationProps(NewTeamForm)))),
  graphql`
    fragment NewTeamForm_organizations on Organization @relay(plural: true) {
      ...NewTeamOrgPicker_organizations
      id
      teams {
        name
      }
    }
  `
)
