import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {ArchiveTeam_team$key} from '~/__generated__/ArchiveTeam_team.graphql'
import {Button} from '~/ui/Button/Button'
import IconLabel from '../../../../components/IconLabel'
import ArchiveTeamForm from './ArchiveTeamForm'

interface Props {
  team: ArchiveTeam_team$key
}

const ArchiveTeam = (props: Props) => {
  const {team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment ArchiveTeam_team on Team {
        ...ArchiveTeamForm_team
      }
    `,
    teamRef
  )
  const [showConfirmationField, setShowConfirmationField] = useState(false)
  const handleClick = () => {
    setShowConfirmationField(true)
  }
  const handleCancel = () => {
    setShowConfirmationField(false)
  }
  return (
    <div>
      {!showConfirmationField ? (
        <div>
          <Button
            size='default'
            aria-label='Click to permanently delete this team.'
            className='bg-transparent p-0 text-[14px] text-tomato-600 leading-5 shadow-none hover:text-tomato-800 focus:text-tomato-800 active:text-tomato-800'
            onClick={handleClick}
          >
            <IconLabel icon='remove_circle' label='Delete Team' />
          </Button>
          <div className='mt-2 text-[13px] text-fg-secondary'>
            <b>Note</b>: {'This can’t be undone.'}
          </div>
        </div>
      ) : (
        <ArchiveTeamForm handleCancel={handleCancel} team={team} />
      )}
    </div>
  )
}

export default ArchiveTeam
