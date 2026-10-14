import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ScopePhaseAreaConnect_service$key} from '../__generated__/ScopePhaseAreaConnect_service.graphql'
import useConnectIntegrationService from '../hooks/useConnectIntegrationService'
import type {ClientIntegrationDefinition} from '../integrations/platform/ClientIntegrationDefinition'
import {Button} from '../ui/Button/Button'
import {SALES_EMAIL} from '../utils/constants'

interface Props {
  teamId: string
  gotoParabol: () => void
  definition: ClientIntegrationDefinition
  serviceRef: ScopePhaseAreaConnect_service$key
}

const ScopePhaseAreaConnect = (props: Props) => {
  const {teamId, gotoParabol, definition, serviceRef} = props
  const integrationService = useFragment(
    graphql`
      fragment ScopePhaseAreaConnect_service on IntegrationService {
        title
        isAvailable
        grantedScopes
        ...integrationServiceProviders_service @relay(mask: false)
      }
    `,
    serviceRef
  )
  const {title, isAvailable} = integrationService
  const {connect, submitting, errorMessage} = useConnectIntegrationService(
    definition,
    integrationService,
    teamId
  )

  if (!isAvailable) {
    return (
      <div className='flex h-full flex-col items-center justify-center'>
        <div className='max-w-[360px] text-center'>
          <p className='mb-2 font-semibold text-base'>
            {`Bring your ${title} issues into your retros and sprint planning.`}
          </p>
          <p className='text-fg-secondary text-sm'>
            {'Ready to unlock it for your org? Reach out to '}
            <a
              className='text-accent no-underline hover:text-sky-600 focus:text-sky-600'
              href={`mailto:${SALES_EMAIL}`}
            >
              {SALES_EMAIL}
            </a>
            {" and we'll get you set up."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <Button
        variant='raised'
        size='md'
        className='select-none gap-2 whitespace-pre-wrap bg-surface-card text-fg-primary'
        disabled={submitting}
        onClick={connect}
      >
        <definition.Icon className={definition.iconClassName} />
        {`Import issues from ${title}`}
      </Button>
      {errorMessage && (
        <div className='p-4 pb-0 text-fg-error [&_a]:font-semibold [&_a]:text-fg-error [&_a]:underline'>
          {errorMessage}
        </div>
      )}
      <span
        className='cursor-pointer pt-6 text-accent outline-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
        onClick={gotoParabol}
      >
        Or add new tasks in Parabol
      </span>
    </div>
  )
}

export default ScopePhaseAreaConnect
