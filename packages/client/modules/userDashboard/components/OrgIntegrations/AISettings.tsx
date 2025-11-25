import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {AISettings_organization$key} from '~/__generated__/AISettings_organization.graphql'
import {Loader} from '../../../../utils/relay/renderLoader'
import MCPServerIntegration from './MCPServerIntegration'

interface Props {
  organizationRef: AISettings_organization$key
}

const AISettings = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment AISettings_organization on Organization {
        ...MCPServerIntegration_organization
      }
    `,
    organizationRef
  )

  return (
    <Suspense fallback={<Loader />}>
      <div className='flex w-full flex-wrap'>
        <div className='w-[768px] max-w-[768px]'>
          <h1>AI Settings</h1>
          <div className='mb-6 text-base text-slate-700'>
            Configure AI integrations and capabilities for your organization.
          </div>
          <MCPServerIntegration organizationRef={organization} />
        </div>
      </div>
    </Suspense>
  )
}

export default AISettings
