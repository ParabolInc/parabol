import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import {ReviewRequestToJoinOrgModalQuery} from '../__generated__/ReviewRequestToJoinOrgModalQuery.graphql'
import Checkbox from './Checkbox'

const query = graphql`
  query ReviewRequestToJoinOrgModalQuery($requestId: ID!) {
    viewer {
      domainJoinRequest(requestId: $requestId) {
        createdByEmail
        createdBy
      }
      teams {
        id
        name
        teamMembers(sortBy: "preferredName") {
          userId
        }
        organization {
          name
        }
      }
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

  const data = usePreloadedQuery<ReviewRequestToJoinOrgModalQuery>(query, queryRef)

  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const teams = data.viewer.teams
  const sortedTeams = teams
    .slice()
    .sort((a, b) => a.organization.name.localeCompare(b.organization.name))

  const {domainJoinRequest} = data.viewer

  if (!domainJoinRequest) {
    return null
  }

  const {createdBy, createdByEmail} = domainJoinRequest

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

            // TODO: implement filter on API side
            const disabled = !!teamMembers.find((member) => member.userId === createdBy)
            const active = selectedTeams.includes(teamId) || disabled

            const handleClick = () => {
              if (disabled) return

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
                  disabled={disabled}
                  className={active && !disabled ? `text-sky-500` : undefined}
                />
                <label className={`ml-2 cursor-pointer ${disabled ? 'opacity-[.38]' : ''}`}>
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
          <PrimaryButton size='small'>Add to teams</PrimaryButton>
        </div>
      </DialogContent>
    </DialogContainer>
  )
}

export default ReviewRequestToJoinOrgModal
