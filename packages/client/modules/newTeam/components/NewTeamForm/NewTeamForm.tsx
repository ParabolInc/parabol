import graphql from 'babel-plugin-relay/macro'
import {
  type ChangeEvent,
  type FormEvent,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useRef,
  useState
} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {NewTeamForm_organizations$key} from '../../../../__generated__/NewTeamForm_organizations.graphql'
import DashHeaderTitle from '../../../../components/DashHeaderTitle'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import Panel from '../../../../components/Panel/Panel'
import Radio from '../../../../components/Radio/Radio'
import StyledError from '../../../../components/StyledError'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useForm from '../../../../hooks/useForm'
import useMutationProps from '../../../../hooks/useMutationProps'
import useTeamInviteeDrafts, {isDraftReady} from '../../../../hooks/useTeamInviteeDrafts'
import AddOrgMutation from '../../../../mutations/AddOrgMutation'
import AddTeamMutation from '../../../../mutations/AddTeamMutation'
import {MAX_TEAM_INVITEES} from '../../../../shared/teamInvitees'
import {Threshold} from '../../../../types/constEnums'
import {Button} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'
import linkify from '../../../../utils/linkify'
import plural from '../../../../utils/plural'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'
import Legitity from '../../../../validation/Legitity'
import teamNameValidation from '../../../../validation/teamNameValidation'
import NewTeamOrgPicker from '../../../team/components/NewTeamOrgPicker'
import NewTeamFormBlock from './NewTeamFormBlock'
import NewTeamFormInvitees from './NewTeamFormInvitees'
import NewTeamFormOrgName from './NewTeamFormOrgName'
import NewTeamFormTeamName from './NewTeamFormTeamName'

export const NewTeamFieldBlock = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return <div {...rest} ref={ref} className={cn('w-64', className)} />
  }
)

const StyledLink = (props: {onClick: () => void; children: ReactNode}) => {
  const {onClick, children} = props
  return (
    <span
      className='cursor-pointer font-semibold text-accent outline-0 hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
      onClick={onClick}
    >
      {children}
    </span>
  )
}

const controlSize = 'medium'

interface Props {
  isInitiallyNewOrg: boolean
  defaultOrgId?: string
  organizationsRef: NewTeamForm_organizations$key
}

const NewTeamForm = (props: Props) => {
  const {isInitiallyNewOrg, defaultOrgId, organizationsRef} = props

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
  const [orgId, setOrgId] = useState(defaultOrgId ?? '')
  const invitees = useTeamInviteeDrafts([])
  const formRef = useRef<HTMLFormElement>(null)
  const lockedSelectedOrg = organizations.find((org) => org.id === orgId && org.lockedAt)
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
  const navigate = useNavigate()

  const updateOrgId = (orgId: string) => {
    setOrgId(orgId)
  }

  const handleIsNewOrgChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isNewOrg = e.target.value === 'true'
    setIsNewOrg(isNewOrg)
  }

  // returns the addresses to invite, or null after explaining why the team can't be created yet
  const getInviteeEmails = () => {
    const inviteeDrafts = invitees.commitInput()
    const invalidCount = inviteeDrafts.filter((draft) => !isDraftReady(draft)).length
    if (invalidCount > 0) {
      const addresses = plural(invalidCount, 'invalid email address', 'invalid email addresses')
      onError(new Error(`Fix or remove the ${addresses} above before creating the team`))
      return null
    }
    const inviteeEmails = inviteeDrafts.map(({email}) => email)
    const excess = inviteeEmails.length - MAX_TEAM_INVITEES
    if (excess > 0) {
      onError(
        new Error(
          `You can invite up to ${MAX_TEAM_INVITEES} people while creating a team. Remove ${excess}, then invite them from the team page`
        )
      )
      return null
    }
    return inviteeEmails
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const {error: teamErr, value: teamName} = validateField('teamName')
    if (teamErr) return
    const newTeam = {
      name: teamName,
      orgId,
      isPublic
    }
    if (isNewOrg) {
      const {error: orgErr, value: orgName} = validateField('orgName')
      if (orgErr) return
      const inviteeEmails = getInviteeEmails()
      if (!inviteeEmails) return
      submitMutation()
      AddOrgMutation(
        atmosphere,
        {newTeam, orgName, invitees: inviteeEmails},
        {navigate, onError, onCompleted}
      )
    } else {
      const inviteeEmails = getInviteeEmails()
      if (!inviteeEmails) return
      submitMutation()
      AddTeamMutation(
        atmosphere,
        {newTeam, invitees: inviteeEmails},
        {onError, onCompleted, navigate}
      )
    }
  }

  const goToBilling = (ctaLocation: 'publicTeams' | 'createTeam') => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: ctaLocation,
      orgId,
      upgradeTier: 'team'
    })
    navigate(`/me/organizations/${orgId}`)
  }

  return (
    <form ref={formRef} className='m-0 w-full max-w-[40rem] p-4' onSubmit={onSubmit}>
      <div className='mb-4 flex h-6 w-full items-center'>
        <DashHeaderTitle className='m-0 w-full p-0'>{'Create a New Team'}</DashHeaderTitle>
      </div>
      <Panel className='my-4'>
        <div className='p-8'>
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
            <div className='mt-6 rounded-[2px] bg-gold-100 px-6 py-4 font-medium text-[16px] text-slate-700 leading-[26px]'>
              <span className='font-semibold'>{lockedSelectedOrg.name}</span>
              {` has reached the limit of `}
              <span className='font-semibold'>
                {`${Threshold.MAX_STARTER_TIER_TEAMS} free teams.`}{' '}
              </span>
              <StyledLink onClick={() => goToBilling('publicTeams')}>Upgrade</StyledLink>
              {' to create more teams.'}
            </div>
          )}
          <div className='mt-8 flex items-center'>
            <div className='flex flex-1 items-start'>
              <div>
                <div className='flex items-center'>
                  <div className='font-medium text-fg-primary text-sm'>Team Privacy</div>
                </div>
                <div className='mt-1 w-full text-fg-secondary text-xs'>
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
          <NewTeamFormInvitees
            invitees={invitees}
            orgName={showInviteAll ? selectedOrg.name : null}
            orgTeammateEmails={uniqueEmailsFromSelectedOrg}
            onSubmit={() => formRef.current?.requestSubmit()}
          />
          <Button
            variant='primary'
            className='mx-auto mt-6 mb-0 w-64'
            disabled={disableFields || submitting}
            size='lg'
          >
            {isNewOrg ? 'Create Team & Org' : 'Create Team'}
          </Button>
          {error && <StyledError>{error.message}</StyledError>}
        </div>
      </Panel>
    </form>
  )
}

export default NewTeamForm
