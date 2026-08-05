import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {ArchiveTeam_team$key} from '~/__generated__/ArchiveTeam_team.graphql'
import IconLabel from '../../../../components/IconLabel'
import LinkButton from '../../../../components/LinkButton'
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
          <LinkButton
            aria-label='Click to permanently delete this team.'
            palette='red'
            onClick={handleClick}
          >
            <IconLabel icon='remove_circle' label='Delete Team' />
          </LinkButton>
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
