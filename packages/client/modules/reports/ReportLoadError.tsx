import {Button} from '../../ui/Button/Button'

interface Props {
  onRetry: () => void
}

const ReportLoadError = ({onRetry}: Props) => (
  <div role='alert' className='flex flex-wrap items-center gap-3 text-fg-secondary text-sm'>
    This report couldn’t load.
    <Button variant='outline' size='sm' onClick={onRetry}>
      Try again
    </Button>
  </div>
)

export default ReportLoadError
