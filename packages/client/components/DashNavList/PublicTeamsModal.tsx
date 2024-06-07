import React from 'react'
import {DashNavListTeam$data} from '../../__generated__/DashNavListTeam.graphql'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import plural from '../../utils/plural'
import SecondaryButton from '../SecondaryButton'

type Props = {
  isOpen: boolean
  onClose: () => void
  publicTeams: DashNavListTeam$data[]
}

const PublicTeamsModal = (props: Props) => {
  const {isOpen, onClose, publicTeams} = props
  const publicTeamsCount = publicTeams.length
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10'>
        <DialogTitle>{`${publicTeamsCount} ${plural(publicTeamsCount, 'Public Team', 'Public Teams')}`}</DialogTitle>
        <DialogDescription>
          Request to join as a Team Member on any public teams at Narra Technologies
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
