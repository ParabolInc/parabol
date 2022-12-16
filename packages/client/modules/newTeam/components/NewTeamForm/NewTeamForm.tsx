import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ChangeEvent, FormEvent, useState} from 'react'
import {useFragment} from 'react-relay'
import DashHeaderTitle from '../../../../components/DashHeaderTitle'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Radio from '../../../../components/Radio/Radio'
import StyledError from '../../../../components/StyledError'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useForm from '../../../../hooks/useForm'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import AddOrgMutation from '../../../../mutations/AddOrgMutation'
import AddTeamMutation from '../../../../mutations/AddTeamMutation'
import SendClientSegmentEventMutation from '../../../../mutations/SendClientSegmentEventMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {Threshold} from '../../../../types/constEnums'
import linkify from '../../../../utils/linkify'
import Legitity from '../../../../validation/Legitity'
import teamNameValidation from '../../../../validation/teamNameValidation'
import {NewTeamForm_organizations$key} from '../../../../__generated__/NewTeamForm_organizations.graphql'
import NewTeamOrgPicker from '../../../team/components/NewTeamOrgPicker'
import NewTeamFormBlock from './NewTeamFormBlock'
import NewTeamFormOrgName from './NewTeamFormOrgName'
import NewTeamFormTeamName from './NewTeamFormTeamName'

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

const BoldText = styled('span')({
  fontWeight: 600
})

export const NewTeamFieldBlock = styled('div')({
  width: '16rem'
})

const StyledButton = styled(PrimaryButton)({
  margin: '0 auto',
  marginTop: 24,
  width: '16rem'
})

const WarningMsg = styled('div')({
  background: PALETTE.GOLD_100,
  padding: '16px 24px',
  fontSize: 16,
  borderRadius: 2,
  lineHeight: '26px',
  fontWeight: 500,
  marginTop: 24
})

const StyledLink = styled('span')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  outline: 0,
  fontWeight: 600,
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  }
})

const controlSize = 'medium'

interface Props {
  isInitiallyNewOrg: boolean
  organizationsRef: NewTeamForm_organizations$key
}

const NewTeamForm = (props: Props) => {
  const {isInitiallyNewOrg, organizationsRef} = props
  const organizations = useFragment(
    graphql`
      fragment NewTeamForm_organizations on Organization @relay(plural: true) {
        ...NewTeamOrgPicker_organizations
        id
        lockedAt
        name
        teams {
          name
        }
      }
    `,
    organizationsRef
  )
  const [isNewOrg, setIsNewOrg] = useState(isInitiallyNewOrg)
  const [orgId, setOrgId] = useState('')
  const lockedSelectedOrg = organizations.find((org) => org.id === orgId && org.lockedAt)
  const disableFields = !!lockedSelectedOrg && !isNewOrg

  const validateOrgName = (orgName: string) => {
    return new Legitity(orgName)
      .trim()
      .required('Your new org needs a name!')
      .min(2, 'C’mon, you call that an organization?')
      .max(100, 'Maybe just the legal name?')
      .test((val) => (linkify.match(val) ? 'Try using a name, not a link!' : undefined))
  }

  const validateTeamName = (teamName: string) => {
    let teamNames: string[] = []
    if (!isNewOrg) {
      const org = organizations.find((org) => org.id === orgId)
      if (org) {
        teamNames = org.teams.map((team) => team.name)
      }
    }
    return teamNameValidation(teamName, teamNames)
  }

  const {fields, onChange, validateField} = useForm({
    orgName: {
      getDefault: () => '',
      validate: validateOrgName
    },
    teamName: {
      getDefault: () => '',
      validate: validateTeamName
    }
  })

  const {submitting, onError, error, onCompleted, submitMutation} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history} = useRouter()

  const updateOrgId = (orgId: string) => {
    setOrgId(orgId)
  }

  const handleIsNewOrgChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isNewOrg = e.target.value === 'true'
    setIsNewOrg(isNewOrg)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const {error: teamErr, value: teamName} = validateField('teamName')
    if (teamErr) return
    if (isNewOrg) {
      const {error: orgErr, value: orgName} = validateField('orgName')
      if (orgErr) return
      const newTeam = {
        name: teamName
      }
      const variables = {newTeam, orgName}
      submitMutation()
      AddOrgMutation(atmosphere, variables, {history, onError, onCompleted})
    } else {
      const newTeam = {
        name: teamName,
        orgId
      }
      submitMutation()
      AddTeamMutation(atmosphere, {newTeam}, {onError, onCompleted, history})
    }
  }

  const goToBilling = () => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'createTeam',
      orgId,
      upgradeTier: 'pro'
    })
    history.push(`/me/organizations/${orgId}`)
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
            onChange={onChange}
            onTypeChange={handleIsNewOrgChange}
            orgName={fields.orgName.value}
            error={fields.orgName.error}
            placeholder='My new organization'
          />
          <NewTeamFormTeamName
            error={fields.teamName.error}
            disabled={disableFields}
            onChange={onChange}
            teamName={fields.teamName.value}
          />
          {disableFields && (
            <WarningMsg>
              <BoldText>{lockedSelectedOrg.name}</BoldText>
              {` has reached the limit of `}
              <BoldText>{`${Threshold.MAX_PERSONAL_TIER_TEAMS} free teams.`} </BoldText>
              <StyledLink onClick={goToBilling}>Upgrade</StyledLink>
              {' to create more teams.'}
            </WarningMsg>
          )}
          <StyledButton disabled={disableFields} size='large' waiting={submitting}>
            {isNewOrg ? 'Create Team & Org' : 'Create Team'}
          </StyledButton>
          {error && <StyledError>{error.message}</StyledError>}
        </FormInner>
      </StyledPanel>
    </StyledForm>
  )
}

export default NewTeamForm
