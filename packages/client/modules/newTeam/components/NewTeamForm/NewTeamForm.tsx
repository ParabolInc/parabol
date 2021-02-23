import {NewTeamForm_organizations} from '../../../../__generated__/NewTeamForm_organizations.graphql'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Radio from '../../../../components/Radio/Radio'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import NewTeamOrgPicker from '../../../team/components/NewTeamOrgPicker'
import AddOrgMutation from '../../../../mutations/AddOrgMutation'
import AddTeamMutation from '../../../../mutations/AddTeamMutation'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import Legitity from '../../../../validation/Legitity'
import teamNameValidation from '../../../../validation/teamNameValidation'
import NewTeamFormBlock from './NewTeamFormBlock'
import NewTeamFormOrgName from './NewTeamFormOrgName'
import NewTeamFormTeamName from './NewTeamFormTeamName'
import StyledError from '../../../../components/StyledError'
import DashHeaderTitle from '../../../../components/DashHeaderTitle'
import linkify from '../../../../utils/linkify'

const StyledForm = styled('form')({
  margin: 0,
  maxWidth: '40rem',
  padding: 16,
  width: '100%'
})

const StyledPanel = styled(Panel)({
  margin: '16px 0'
})

const Header = styled('div')({
  alignItems: 'center',
  display: 'flex',
  height: 24,
  margin: '0 0 16px',
  width: '100%'
})

const FormHeading = styled(DashHeaderTitle)({
  margin: 0,
  padding: 0,
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
  orgName: Field
  teamName: Field
}

type FieldName = 'orgName' | 'teamName'
const DEFAULT_FIELD = {value: '', error: undefined, dirty: false}

class NewTeamForm extends Component<Props, State> {
  state = {
    isNewOrg: this.props.isNewOrganization,
    orgId: '',
    fields: {
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
      orgName: this.validateOrgName
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
    let teamNames: string[] = []
    if (!isNewOrg) {
      const org = organizations.find((org) => org.id === orgId)
      if (org) {
        teamNames = org.teams.map((team) => team.name)
      }
    }
    return teamNameValidation(rawTeamName, teamNames)
  }

  validateOrgName = () => {
    const {fields} = this.state
    const rawOrgName = fields.orgName.value
    return new Legitity(rawOrgName)
      .trim()
      .required('Your new org needs a name!')
      .min(2, 'C’mon, you call that an organization?')
      .max(100, 'Maybe just the legal name?')
      .test((val) => (linkify.match(val) ? 'Try using a name, not a link!' : undefined))
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
  }

  onSubmit = (e: React.FormEvent) => {
    const {atmosphere, history, onError, onCompleted, submitMutation, submitting} = this.props
    e.preventDefault()
    if (submitting) return
    const {isNewOrg, orgId} = this.state
    const fieldNames: FieldName[] = ['teamName']
    fieldNames.forEach(this.setDirty)
    const fieldRes = fieldNames.map(this.validate)
    const hasError = fieldRes.reduce((err: boolean, val) => err || !!val.error, false)
    if (hasError) return
    const [teamRes] = fieldRes
    if (isNewOrg) {
      this.setDirty('orgName')
      const {error, value: orgName} = this.validate('orgName')
      if (error) return
      const newTeam = {
        name: teamRes.value
      }
      const variables = {newTeam, orgName}
      submitMutation()
      AddOrgMutation(atmosphere, variables, {history, onError, onCompleted})
    } else {
      const newTeam = {
        name: teamRes.value,
        orgId
      }
      submitMutation()
      AddTeamMutation(atmosphere, {newTeam}, {onError, onCompleted, history})
    }
  }

  render() {
    const {fields, isNewOrg, orgId} = this.state
    const {error, submitting, organizations} = this.props

    return (
      <StyledForm onSubmit={this.onSubmit}>
        <Header>
          <FormHeading>{'Create a New Team'}</FormHeading>
        </Header>
        <StyledPanel>
          <FormInner>
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
              placeholder='My new organization'
              onBlur={this.handleBlur}
            />
            <NewTeamFormTeamName
              dirty={fields.teamName.dirty}
              error={fields.teamName.error}
              onChange={this.handleInputChange}
              teamName={fields.teamName.value}
              onBlur={this.handleBlur}
            />

            <StyledButton size='large' waiting={submitting}>
              {isNewOrg ? 'Create Team & Org' : 'Create Team'}
            </StyledButton>
            {error && <StyledError>{error}</StyledError>}
          </FormInner>
        </StyledPanel>
      </StyledForm>
    )
  }
}

export default createFragmentContainer(withAtmosphere(withRouter(withMutationProps(NewTeamForm))), {
  organizations: graphql`
    fragment NewTeamForm_organizations on Organization @relay(plural: true) {
      ...NewTeamOrgPicker_organizations
      id
      teams {
        name
      }
    }
  `
})
