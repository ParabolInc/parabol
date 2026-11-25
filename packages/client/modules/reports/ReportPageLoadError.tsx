import {useRouter} from '@tanstack/react-router'
import ReportLoadError from './ReportLoadError'

// Trying again runs the route's loader again, which asks for the results again
const ReportPageLoadError = () => {
  const router = useRouter()
  return (
    <div className='px-4 pt-4 sm:px-8'>
      <ReportLoadError onRetry={() => router.invalidate()} />
    </div>
  )
}

export default ReportPageLoadError
