import graphql from 'babel-plugin-relay/macro'
import {Fragment, ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {PublicTeamsModal_team$key} from '../../__generated__/PublicTeamsModal_team.graphql'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import plural from '../../utils/plural'
import PublicTeamItem from './PublicTeamItem'

type Props = {
  isOpen: boolean
  onClose: () => void
  orgName: string
  teamsRef: PublicTeamsModal_team$key
  actions?: ReactNode
}

const PublicTeamsModal = (props: Props) => {
  const {isOpen, onClose, teamsRef, orgName, actions} = props

  const publicTeams = useFragment(
    graphql`
      fragment PublicTeamsModal_team on Team @relay(plural: true) {
        id
        lastMetAt
        ...PublicTeamItem_team
      }
    `,
    teamsRef
  )
  const publicTeamsCount = publicTeams.length

  const sortedTeams = [...publicTeams].sort((a, b) => {
    if (!a.lastMetAt) return 1
    if (!b.lastMetAt) return -1
    return new Date(b.lastMetAt).getTime() - new Date(a.lastMetAt).getTime()
  })

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10 flex flex-col pr-0'>
        <DialogTitle>{`${publicTeamsCount} ${plural(publicTeamsCount, 'Public Team', 'Public Teams')}`}</DialogTitle>
        <DialogDescription className='pr-6'>
          Join as a Team Member on any public teams at{' '}
          <span className='font-semibold'>{orgName}</span>
        </DialogDescription>
        <div className='overflow-auto pr-6'>
          {sortedTeams.map((team) => (
            <Fragment key={team.id}>
              <hr className='my-2 border-t border-slate-300' />
              <PublicTeamItem teamRef={team} />
            </Fragment>
          ))}
        </div>
        {actions}
      </DialogContent>
    </Dialog>
  )
}

export default PublicTeamsModal
