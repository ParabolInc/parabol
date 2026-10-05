import type {InspirationSourcePopover_teamMember$key} from '../../../__generated__/InspirationSourcePopover_teamMember.graphql'
import InspirationSourceTile from './InspirationSourceTile'
import type {InspirationSourceSettings} from './inspirationSources'
import type {InspirationSourceAvailability} from './useInspirationSourceAvailability'

interface Props {
  sources: InspirationSourceAvailability[]
  issueCounts: Partial<Record<string, number>>
  countingServices: string[]
  canDraft: boolean
  meetingId: string
  settings: InspirationSourceSettings
  setSettings: (update: (prev: InspirationSourceSettings) => InspirationSourceSettings) => void
  onPopoverClose: () => void
  teamMemberRef: InspirationSourcePopover_teamMember$key
}

const InspirationSourceTiles = (props: Props) => {
  const {sources, issueCounts, countingServices, onPopoverClose, ...tileProps} = props
  const heading = tileProps.canDraft ? 'Draft from' : 'Work from'
  return (
    <div role='group' aria-label={heading} className='flex flex-col gap-2'>
      <span className='font-bold text-[11px] text-fg-muted uppercase tracking-wider'>
        {heading}
      </span>
      <div className='flex flex-wrap gap-2'>
        {sources.map(({service, isConnected}) => (
          <InspirationSourceTile
            key={service}
            service={service}
            isConnected={isConnected}
            issueCount={issueCounts[service]}
            isCounting={countingServices.includes(service)}
            onClose={onPopoverClose}
            {...tileProps}
          />
        ))}
      </div>
    </div>
  )
}

export default InspirationSourceTiles
