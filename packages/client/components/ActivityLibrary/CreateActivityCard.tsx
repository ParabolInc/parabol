import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {CategoryID} from './ActivityCard'
import {ActivityLibraryCard, ActivityLibraryCardBadge} from './ActivityLibraryCard'
import {Add as AddIcon} from '@mui/icons-material'
import {CATEGORY_ID_TO_NAME} from './ActivityLibrary'
import clsx from 'clsx'
import useModal from '../../hooks/useModal'
import {useFragment} from 'react-relay'
import {CreateActivityCard_teams$key} from '~/__generated__/CreateActivityCard_teams.graphql'
import {CreateActivityCard_templates$key} from '~/__generated__/CreateActivityCard_templates.graphql'
import TeamPickerModal from './TeamPickerModal'

interface Props {
  category: CategoryID
  className?: string
  teamsRef: CreateActivityCard_teams$key
  templatesRef: CreateActivityCard_templates$key
}

const CreateActivityCard = (props: Props) => {
  const {category, className, teamsRef, templatesRef} = props
  const teams = useFragment(
    graphql`
      fragment CreateActivityCard_teams on Team @relay(plural: true) {
        ...TeamPickerModal_teams
      }
    `,
    teamsRef
  )

  const templates = useFragment(
    graphql`
      fragment CreateActivityCard_templates on MeetingTemplate @relay(plural: true) {
        ...TeamPickerModal_templates
      }
    `,
    templatesRef
  )

  const {togglePortal, modalPortal, closePortal} = useModal({
    id: 'templateTeamPickerModal'
  })

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
              <AddIcon style={{height: '100%', width: '100%'}} className='text-slate-700' />
            </div>
            Create Custom {CATEGORY_ID_TO_NAME[category]} Activity
          </div>
        </ActivityLibraryCard>
      </div>
      {modalPortal(
        <TeamPickerModal
          category={category}
          teamsRef={teams}
          templatesRef={templates}
          closePortal={closePortal}
        />
      )}
    </>
  )
}

export default CreateActivityCard
