import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {InspirationSourceTiles_teamMember$key} from '../../../__generated__/InspirationSourceTiles_teamMember.graphql'
import InspirationMoreSources from './InspirationMoreSources'
import InspirationSourceTile from './InspirationSourceTile'
import type {InspirationSourceService, InspirationSourceSettings} from './inspirationSources'
import layoutInspirationSources from './layoutInspirationSources'
import type {InspirationSourceAvailability} from './listInspirationSources'

interface Props {
  sources: InspirationSourceAvailability[]
  issueCounts: Partial<Record<string, number>>
  countingServices: string[]
  canDraft: boolean
  settings: InspirationSourceSettings
  setSettings: (update: (prev: InspirationSourceSettings) => InspirationSourceSettings) => void
  onPopoverClose: () => void
  teamMemberRef: InspirationSourceTiles_teamMember$key
}

interface HeldLayout {
  row: InspirationSourceService[]
  more: InspirationSourceService[]
}

const InspirationSourceTiles = (props: Props) => {
  const {sources, issueCounts, countingServices, onPopoverClose, teamMemberRef, ...tileProps} =
    props
  const teamMember = useFragment(
    graphql`
      fragment InspirationSourceTiles_teamMember on TeamMember {
        ...InspirationSourcePopover_teamMember
        team {
          recentOrgServices
        }
      }
    `,
    teamMemberRef
  )
  const [heldLayout, setHeldLayout] = useState<HeldLayout | null>(null)
  const liveLayout = layoutInspirationSources(
    sources,
    tileProps.settings.kinds,
    teamMember.team?.recentOrgServices ?? []
  )
  const findSources = (services: InspirationSourceService[]) =>
    services.flatMap((service) => sources.filter((source) => source.service === service))
  const {row, more} = heldLayout
    ? {row: findSources(heldLayout.row), more: findSources(heldLayout.more)}
    : liveLayout
  const onTileOpenChange = (open: boolean) => {
    if (open) {
      setHeldLayout({
        row: row.map(({service}) => service),
        more: more.map(({service}) => service)
      })
    } else {
      setHeldLayout(null)
      onPopoverClose()
    }
  }
  const renderTile = ({service, isConnected}: InspirationSourceAvailability) => (
    <InspirationSourceTile
      key={service}
      service={service}
      isConnected={isConnected}
      issueCount={issueCounts[service]}
      isCounting={countingServices.includes(service)}
      onOpenChange={onTileOpenChange}
      teamMemberRef={teamMember}
      {...tileProps}
    />
  )
  const heading = tileProps.canDraft ? 'Draft from' : 'Work from'
  return (
    <div role='group' aria-label={heading} className='flex flex-col gap-2'>
      <span className='font-bold text-[11px] text-fg-muted uppercase tracking-wider'>
        {heading}
      </span>
      <div className='flex flex-wrap gap-2'>
        {row.map(renderTile)}
        {more.length > 0 && (
          <InspirationMoreSources count={more.length}>
            {more.map(renderTile)}
          </InspirationMoreSources>
        )}
      </div>
    </div>
  )
}

export default InspirationSourceTiles
