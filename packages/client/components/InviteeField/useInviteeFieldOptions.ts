import {useLayoutEffect, useMemo} from 'react'
import type useTeamInviteeDrafts from '../../hooks/useTeamInviteeDrafts'
import {checkInviteeEmail, type InviteeDirectory} from '../../utils/inviteeDirectory'
import {buildInviteeOptions} from '../../utils/inviteeOptions'

type Input = {
  invitees: ReturnType<typeof useTeamInviteeDrafts>
  directory: InviteeDirectory | null
  teamEmails: readonly string[]
  targetTeamId: string | null
  capacity: number | null
  isOpen: boolean
  showAllPartners: boolean
}

const useInviteeFieldOptions = (input: Input) => {
  const {invitees, directory, teamEmails, targetTeamId, capacity, isOpen, showAllPartners} = input
  const {drafts, inputValue, setEmailCheck} = invitees
  const checkEmail = useMemo(
    () => (directory ? (email: string) => checkInviteeEmail(email, directory) : null),
    [directory]
  )
  useLayoutEffect(() => {
    setEmailCheck(checkEmail)
  }, [checkEmail, setEmailCheck])
  return useMemo(() => {
    if (!isOpen || !directory) return null
    return buildInviteeOptions({
      query: inputValue,
      directory,
      draftEmails: new Set(drafts.map(({email}) => email)),
      teamEmails: new Set(teamEmails),
      targetTeamId,
      capacity,
      showAllPartners
    })
  }, [isOpen, directory, inputValue, drafts, teamEmails, targetTeamId, capacity, showAllPartners])
}

export default useInviteeFieldOptions
