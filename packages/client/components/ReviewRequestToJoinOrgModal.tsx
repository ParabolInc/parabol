import graphql from 'babel-plugin-relay/macro'
import {useMemo, useState} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {ReviewRequestToJoinOrgModalQuery} from '../__generated__/ReviewRequestToJoinOrgModalQuery.graphql'
import {ReviewRequestToJoinOrgModal_viewer$key} from '../__generated__/ReviewRequestToJoinOrgModal_viewer.graphql'
import useAcceptRequestToJoinDomainMutation from '../mutations/useAcceptRequestToJoinDomainMutation'
import Checkbox from './Checkbox'
import DialogContainer from './DialogContainer'
import DialogTitle from './DialogTitle'
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
  closePortal: () => void
  queryRef: PreloadedQuery<ReviewRequestToJoinOrgModalQuery>
}

// TODO: Create generic dialog components using tailwind https://github.com/ParabolInc/parabol/issues/8107
const ReviewRequestToJoinOrgModal = (props: Props) => {
  const {closePortal, queryRef} = props

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
    if (!teams) {
      return []
    }

    return teams?.slice().sort((a, b) => a.organization.name.localeCompare(b.organization.name))
  }, [teams])

  if (!domainJoinRequest) {
    return (
      <DialogContainer>
        <DialogTitle>{'Add teammate'}</DialogTitle>
        <div className={'overflow-y-scroll p-6 text-sm leading-relaxed text-slate-700'}>
          Request expired or deleted
        </div>
        <div className={'flex w-full justify-end px-6 pb-6'}>
          <div className={'mr-2'}>
            <SecondaryButton onClick={closePortal} size='small'>
              Cancel
            </SecondaryButton>
          </div>
        </div>
      </DialogContainer>
    )
  }

  const {createdBy, createdByEmail, id: requestId} = domainJoinRequest

  const onAdd = () => {
    commit(
      {
        variables: {
          requestId,
          teamIds: selectedTeamsIds
        }
      },
      {
        onSuccess: closePortal
      }
    )
  }

  return (
    <DialogContainer>
      <DialogTitle>{'Add teammate'}</DialogTitle>
      <div className={'py-4 pl-6 text-base'}>
        Which teams would you like to add <strong>{createdByEmail}</strong> to?
      </div>
      <div className={'overflow-y-scroll px-6 pb-6 text-sm leading-relaxed text-slate-700'}>
        {sortedTeams.map((team) => {
          const {id: teamId, name: teamName, organization, teamMembers} = team
          const {name: orgName} = organization

          // TODO: implement userId filter for teamMembers on API side
          const isAlreadyMember = teamMembers.some((member) => member.userId === createdBy)
          const active = selectedTeamsIds.includes(teamId) || isAlreadyMember

          const handleClick = () => {
            if (isAlreadyMember) return

            if (active) {
              setSelectedTeamsIds((prevSelectedTeamsIds) =>
                prevSelectedTeamsIds.filter((id) => id !== teamId)
              )
            } else {
              setSelectedTeamsIds((prevSelectedTeamsIds) => [...prevSelectedTeamsIds, teamId])
            }
          }

          return (
            <div className='mb-2 flex items-center text-base' key={teamId} onClick={handleClick}>
              <Checkbox
                active={active}
                disabled={isAlreadyMember}
                className={active && !isAlreadyMember ? `text-sky-500` : undefined}
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
      <div className={'flex w-full justify-end p-4'}>
        <div className={'mr-2'}>
          <SecondaryButton onClick={closePortal} size='small' disabled={submitting}>
            Cancel
          </SecondaryButton>
        </div>
        <PrimaryButton size='small' onClick={onAdd} disabled={submitting}>
          Add to teams
        </PrimaryButton>
      </div>
    </DialogContainer>
  )
}

export default ReviewRequestToJoinOrgModal
