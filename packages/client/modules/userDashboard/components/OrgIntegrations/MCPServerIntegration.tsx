import {Dns as DnsIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {MCPServerIntegration_organization$key} from '~/__generated__/MCPServerIntegration_organization.graphql'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import ToggleMCPEnabledMutation from '../../../../mutations/ToggleMCPEnabledMutation'
import ToggleMCPResourceMutation from '../../../../mutations/ToggleMCPResourceMutation'

interface Resource {
  id: string
  name: string
  description: string
  enabled: boolean
}

const RESOURCE_DEFINITIONS: Omit<Resource, 'enabled'>[] = [
  {
    id: 'organizations',
    name: 'Organizations',
    description: 'Access organization info, teams, and members'
  },
  {
    id: 'teams',
    name: 'Teams',
    description: 'Access team details, meetings, and pages'
  },
  {
    id: 'pages',
    name: 'Pages',
    description: 'Access shared and private pages content'
  }
]

interface Props {
  organizationRef: MCPServerIntegration_organization$key
}

const MCPServerIntegration = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment MCPServerIntegration_organization on Organization {
        id
        mcpEnabled
        mcpResources
      }
    `,
    organizationRef
  )

  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()

  const resources: Resource[] = useMemo(() => {
    const mcpResources = organization.mcpResources
      ? JSON.parse(organization.mcpResources)
      : {organizations: false, teams: false, pages: false}

    return RESOURCE_DEFINITIONS.map((def) => ({
      ...def,
      enabled: mcpResources[def.id] || false
    }))
  }, [organization.mcpResources])

  const toggleEnabled = () => {
    if (submitting) return
    submitMutation()
    ToggleMCPEnabledMutation(
      atmosphere,
      {orgId: organization.id, enabled: !organization.mcpEnabled},
      {onCompleted, onError}
    )
  }

  const toggleResource = (resourceId: string) => {
    if (submitting) return
    const resource = resources.find((r) => r.id === resourceId)
    if (!resource) return

    submitMutation()
    ToggleMCPResourceMutation(
      atmosphere,
      {orgId: organization.id, resource: resourceId, enabled: !resource.enabled},
      {onCompleted, onError}
    )
  }

  const totalEnabled = resources.filter((r) => r.enabled).length
  const totalResources = resources.length

  return (
    <div className='my-4 flex flex-col rounded-sm bg-white p-6 shadow-card'>
      <div className='mb-6 flex items-start justify-between'>
        <div className='flex gap-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-500'>
            <DnsIcon />
          </div>
          <div>
            <h3 className='font-semibold text-lg text-slate-900'>
              Model Context Protocol (MCP) Server
            </h3>
            <p className='text-slate-500 text-sm'>
              Enable Parabol as an MCP server and configure resource permissions
            </p>
          </div>
        </div>
        <Toggle active={organization.mcpEnabled} onClick={toggleEnabled} />
      </div>

      {organization.mcpEnabled && (
        <div className='space-y-6'>
          <div className='font-medium text-slate-500 text-sm'>
            {totalEnabled} of {totalResources} resources enabled
          </div>

          <div className='space-y-3'>
            {resources.map((resource) => (
              <div
                key={resource.id}
                className='flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 hover:bg-slate-50'
              >
                <div>
                  <div className='font-semibold text-slate-900 text-sm'>{resource.name}</div>
                  <div className='text-slate-500 text-sm'>{resource.description}</div>
                </div>
                <Toggle active={resource.enabled} onClick={() => toggleResource(resource.id)} />
              </div>
            ))}
          </div>

          <div className='rounded-md border border-cyan-100 bg-cyan-50 p-4'>
            <div className='flex items-center gap-2 text-slate-700 text-sm'>
              <span className='font-semibold'>Server Endpoint:</span>
              <code className='rounded border border-cyan-200 bg-white px-2 py-0.5 font-mono text-slate-600'>
                http://parabol.co/mcp
              </code>
            </div>
            <p className='mt-1 text-slate-500 text-sm'>
              Connect your MCP client to this endpoint to access enabled resources
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MCPServerIntegration
