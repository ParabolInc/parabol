import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import * as React from 'react'
import {ChangeEvent, FormEvent, useState} from 'react'
import {useFragment} from 'react-relay'
import {NewTeamForm_organizations$key} from '../../../../__generated__/NewTeamForm_organizations.graphql'
import Checkbox from '../../../../components/Checkbox'
import DashHeaderTitle from '../../../../components/DashHeaderTitle'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Radio from '../../../../components/Radio/Radio'
import StyledError from '../../../../components/StyledError'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useForm from '../../../../hooks/useForm'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import AddOrgMutation from '../../../../mutations/AddOrgMutation'
import AddTeamMutation from '../../../../mutations/AddTeamMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {Threshold} from '../../../../types/constEnums'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'
import linkify from '../../../../utils/linkify'
import parseEmailAddressList from '../../../../utils/parseEmailAddressList'
import Legitity from '../../../../validation/Legitity'
import teamNameValidation from '../../../../validation/teamNameValidation'
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

  graphql`
    fragment NewTeamForm_teams on Team @relay(plural: true) {
      teamMembers {
        user {
          email
        }
        isSelf
      }
    }
  `
  const organizations = useFragment(
    graphql`
      fragment NewTeamForm_organizations on Organization @relay(plural: true) {
        ...NewTeamOrgPicker_organizations
        id
        lockedAt
        name
        tier
        teams {
          name
          ...NewTeamForm_teams @relay(mask: false)
        }
      }
    `,
    organizationsRef
  )
  const [isPublic, setIsPublic] = useState(true)
  const [isNewOrg, setIsNewOrg] = useState(isInitiallyNewOrg)
  const [orgId, setOrgId] = useState('')
  const [rawInvitees, setRawInvitees] = useState('')
  const [invitees, setInvitees] = useState([] as string[])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const lockedSelectedOrg = organizations.find((org) => org.id === orgId && org.lockedAt)
  const [inviteAll, setInviteAll] = useState(false)
  const disableFields = !!lockedSelectedOrg && !isNewOrg
  const selectedOrg = organizations.find((org) => org.id === orgId)
  const selectedOrgTeamMemberEmails = selectedOrg?.teams.flatMap(({teamMembers}) =>
    teamMembers.filter(({isSelf}) => !isSelf).map(({user}) => user.email)
  )
  const uniqueEmailsFromSelectedOrg = Array.from(new Set(selectedOrgTeamMemberEmails))
  const showInviteAll = !!(!isNewOrg && selectedOrg && uniqueEmailsFromSelectedOrg.length)
  const isStarterTier = selectedOrg?.tier === 'starter'
  const disablePrivacyToggle = (!isNewOrg && isStarterTier) || isNewOrg

  const validateOrgName = (orgName: string) => {
    return new Legitity(orgName)
      .trim()
      .required('Your new org needs a name!')
      .min(2, `C'mon, you call that an organization?`)
      .max(100, 'Maybe just the legal name?')
      .test((val) => (linkify.match(val) ? 'Try using a name, not a link!' : undefined))
  }

  const validateTeamName = (teamName: string) => {
    let teamNames: string[] = []
    if (!isNewOrg) {
      if (selectedOrg) {
        teamNames = selectedOrg.teams.map((team) => team.name)
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
        name: teamName,
        orgId,
        isPublic
      }
      const variables = {newTeam, orgName, invitees}
      submitMutation()
      AddOrgMutation(atmosphere, variables, {history, onError, onCompleted})
    } else {
      const newTeam = {
        name: teamName,
        orgId,
        isPublic
      }
      submitMutation()
      AddTeamMutation(atmosphere, {newTeam, invitees}, {onError, onCompleted, history})
    }
  }

  const goToBilling = (ctaLocation: 'publicTeams' | 'createTeam') => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: ctaLocation,
      orgId,
      upgradeTier: 'team'
    })
    history.push(`/me/organizations/${orgId}`)
  }

  const onInvitesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSubmitted) setIsSubmitted(false)
    const nextValue = e.target.value
    if (rawInvitees === nextValue) return
    const {parsedInvitees, invalidEmailExists} = parseEmailAddressList(nextValue)
    const allInvitees = parsedInvitees
      ? (parsedInvitees.map((invitee: any) => invitee.address) as string[])
      : []
    const uniqueInvitees = Array.from(new Set(allInvitees))
    if (invalidEmailExists) {
      const lastValidEmail = uniqueInvitees[uniqueInvitees.length - 1]
      lastValidEmail
        ? onError(new Error(`Invalid email(s) after ${lastValidEmail}`))
        : onError(new Error(`Invalid email(s)`))
    } else {
      onCompleted()
    }
    setRawInvitees(nextValue)
    setInvitees(uniqueInvitees)
  }

  const handleToggleInviteAll = () => {
    if (!inviteAll) {
      const {parsedInvitees} = parseEmailAddressList(rawInvitees)
      const currentInvitees = parsedInvitees
        ? (parsedInvitees.map((invitee: any) => invitee.address) as string[])
        : []
      const emailsToAdd = uniqueEmailsFromSelectedOrg.filter(
        (email) => !currentInvitees.includes(email)
      )
      const lastInvitee = currentInvitees[currentInvitees.length - 1]
      const formattedCurrentInvitees =
        currentInvitees.length && lastInvitee && !lastInvitee.endsWith(',')
          ? `${currentInvitees.join(', ')}, `
          : currentInvitees.join(', ')
      setRawInvitees(`${formattedCurrentInvitees}${emailsToAdd.join(', ')}`)
      setInvitees([...currentInvitees, ...emailsToAdd])
    } else {
      const {parsedInvitees} = parseEmailAddressList(rawInvitees)
      const currentInvitees = parsedInvitees
        ? (parsedInvitees as emailAddresses.ParsedMailbox[]).map((invitee) => invitee.address)
        : []
      const remainingInvitees = currentInvitees.filter(
        (email) => !uniqueEmailsFromSelectedOrg.includes(email)
      )
      setRawInvitees(remainingInvitees.join(', '))
      setInvitees(remainingInvitees)
    }
    onCompleted()
    setInviteAll((inviteAll) => !inviteAll)
  }

  return (
    <StyledForm onSubmit={onSubmit}>
      <Header>
        <FormHeading>{'Create a New Team'}</FormHeading>
      </Header>
      <StyledPanel>
        <FormInner>
          <NewTeamFormBlock className='w-full'>
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
            autoFocus
            error={fields.teamName.error}
            disabled={disableFields}
            onChange={onChange}
            teamName={fields.teamName.value}
          />
          {disableFields && (
            <WarningMsg>
              <BoldText>{lockedSelectedOrg.name}</BoldText>
              {` has reached the limit of `}
              <BoldText>{`${Threshold.MAX_STARTER_TIER_TEAMS} free teams.`} </BoldText>
              <StyledLink onClick={() => goToBilling('publicTeams')}>Upgrade</StyledLink>
              {' to create more teams.'}
            </WarningMsg>
          )}
          <div className='mt-8 flex items-center'>
            <div className='flex flex-1 items-start'>
              <div>
                <div className='flex items-center'>
                  <div className='text-sm font-medium text-slate-700'>Team Privacy</div>
                </div>
                <div className='mt-1 w-full text-xs text-slate-600'>
                  {isPublic ? (
                    <>
                      <div>
                        This team is <b>Public</b>. Anybody in the organization can find and join
                        the team.
                      </div>
                      {disablePrivacyToggle && (
                        <div className='mt-1'>
                          {isNewOrg ? (
                            <>
                              After creating your organization you can upgrade to make teams
                              private.
                            </>
                          ) : (
                            <>
                              <StyledLink onClick={() => goToBilling('createTeam')}>
                                Upgrade
                              </StyledLink>{' '}
                              to make it private.
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      This team is <b>Private</b>. New team members may join by invite only.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='flex items-center'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Toggle
                      active={!isPublic}
                      disabled={disablePrivacyToggle}
                      onClick={() => setIsPublic(!isPublic)}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{isPublic ? 'Set to private' : 'Set to public'}</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <p className='mt-8 mb-3 text-xs leading-4'>
            {'Invite others to your new team. Invites expire in 30 days.'}
          </p>
          <BasicTextArea
            name='rawInvitees'
            onChange={onInvitesChange}
            placeholder='email@example.co, another@example.co'
            value={rawInvitees}
          />
          {showInviteAll && (
            <div className='flex cursor-pointer items-center pt-2' onClick={handleToggleInviteAll}>
              <Checkbox active={inviteAll} />
              <label htmlFor='checkbox' className='text-gray-700 ml-2 cursor-pointer'>
                {`Invite team members from ${selectedOrg.name}`}
              </label>
            </div>
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
