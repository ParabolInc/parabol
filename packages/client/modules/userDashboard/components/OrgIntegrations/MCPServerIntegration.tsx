import {Dns as DnsIcon, ExpandLess, ExpandMore, Search as SearchIcon} from '@mui/icons-material'
import {useState} from 'react'
import BasicInput from '../../../../components/InputField/BasicInput'
import Toggle from '../../../../components/Toggle/Toggle'

interface Command {
  id: string
  name: string
  description: string
  enabled: boolean
}

interface CommandGroup {
  name: string
  commands: Command[]
}

const INITIAL_GROUPS: CommandGroup[] = [
  {
    name: 'list',
    commands: [
      {
        id: 'list_org_users',
        name: 'list_org_users',
        description: 'Retrieve a list of all users in the specified organization',
        enabled: true
      },
      {
        id: 'list_org_teams',
        name: 'list_org_teams',
        description: 'Retrieve a list of all teams in the specified organization',
        enabled: true
      },
      {
        id: 'list_org_meeting_history',
        name: 'list_org_meeting_history',
        description:
          'Retrieve a list of all historical meetings across teams in the specified organization',
        enabled: true
      }
    ]
  },
  {
    name: 'read',
    commands: [
      {
        id: 'read_user',
        name: 'read_user',
        description: 'Read detailed information about a specific user',
        enabled: true
      },
      {
        id: 'read_team',
        name: 'read_team',
        description:
          'Read detailed information about a specific team, including its members, unarchived tasks, current open meetings and recent completed meeting history',
        enabled: true
      },
      {
        id: 'read_meeting',
        name: 'read_meeting',
        description: 'Read detailed information about a specific open or closed meeting',
        enabled: true
      }
    ]
  }
]

const MCPServerIntegration = () => {
  const [enabled, setEnabled] = useState(false)
  const [groups, setGroups] = useState(INITIAL_GROUPS)
  const [search, setSearch] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    list: true,
    read: true
  })

  const toggleCommand = (groupName: string, commandId: string) => {
    setGroups(
      groups.map((group) => {
        if (group.name !== groupName) return group
        return {
          ...group,
          commands: group.commands.map((cmd) =>
            cmd.id === commandId ? {...cmd, enabled: !cmd.enabled} : cmd
          )
        }
      })
    )
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      commands: group.commands.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(search.toLowerCase()) ||
          cmd.description.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter((group) => group.commands.length > 0)

  const totalEnabled = groups.flatMap((g) => g.commands).filter((c) => c.enabled).length
  const totalCommands = groups.flatMap((g) => g.commands).length

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
              Enable Parabol as an MCP server and configure command permissions
            </p>
          </div>
        </div>
        <Toggle active={enabled} onClick={() => setEnabled(!enabled)} />
      </div>

      {enabled && (
        <div className='space-y-6'>
          <div className='font-medium text-slate-500 text-sm'>
            {totalEnabled} of {totalCommands} commands enabled
          </div>

          <div className='relative'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400'>
              <SearchIcon fontSize='small' />
            </div>
            <BasicInput
              name='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search commands...'
              error={undefined}
              className='w-full pl-10'
            />
          </div>

          <div className='space-y-4'>
            {filteredGroups.map((group) => (
              <div key={group.name} className='overflow-hidden rounded-md border border-slate-200'>
                <div
                  className='flex cursor-pointer items-center justify-between bg-slate-50 px-4 py-2 transition-colors hover:bg-slate-100'
                  onClick={() => toggleGroup(group.name)}
                >
                  <div className='flex items-center gap-2'>
                    <span className='inline-flex items-center rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-800 text-xs'>
                      {group.name}
                    </span>
                    <span className='font-medium text-slate-700 text-sm'>
                      {group.commands.length} commands
                    </span>
                  </div>
                  {expandedGroups[group.name] ? (
                    <ExpandLess className='text-slate-400' />
                  ) : (
                    <ExpandMore className='text-slate-400' />
                  )}
                </div>

                {expandedGroups[group.name] && (
                  <div className='divide-y divide-slate-100'>
                    {group.commands.map((cmd) => (
                      <div
                        key={cmd.id}
                        className='flex items-center justify-between px-4 py-3 hover:bg-slate-50'
                      >
                        <div>
                          <div className='inline-block rounded bg-slate-100 px-1.5 font-medium font-mono text-slate-700 text-sm'>
                            {cmd.name}
                          </div>
                          <div className='mt-1 text-slate-500 text-sm'>{cmd.description}</div>
                        </div>
                        <Toggle
                          active={cmd.enabled}
                          onClick={() => toggleCommand(group.name, cmd.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
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
              Connect your MCP client to this endpoint to access enabled commands
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MCPServerIntegration
