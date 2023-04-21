import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState, Suspense} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import {ReviewRequestToJoinOrgModalQuery} from '../__generated__/ReviewRequestToJoinOrgModalQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import Checkbox from './Checkbox'
import {PALETTE} from '../styles/paletteV3'

const ButtonGroup = styled('div')({
  marginTop: '24px',
  display: 'flex',
  width: '100%',
  justifyContent: 'flex-end'
})

const query = graphql`
  query ReviewRequestToJoinOrgModalQuery {
    viewer {
      teams {
        id
        name
        teamMembers(sortBy: "preferredName") {
          userId
          preferredName
        }
        organization {
          name
        }
      }
    }
  }
`

interface TeamListProps {
  queryRef: PreloadedQuery<ReviewRequestToJoinOrgModalQuery>
  requestCreatedBy: string
}

const TeamsList = (props: TeamListProps) => {
  const {queryRef, requestCreatedBy} = props
  const data = usePreloadedQuery<ReviewRequestToJoinOrgModalQuery>(query, queryRef)
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const teams = data.viewer.teams
  const sortedTeams = teams
    .slice()
    .sort((a, b) => a.organization.name.localeCompare(b.organization.name))

  return (
    <div>
      {sortedTeams.map((team) => {
        const {id: teamId, name: teamName, organization} = team
        const {name: orgName} = organization

        // TODO: implement filter on API side
        const disabled = !!team.teamMembers.find((member) => member.userId === requestCreatedBy)
        const active = selectedTeams.includes(teamId) || disabled

        const handleClick = () => {
          if (disabled) return

          if (active) {
            setSelectedTeams((prevSelectedTeams) => prevSelectedTeams.filter((id) => id !== teamId))
          } else {
            setSelectedTeams((prevSelectedTeams) => [...prevSelectedTeams, teamId])
          }
        }

        return (
          <div className='mb-2 flex items-center text-base' key={teamId}>
            <Checkbox
              active={active}
              disabled={disabled}
              onClick={handleClick}
              color={active && !disabled ? PALETTE.SKY_500 : undefined}
            />
            <label className={`ml-2 ${disabled ? 'opacity-[.38]' : ''}`}>
              {teamName} | {orgName}
            </label>
          </div>
        )
      })}
    </div>
  )
}

interface Props {
  closePortal: () => void
  requestCreatedBy: string
  email: string
}

const ReviewRequestToJoinOrgModal = (props: Props) => {
  const {closePortal, email, requestCreatedBy} = props

  const queryRef = useQueryLoaderNow<ReviewRequestToJoinOrgModalQuery>(query)

  return (
    <DialogContainer>
      <DialogTitle>{'Add teammate'}</DialogTitle>
      <DialogContent>
        <div className={'mb-4 text-base'}>
          Which teams would you like to add <strong>{email}</strong> to?
        </div>
        <Suspense fallback='Loading...'>
          {queryRef && <TeamsList requestCreatedBy={requestCreatedBy} queryRef={queryRef} />}
        </Suspense>

        <ButtonGroup>
          <div className={'mr-2'}>
            <SecondaryButton onClick={closePortal} size='small'>
              Cancel
            </SecondaryButton>
          </div>
          <PrimaryButton size='small'>Add to teams</PrimaryButton>
        </ButtonGroup>
      </DialogContent>
    </DialogContainer>
  )
}

export default ReviewRequestToJoinOrgModal
