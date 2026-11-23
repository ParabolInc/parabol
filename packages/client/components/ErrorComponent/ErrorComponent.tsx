import {useState} from 'react'
import ReportErrorFeedback from '~/components/ReportErrorFeedback'
import {Button} from '~/ui/Button/Button'
import {twStyled} from '../../ui/twStyled'
import {isBrowserTooOld, UPDATE_BROWSER_URL} from '../../utils/browserSupport'
import {isClientOutdated} from '../../utils/connectedServerVersion'
import {isExtensionError, isIgnoredError, isNetworkError} from '../../utils/errorFilters'
import {STALE_CLIENT_NOTE} from '../../utils/staleClientNote'

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
  const isOutdated = isClientOutdated()
  const staleClientNote = isOutdated && <div>{STALE_CLIENT_NOTE}</div>
  const refreshButton = (
    <Button variant='primary' size='sm' className='mt-2' onClick={() => window.location.reload()}>
      Refresh the page
    </Button>
  )

  if (isExtensionError(error)) {
    return (
      <ErrorBlock>
        <div>
          Oh no! Seems like you're using Google Translate or a similar extension, which has a bug in
          it that can crash apps like ours.
        </div>
        <div>If this continues, please disable the extension</div>
        {staleClientNote}
        {refreshButton}
      </ErrorBlock>
    )
  }

  if (isBrowserTooOld) {
    return (
      <ErrorBlock>
        Your browser is too old to run Parabol. Update it, then reload this page.
        <Button asChild variant='primary' size='sm' className='mt-2'>
          <a href={UPDATE_BROWSER_URL} target='_blank' rel='noreferrer'>
            Update your browser
          </a>
        </Button>
      </ErrorBlock>
    )
  }

  if (isNetworkError(error)) {
    return (
      <ErrorBlock>
        There was a network issue. Please check your connection and try again.
        {staleClientNote}
        {refreshButton}
      </ErrorBlock>
    )
  }

  const reportButton = eventId && (
    <Button
      variant={isOutdated ? 'outline' : 'primary'}
      size='sm'
      className='mt-2'
      onClick={() => setIsOpen(true)}
    >
      Report Feedback
    </Button>
  )
  return (
    <ErrorBlock>
      {isOutdated
        ? 'An error has occurred! We’ve alerted the developers.'
        : 'An error has occurred! We’ve alerted the developers. Try refreshing the page'}
      {staleClientNote}
      {isOutdated ? (
        <div className='flex gap-2'>
          {refreshButton}
          {reportButton}
        </div>
      ) : (
        reportButton
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
