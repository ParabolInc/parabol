import graphql from 'babel-plugin-relay/macro'
import {useMemo, useState} from 'react'
import {type PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import type {ReviewRequestToJoinOrgModal_viewer$key} from '../__generated__/ReviewRequestToJoinOrgModal_viewer.graphql'
import type {ReviewRequestToJoinOrgModalQuery} from '../__generated__/ReviewRequestToJoinOrgModalQuery.graphql'
import useAcceptRequestToJoinDomainMutation from '../mutations/useAcceptRequestToJoinDomainMutation'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import Checkbox from './Checkbox'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'

const ReviewRequestToJoinOrgModalViewerFragment = graphql`
  fragment ReviewRequestToJoinOrgModal_viewer on User
  @argumentDefinitions(requestId: {type: "ID!"}) {
    domainJoinRequest(requestId: $requestId) {
      id
      createdByEmail
      createdBy
      domain
      teams {
        id
        name
        isViewerLead
        teamMembers(sortBy: "preferredName") {
          userId
        }
        organization {
          name
          activeDomain
        }
        ...DashboardAvatars_team
      }
    }
  }
`

const query = graphql`
  query ReviewRequestToJoinOrgModalQuery($requestId: ID!) {
    viewer {
      ...ReviewRequestToJoinOrgModal_viewer @arguments(requestId: $requestId)
    }
  }
`

interface Props {
  onClose: () => void
  queryRef: PreloadedQuery<ReviewRequestToJoinOrgModalQuery>
}

const ReviewRequestToJoinOrgModal = (props: Props) => {
  const {onClose, queryRef} = props

  const [selectedTeamsIds, setSelectedTeamsIds] = useState<string[]>([])

  const data = usePreloadedQuery<ReviewRequestToJoinOrgModalQuery>(query, queryRef)
  const viewer = useFragment<ReviewRequestToJoinOrgModal_viewer$key>(
    ReviewRequestToJoinOrgModalViewerFragment,
    data.viewer
  )

  const {domainJoinRequest} = viewer
  const teams = domainJoinRequest?.teams

  const [commit, submitting] = useAcceptRequestToJoinDomainMutation()

  const sortedTeams = useMemo(() => {
    if (!teams) return []
    return teams.slice().sort((a, b) => a.organization.name.localeCompare(b.organization.name))
  }, [teams])

  const onAdd = () => {
    if (!domainJoinRequest) return
    commit(
      {variables: {requestId: domainJoinRequest.id, teamIds: selectedTeamsIds}},
      {onSuccess: onClose}
    )
  }

  return (
    <Dialog isOpen onClose={onClose}>
      <DialogContent>
        <DialogTitle>Add teammate</DialogTitle>
        {!domainJoinRequest ? (
          <>
            <div className='py-4 text-fg-primary text-sm leading-relaxed'>
              Request expired or deleted
            </div>
            <div className='flex w-full justify-end'>
              <SecondaryButton onClick={onClose} size='small'>
                Cancel
              </SecondaryButton>
            </div>
          </>
        ) : (
          <>
            <div className='py-4 text-base'>
              Which teams would you like to add <strong>{domainJoinRequest.createdByEmail}</strong>{' '}
              to?
            </div>
            <div className='overflow-y-scroll pb-2 text-fg-primary text-sm leading-relaxed'>
              {sortedTeams.map((team) => {
                const {id: teamId, name: teamName, organization, teamMembers} = team
                const {name: orgName} = organization
                const isAlreadyMember = teamMembers.some(
                  (member) => member.userId === domainJoinRequest.createdBy
                )
                const active = selectedTeamsIds.includes(teamId) || isAlreadyMember

                const handleClick = () => {
                  if (isAlreadyMember) return
                  if (active) {
                    setSelectedTeamsIds((prev) => prev.filter((id) => id !== teamId))
                  } else {
                    setSelectedTeamsIds((prev) => [...prev, teamId])
                  }
                }

                return (
                  <div
                    className='mb-2 flex items-center text-base'
                    key={teamId}
                    onClick={handleClick}
                  >
                    <Checkbox
                      active={active}
                      disabled={isAlreadyMember}
                      className={active && !isAlreadyMember ? 'text-accent' : undefined}
                    />
                    <label
                      className={`ml-2 ${
                        isAlreadyMember ? 'cursor-not-allowed opacity-[.38]' : 'cursor-pointer'
                      }`}
                    >
                      {teamName} | {orgName}
                    </label>
                  </div>
                )
              })}
            </div>
            <div className='flex w-full justify-end gap-2 pt-2'>
              <SecondaryButton onClick={onClose} size='small' disabled={submitting}>
                Cancel
              </SecondaryButton>
              <PrimaryButton size='small' onClick={onAdd} disabled={submitting}>
                Add to teams
              </PrimaryButton>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ReviewRequestToJoinOrgModal
