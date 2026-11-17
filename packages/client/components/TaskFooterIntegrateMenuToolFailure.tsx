import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSeparator} from '../ui/Menu/MenuSeparator'

interface Props {
  titles: readonly string[]
  othersWork: boolean
  onRetry: () => void
}

const joinTitles = (titles: readonly string[]) =>
  titles.length < 2 ? titles.join('') : `${titles.slice(0, -1).join(', ')} and ${titles.at(-1)}`

const TaskFooterIntegrateMenuToolFailure = ({titles, othersWork, onRetry}: Props) => (
  <>
    <MenuSeparator />
    <div className='px-4 pt-2 text-fg-primary text-sm' role='status'>
      {`${joinTitles(titles)} didn't respond.`}
      {othersWork && ' Your other tools still work.'}
    </div>
    <MenuItem
      className='pl-3 font-semibold text-accent'
      onSelect={(event) => {
        event.preventDefault()
        onRetry()
      }}
    >
      Try again
    </MenuItem>
  </>
)

export default TaskFooterIntegrateMenuToolFailure
