import {NewTeamForm_organizations} from '../../../../__generated__/NewTeamForm_organizations.graphql'
import React, {useEffect, useState, ChangeEvent, FormEvent, FocusEvent} from 'react'
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
import useMutationProps from '../../../../hooks/useMutationProps'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useRouter from '../../../../hooks/useRouter'

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

const NewTeamForm = (props: Props) => {
  const {isNewOrganization, organizations} = props
  const [isNewOrg, setIsNewOrg] = useState(isNewOrganization)
  const [orgId, setOrgId] = useState('')
  const [fields, setFields] = useState<Fields>({
    orgName: {...DEFAULT_FIELD},
    teamName: {...DEFAULT_FIELD}
  })
  const {submitting, onError, error, onCompleted, submitMutation} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history} = useRouter()

  const updateOrgId = (orgId: string) => {
    setOrgId(orgId)
  }

  const validateOrgName = () => {
    const rawOrgName = fields.orgName.value
    return new Legitity(rawOrgName)
      .trim()
      .required('Your new org needs a name!')
      .min(2, 'C’mon, you call that an organization?')
      .max(100, 'Maybe just the legal name?')
      .test((val) => (linkify.match(val) ? 'Try using a name, not a link!' : undefined))
  }

  const validateTeamName = () => {
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

  const validate = (name: FieldName) => {
    const validators = {
      teamName: validateTeamName,
      orgName: validateOrgName
    }
    const res: Legitity = validators[name]()
    const field = fields[name]
    if (res.error !== field.error) {
      setFields({
        ...fields,
        [name]: {
          ...field,
          error: res.error
        }
      })
    }
    return res
  }

  useEffect(() => {
    validate('orgName')
  }, [fields.orgName])

  useEffect(() => {
    validate('teamName')
  }, [fields.teamName])

  const handleBlur = (e: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setDirty(e.target.name as FieldName)
  }

  const setDirty = (name: FieldName) => {
    const field = fields[name]
    if (!field.dirty) {
      setFields({
        ...fields,
        [name]: {
          ...field,
          dirty: true
        }
      })
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {value} = e.target
    const name = e.target.name as FieldName
    const field = fields[name]
    setFields({
      ...fields,
      [name]: {
        ...field,
        value
      }
    })
  }

  const handleIsNewOrgChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isNewOrg = e.target.value === 'true'
    setIsNewOrg(isNewOrg)
    setFields({
      ...fields,
      orgName: {
        ...fields.orgName,
        dirty: false,
        error: undefined
      }
    })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const fieldNames: FieldName[] = ['teamName']
    fieldNames.forEach(setDirty)
    const fieldRes = fieldNames.map(validate)
    const hasError = fieldRes.reduce((err: boolean, val) => err || !!val.error, false)
    if (hasError) return
    const [teamRes] = fieldRes
    if (isNewOrg) {
      setDirty('orgName')
      const {error, value: orgName} = validate('orgName')
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

  return (
    <StyledForm onSubmit={onSubmit}>
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
              onChange={handleIsNewOrgChange}
            />
            <NewTeamFieldBlock>
              <NewTeamOrgPicker
                disabled={isNewOrg}
                onChange={updateOrgId}
                organizations={organizations}
                orgId={orgId}
              />
            </NewTeamFieldBlock>
          </NewTeamFormBlock>
          <NewTeamFormOrgName
            isNewOrg={isNewOrg}
            onChange={handleInputChange}
            onTypeChange={handleIsNewOrgChange}
            orgName={fields.orgName.value}
            dirty={!!fields.orgName.dirty}
            error={fields.orgName.error}
            placeholder='My new organization'
            onBlur={handleBlur}
          />
          <NewTeamFormTeamName
            dirty={!!fields.teamName.dirty}
            error={fields.teamName.error}
            onChange={handleInputChange}
            teamName={fields.teamName.value}
            onBlur={handleBlur}
          />

          <StyledButton size='large' waiting={submitting}>
            {isNewOrg ? 'Create Team & Org' : 'Create Team'}
          </StyledButton>
          {error && <StyledError>{error.message}</StyledError>}
        </FormInner>
      </StyledPanel>
    </StyledForm>
  )
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
