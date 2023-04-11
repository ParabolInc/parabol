import React, {useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {CategoryID} from './ActivityCard'
import {ActivityLibraryCard, ActivityLibraryCardBadge} from './ActivityLibraryCard'
import {Add as AddIcon} from '@mui/icons-material'
import {CATEGORY_ID_TO_NAME} from './ActivityLibrary'
import clsx from 'clsx'
import useModal from '../../hooks/useModal'
import NewMeetingTeamPicker from '../NewMeetingTeamPicker'
import {MenuPosition} from '../../hooks/useCoords'
import {useFragment} from 'react-relay'
import {CreateActivityCard_teams$key} from '~/__generated__/CreateActivityCard_teams.graphql'
import {CreateActivityCard_modalTeams$key} from '~/__generated__/CreateActivityCard_modalTeams.graphql'
import sortByTier from '../../utils/sortByTier'
import useMutationProps from '../../hooks/useMutationProps'
import useAtmosphere from '../../hooks/useAtmosphere'
import AddReflectTemplateMutation from '../../mutations/AddReflectTemplateMutation'
import {AddReflectTemplateMutation$data} from '~/__generated__/AddReflectTemplateMutation.graphql'
import {useHistory} from 'react-router'

interface Props {
  category: CategoryID
  className?: string
  teamsRef: CreateActivityCard_teams$key
}

const CreateActivityCard = (props: Props) => {
  const {category, className, teamsRef} = props
  const teams = useFragment(
    graphql`
      fragment CreateActivityCard_teams on Team @relay(plural: true) {
        ...CreateActivityCard_modalTeams
      }
    `,
    teamsRef
  )

  const {togglePortal, modalPortal, closePortal} = useModal({
    id: 'templateTeamPickerModal'
  })

  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()

  const history = useHistory()

  const handleSelectTeam = (teamId: string) => {
    if (submitting) {
      return
    }

    closePortal()

    // if (reflectTemplates.length >= Threshold.MAX_RETRO_TEAM_TEMPLATES) {
    //   onError(new Error('You may only have 20 templates per team. Please remove one first.'))
    //   errorTimerId.current = window.setTimeout(() => {
    //     onCompleted()
    //   }, 8000)
    //   return
    // }
    // if (reflectTemplates.find((template) => template.name === '*New Template')) {
    //   onError(new Error('You already have a new template. Try renaming that one first.'))
    //   errorTimerId.current = window.setTimeout(() => {
    //     onCompleted()
    //   }, 8000)
    //   return
    // }

    submitMutation()
    AddReflectTemplateMutation(
      atmosphere,
      {teamId},
      {
        onError,
        onCompleted: (res: AddReflectTemplateMutation$data) => {
          const templateId = res.addReflectTemplate?.reflectTemplate?.id
          if (templateId) {
            history.push(`/activity-library/details/${templateId}`)
          }
          onCompleted()
        }
      }
    )
  }

  return (
    <>
      <div className='flex' onClick={togglePortal}>
        <ActivityLibraryCard
          className={clsx('cursor-pointer', className)}
          category={category}
          badge={<ActivityLibraryCardBadge>Premium</ActivityLibraryCardBadge>}
        >
          <div className='mx-10 flex flex-1 flex-col items-center justify-center text-center font-semibold'>
            <div className='h-12 w-12'>
              <AddIcon style={{width: '100%', height: '100%'}} className='text-slate-700' />
            </div>
            Create Custom {CATEGORY_ID_TO_NAME[category]} Activity
          </div>
        </ActivityLibraryCard>
      </div>
      {modalPortal(<TeamPickerModal teamsRef={teams} onPickTeam={handleSelectTeam} />)}
    </>
  )
}

interface TeamPickerModalProps {
  teamsRef: CreateActivityCard_modalTeams$key
  onPickTeam: (teamId: string) => void
}

const TeamPickerModal = (props: TeamPickerModalProps) => {
  const {teamsRef, onPickTeam} = props
  const teams = useFragment(
    graphql`
      fragment CreateActivityCard_modalTeams on Team @relay(plural: true) {
        id
        tier
        name
        ...NewMeetingTeamPicker_selectedTeam
        ...NewMeetingTeamPicker_teams
      }
    `,
    teamsRef
  )

  const [selectedTeam, setSelectedTeam] = useState(sortByTier(teams)[0]!)

  return (
    <div className='bg-white p-6'>
      <div className='flex flex-col gap-4'>
        <div>
          <b>Select the team</b> to manage this new activity template:
        </div>
        <NewMeetingTeamPicker
          parentId='templateTeamPickerModal'
          positionOverride={MenuPosition.UPPER_LEFT}
          onSelectTeam={(teamId) => {
            const newTeam = teams.find((team) => team.id === teamId)
            newTeam && setSelectedTeam(newTeam)
          }}
          selectedTeamRef={selectedTeam}
          teamsRef={teams}
        />
        <button
          className={clsx(
            'w-max cursor-pointer self-end rounded-full bg-sky-500 px-4 py-2 text-center font-sans text-base font-medium text-white hover:bg-sky-600'
          )}
          onClick={() => onPickTeam(selectedTeam.id)}
        >
          Select Team
        </button>
      </div>
    </div>
  )
}

export default CreateActivityCard
