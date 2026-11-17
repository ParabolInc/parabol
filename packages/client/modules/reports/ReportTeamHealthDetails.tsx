import {useContext, useRef} from 'react'
import {createPortal} from 'react-dom'
import type {PreloadedQuery} from 'react-relay'
import type {ReportTeamHealthCellDetailsQuery} from '../../__generated__/ReportTeamHealthCellDetailsQuery.graphql'
import ResponsiveDashSidebar from '../../components/ResponsiveDashSidebar'
import TeamPromptMobileSheet from '../../components/TeamPrompt/mobile/TeamPromptMobileSheet'
import ReportDrawerSlotContext from './ReportDrawerSlotContext'
import ReportTeamHealthAside from './ReportTeamHealthAside'
import ReportTeamHealthCellRoot from './ReportTeamHealthCellRoot'
import type {ReportTeamHealthSelection} from './reportTeamHealthCells'
import {formatAnswered, formatCheckDate, toOrdinal} from './reportTeamHealthWords'

interface Props {
  selection: ReportTeamHealthSelection | null
  queryRef: PreloadedQuery<ReportTeamHealthCellDetailsQuery> | null | undefined
  isDrawer: boolean
  onClose: () => void
}

const DRAWER_WIDTH = 360

// The selected cell in a right drawer that pushes the page over when there's room, or in a bottom sheet. Both keep
// showing the cell they had while they slide away
const ReportTeamHealthDetails = (props: Props) => {
  const {selection, queryRef, isDrawer, onClose} = props
  const drawerSlot = useContext(ReportDrawerSlotContext)
  const lastSelectionRef = useRef(selection)
  if (selection) lastSelectionRef.current = selection
  const shownSelection = selection ?? lastSelectionRef.current
  const meta =
    shownSelection &&
    `${toOrdinal(shownSelection.cell.check.checkNumber)} check · ${formatCheckDate(shownSelection.cell.check.endedAt)} · ${formatAnswered(shownSelection.cell.check)} answered`
  const body = shownSelection && (
    <ReportTeamHealthCellRoot
      key={shownSelection.cell.key}
      queryRef={queryRef}
      selection={shownSelection}
    />
  )
  if (isDrawer) {
    if (!drawerSlot) return null
    return createPortal(
      <ResponsiveDashSidebar
        isOpen={!!selection}
        isRightDrawer
        isDesktop
        onToggle={onClose}
        sidebarWidth={DRAWER_WIDTH}
      >
        {shownSelection && meta && (
          <ReportTeamHealthAside selection={shownSelection} meta={meta} onClose={onClose}>
            {body}
          </ReportTeamHealthAside>
        )}
      </ResponsiveDashSidebar>,
      drawerSlot
    )
  }
  if (!shownSelection) return null
  return (
    <TeamPromptMobileSheet
      isOpen={!!selection}
      onClose={onClose}
      title={`${shownSelection.teamName} · ${shownSelection.categoryName}`}
      isFullHeight
    >
      <div className='flex flex-col gap-3 px-4 pt-3 pb-6'>
        <span className='text-[13px] text-fg-muted'>{meta}</span>
        {body}
      </div>
    </TeamPromptMobileSheet>
  )
}

export default ReportTeamHealthDetails
