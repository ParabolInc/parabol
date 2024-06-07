import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PublicTeamsModal_team$key} from '../../__generated__/PublicTeamsModal_team.graphql'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import plural from '../../utils/plural'
import SecondaryButton from '../SecondaryButton'

type Props = {
  isOpen: boolean
  onClose: () => void
  orgName: string
  teamsRef: PublicTeamsModal_team$key
}

const PublicTeamsModal = (props: Props) => {
  const {isOpen, onClose, teamsRef, orgName} = props

  const publicTeams = useFragment(
    graphql`
      fragment PublicTeamsModal_team on Team @relay(plural: true) {
        id
        name
      }
    `,
    teamsRef
  )
  const publicTeamsCount = publicTeams.length

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10'>
        <DialogTitle>{`${publicTeamsCount} ${plural(publicTeamsCount, 'Public Team', 'Public Teams')}`}</DialogTitle>
        <DialogDescription>
          Request to join as a Team Member on any public teams at{' '}
          <span className='font-semibold'>{orgName}</span>
        </DialogDescription>
        <hr className='my-2 border-t border-slate-300' />
        {publicTeams.map((team, index) => (
          <React.Fragment key={team.id}>
            <div className='flex items-center justify-between py-2'>
              <span className='text-lg font-semibold'>{team.name}</span>
              <SecondaryButton size='medium'>Request to Join</SecondaryButton>
            </div>
            {index < publicTeams.length - 1 && <hr className='my-2 border-t border-slate-300' />}
          </React.Fragment>
        ))}
      </DialogContent>
    </Dialog>
  )
}

export default PublicTeamsModal
