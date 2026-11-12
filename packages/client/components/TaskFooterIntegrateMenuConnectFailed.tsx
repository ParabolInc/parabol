import type {ConnectInMenuState} from '../hooks/useConnectInMenu'
import {getConnectErrorMessage} from '../integrations/platform/getConnectErrorMessage'
import {getClientIntegration} from '../integrations/platform/registry'
import {MenuSeparator} from '../ui/Menu/MenuSeparator'

interface Props {
  failure: Extract<ConnectInMenuState, {phase: 'failed'}>
}

const TaskFooterIntegrateMenuConnectFailed = ({failure}: Props) => {
  const {service, title, error} = failure
  const detail = getConnectErrorMessage(error, getClientIntegration(service))
  return (
    <>
      <div className='px-4 pt-2 pb-2' role='alert'>
        <div className='text-fg-primary text-sm'>{`${title} didn't connect. Your card is untouched.`}</div>
        {detail && (
          <div className='mt-1 text-fg-secondary text-xs [&_a]:text-accent [&_a]:underline'>
            {detail}
          </div>
        )}
      </div>
      <MenuSeparator />
    </>
  )
}

export default TaskFooterIntegrateMenuConnectFailed
