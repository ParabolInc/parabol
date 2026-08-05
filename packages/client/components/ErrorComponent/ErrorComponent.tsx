import {useState} from 'react'
import PrimaryButton from '~/components/PrimaryButton'
import ReportErrorFeedback, {ERROR_FEEDBACK_ENABLED} from '~/components/ReportErrorFeedback'
import {twStyled} from '../../ui/twStyled'
import {
  isExtensionError,
  isIgnoredError,
  isNetworkError,
  isOldBrowserError
} from '../../utils/errorFilters'

const ErrorBlock = twStyled('div')(
  'flex h-full w-full flex-col items-center justify-center text-center'
)

interface Props {
  error: Error
  eventId: string
}

const ErrorComponent = (props: Props) => {
  const {error, eventId} = props
  if (!isIgnoredError(error)) {
    console.error(error)
  }
  const [isOpen, setIsOpen] = useState(false)

  if (isExtensionError(error)) {
    return (
      <ErrorBlock>
        <div>
          Oh no! Seems like you're using Google Translate or a similar extension, which has a bug in
          it that can crash apps like ours.
        </div>
        <div>If this continues, please disable the extension</div>
        <PrimaryButton className='mt-2' onClick={() => window.location.reload()}>
          Refresh the page
        </PrimaryButton>
      </ErrorBlock>
    )
  }

  if (isOldBrowserError(error)) {
    const url = 'https://browser-update.org/update-browser.html'
    return (
      <ErrorBlock>
        {"Oh no! You've found a bug because the browser you're using needs to be updated."}
        <PrimaryButton className='mt-2'>
          <a className='text-inherit' href={url} target='_blank' rel='noreferrer'>
            Update now
          </a>
        </PrimaryButton>
      </ErrorBlock>
    )
  }

  if (isNetworkError(error)) {
    return (
      <ErrorBlock>
        There was a network issue. Please check your connection and try again.
        <PrimaryButton className='mt-2' onClick={() => window.location.reload()}>
          Refresh the page
        </PrimaryButton>
      </ErrorBlock>
    )
  }

  return (
    <ErrorBlock>
      {'An error has occurred! We’ve alerted the developers. Try refreshing the page'}
      {ERROR_FEEDBACK_ENABLED && eventId && (
        <PrimaryButton className='mt-2' onClick={() => setIsOpen(true)}>
          Report Feedback
        </PrimaryButton>
      )}
      <ReportErrorFeedback
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        error={error}
        eventId={eventId}
      />
    </ErrorBlock>
  )
}

export default ErrorComponent
