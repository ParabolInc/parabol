import {useRef} from 'react'
import TeamPromptMobileSheet from '../../components/TeamPrompt/mobile/TeamPromptMobileSheet'
import ReportTeamHealthAside from './ReportTeamHealthAside'
import ReportTeamHealthAttention from './ReportTeamHealthAttention'
import ReportTeamHealthCellRoot from './ReportTeamHealthCellRoot'
import type {ReportTeamHealthSelection} from './reportTeamHealthCells'
import {formatAnswered, formatCheckDate, toOrdinal} from './reportTeamHealthWords'

interface Props {
  orgId: string
  selection: ReportTeamHealthSelection | null
  markedCount: number
  isSidePanel: boolean
  onClose: () => void
}

// The selected cell beside the table when there's room, or in a bottom sheet. The sheet keeps showing the cell it
// had while it slides away
const ReportTeamHealthDetails = (props: Props) => {
  const {orgId, selection, markedCount, isSidePanel, onClose} = props
  const lastSelectionRef = useRef(selection)
  if (selection) lastSelectionRef.current = selection
  const shownSelection = selection ?? lastSelectionRef.current
  if (!shownSelection || (isSidePanel && !selection)) return null
  const {check} = shownSelection.cell
  const meta = `${toOrdinal(check.checkNumber)} check · ${formatCheckDate(check.endedAt)} · ${formatAnswered(check)} answered`
  const body = (
    <div className='flex flex-col gap-4'>
      <ReportTeamHealthAttention cell={shownSelection.cell} markedCount={markedCount} />
      <ReportTeamHealthCellRoot
        key={shownSelection.cell.key}
        orgId={orgId}
        selection={shownSelection}
      />
    </div>
  )
  if (isSidePanel) {
    return (
      <ReportTeamHealthAside selection={shownSelection} meta={meta} onClose={onClose}>
        {body}
      </ReportTeamHealthAside>
    )
  }
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
