import graphql from 'babel-plugin-relay/macro'
import React, {useState, useMemo} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import {ReviewRequestToJoinOrgModalQuery} from '../__generated__/ReviewRequestToJoinOrgModalQuery.graphql'
import Checkbox from './Checkbox'
import useAtmosphere from '../hooks/useAtmosphere'
import AcceptRequestToJoinDomainMutation from '../mutations/AcceptRequestToJoinDomainMutation'

graphql`
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
        isLead
        teamMembers(sortBy: "preferredName") {
          userId
        }
        organization {
          name
          activeDomain
        }
      }
    }
  }
`

const query = graphql`
  query ReviewRequestToJoinOrgModalQuery($requestId: ID!) {
    viewer {
      domainJoinRequest(requestId: $requestId) {
        id
        createdByEmail
        createdBy
        domain
        teams {
          id
          name
          isLead
          teamMembers(sortBy: "preferredName") {
            userId
          }
          organization {
            name
            activeDomain
          }
        }
      }
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

  const atmosphere = useAtmosphere()

  const data = usePreloadedQuery<ReviewRequestToJoinOrgModalQuery>(query, queryRef)

  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  const {domainJoinRequest} = data.viewer

  const teams = domainJoinRequest?.teams
  const sortedTeams = useMemo(() => {
    if (!teams) {
      return []
    }

    return teams?.slice().sort((a, b) => a.organization.name.localeCompare(b.organization.name))
  }, [teams])

  if (!domainJoinRequest) {
    return null
  }

  const {createdBy, createdByEmail, id: requestId} = domainJoinRequest

  const onAdd = () => {
    AcceptRequestToJoinDomainMutation(atmosphere, {
      requestId,
      teamIds: selectedTeams
    })
  }

  return (
    <DialogContainer>
      <DialogTitle>{'Add teammate'}</DialogTitle>
      <DialogContent>
        <div className={'mb-4 text-base'}>
          Which teams would you like to add <strong>{createdByEmail}</strong> to?
        </div>

        <div>
          {sortedTeams.map((team) => {
            const {id: teamId, name: teamName, organization, teamMembers} = team
            const {name: orgName} = organization

            // TODO: implement userId filter for teamMembers on API side
            const isAlreadyMember = teamMembers.some((member) => member.userId === createdBy)
            const active = selectedTeams.includes(teamId) || isAlreadyMember

            const handleClick = () => {
              if (isAlreadyMember) return

              if (active) {
                setSelectedTeams((prevSelectedTeams) =>
                  prevSelectedTeams.filter((id) => id !== teamId)
                )
              } else {
                setSelectedTeams((prevSelectedTeams) => [...prevSelectedTeams, teamId])
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

        <div className={'mt-6 flex w-full justify-end'}>
          <div className={'mr-2'}>
            <SecondaryButton onClick={closePortal} size='small'>
              Cancel
            </SecondaryButton>
          </div>
          <PrimaryButton size='small' onClick={onAdd}>
            Add to teams
          </PrimaryButton>
        </div>
      </DialogContent>
    </DialogContainer>
  )
}

export default ReviewRequestToJoinOrgModal
