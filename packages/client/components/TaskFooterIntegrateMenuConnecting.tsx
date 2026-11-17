import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSeparator} from '../ui/Menu/MenuSeparator'
import {Spinner} from '../ui/Spinner/Spinner'

interface Props {
  title: string
  onCancel: () => void
}

const TaskFooterIntegrateMenuConnecting = ({title, onCancel}: Props) => (
  <>
    <div className='flex items-center gap-3 px-4 py-3' aria-live='polite'>
      <Spinner className='h-5 w-5 flex-none' />
      <div>
        <div className='font-semibold text-fg-primary text-sm'>{`Connecting ${title}…`}</div>
        <div className='text-fg-secondary text-xs'>Finish in the window that opened.</div>
      </div>
    </div>
    <MenuSeparator />
    <MenuItem
      className='pl-3 text-fg-secondary'
      onSelect={(event) => {
        event.preventDefault()
        onCancel()
      }}
    >
      Cancel
    </MenuItem>
  </>
)

export default TaskFooterIntegrateMenuConnecting
