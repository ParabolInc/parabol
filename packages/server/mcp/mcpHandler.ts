import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {verify} from 'jsonwebtoken'
import {Kysely} from 'kysely'
import appOrigin from '../appOrigin'
import type {DB} from '../oauth/dbTypes'
import parseBody from '../parseBody'
import getKysely from '../postgres/getKysely'
import {Logger} from '../utils/Logger'

const SERVER_SECRET = process.env.SERVER_SECRET!

interface MCPRequest {
  jsonrpc: '2.0'
  method: string
  params?: any
  id: string | number
}

const mcpHandler = async (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    res.aborted = true
  })

  try {
    // 1. Authentication
    const authHeader = req.getHeader('authorization')
    const url = req.getUrl()
    const method = req.getMethod()

    console.log(`[MCP] Request: ${method} ${url}`)
    console.log(`[MCP] Headers:`, {
      authorization: authHeader ? 'Bearer [REDACTED]' : 'Missing',
      'content-type': req.getHeader('content-type'),
      'user-agent': req.getHeader('user-agent')
    })

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[MCP] Authentication failed: Missing or invalid Authorization header')
      const authHeaderVal = `Bearer resource_metadata="${appOrigin}/.well-known/oauth-protected-resource/mcp", scope="parabol:read parabol:write mcp:read mcp:write"`
      console.log(`[MCP] Sending WWW-Authenticate: ${authHeaderVal}`)
      res.cork(() => {
        res.writeStatus('401 Unauthorized')
        res.writeHeader('WWW-Authenticate', authHeaderVal)
        res.end(JSON.stringify({error: 'Unauthorized'}))
      })
      return
    }

    const token = authHeader.split(' ')[1]!
    let decoded: any
    try {
      if (!SERVER_SECRET) throw new Error('SERVER_SECRET is not defined')
      decoded = verify(token, Buffer.from(SERVER_SECRET, 'base64'))
    } catch (_err) {
      console.log('[MCP] Authentication failed: Invalid token')
      res.cork(() => {
        res.writeStatus('401 Unauthorized')
        res.writeHeader(
          'WWW-Authenticate',
          `Bearer resource_metadata="${appOrigin}/.well-known/oauth-protected-resource/mcp", error="invalid_token"`
        )
        res.end(JSON.stringify({error: 'Invalid token'}))
      })
      return
    }

    if (decoded.iss !== 'parabol-oauth2') {
      console.log('[MCP] Authentication failed: Invalid issuer', decoded.iss)
      res.cork(() => {
        res.writeStatus('403 Forbidden')
        res.end(JSON.stringify({error: 'Invalid token issuer'}))
      })
      return
    }

    // 2. Parse Request
    const rawBody = await parseBody({
      res,
      parser: (buffer: Buffer) => buffer.toString()
    })

    console.log(`[MCP] Raw Body:`, rawBody)

    if (!rawBody) {
      console.log('[MCP] Parse error: Empty body')
      res.cork(() => {
        res.writeStatus('400 Bad Request')
        res.end(JSON.stringify({error: 'Parse error'}))
      })
      return
    }

    const body: MCPRequest = JSON.parse(rawBody)
    console.log(`[MCP] Parsed Body:`, JSON.stringify(body, null, 2))

    if (body.jsonrpc !== '2.0' || !body.method) {
      console.log('[MCP] Invalid JSON-RPC request')
      res.cork(() => {
        res.writeStatus('400 Bad Request')
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {code: -32600, message: 'Invalid Request'},
            id: null
          })
        )
      })
      return
    }

    // 3. Setup database connection and get userId
    const db = getKysely() as unknown as Kysely<DB>
    const userId = decoded.sub

    // 4. Check if MCP is enabled for user's organization
    const userOrg = await (db as any)
      .selectFrom('OrganizationUser')
      .innerJoin('Organization', 'OrganizationUser.orgId', 'Organization.id')
      .select(['Organization.id', 'Organization.mcpEnabled'])
      .where('OrganizationUser.userId', '=', userId)
      .executeTakeFirst()

    if (!userOrg || !userOrg.mcpEnabled) {
      console.log('[MCP] MCP is disabled for this organization')
      res.cork(() => {
        res.writeStatus('403 Forbidden')
        res.writeHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {code: -32000, message: 'MCP server is disabled for this organization'},
            id: body.id || null
          })
        )
      })
      return
    }

    // 5. Dispatch Command
    let result: any

    switch (body.method) {
      case 'initialize': {
        // MCP protocol handshake
        result = {
          protocolVersion: '2025-03-26',
          capabilities: {
            resources: {}
          },
          serverInfo: {
            name: 'Parabol MCP Server',
            version: '1.0.0'
          }
        }
        break
      }
      case 'notifications/initialized': {
        // Client notification that initialization is complete
        // No response needed for notifications
        res.cork(() => {
          res.writeStatus('200 OK')
          res.writeHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({jsonrpc: '2.0'}))
        })
        return
      }

      case 'resources/list': {
        // Return only listed resources based on org settings
        const orgIds = await (db as any)
          .selectFrom('OrganizationUser')
          .select('orgId')
          .where('userId', '=', userId)
          .execute()

        if (orgIds.length === 0) {
          result = {resources: []}
          break
        }

        // Get org settings for the first org (for simplicity, could be extended for multiple orgs)
        const org = await (db as any)
          .selectFrom('Organization')
          .select(['id', 'mcpResources' as any])
          .where('id', '=', orgIds[0].orgId)
          .executeTakeFirst()

        const mcpResources = org?.mcpResources || {
          organizations: false,
          teams: false,
          pages: false
        }

        const resources: any[] = []

        if (mcpResources.organizations) {
          resources.push({
            uri: 'parabol://me/organizations',
            name: 'My Organizations',
            description: 'List of organizations you belong to',
            mimeType: 'application/json'
          })
        }

        if (mcpResources.teams) {
          resources.push({
            uri: 'parabol://teams',
            name: 'My Teams',
            description: 'List of teams you have access to',
            mimeType: 'application/json'
          })
        }

        if (mcpResources.pages) {
          resources.push({
            uri: 'parabol://pages',
            name: 'My Pages',
            description: 'Shared and private pages you have access to',
            mimeType: 'application/json'
          })
        }

        result = {resources}
        break
      }
      case 'resources/read': {
        const {uri} = body.params || {}
        if (!uri) throw new Error('Resource URI is required')

        // Parse URI: parabol://path
        const parsedUri = uri.replace('parabol://', '')
        const segments = parsedUri.split('/')

        console.log(`[MCP] Reading resource: ${uri}`)

        // Route to appropriate handler based on URI
        if (segments[0] === 'me' && segments[1] === 'organizations' && segments.length === 2) {
          // /me/organizations - return list of org resources
          const orgs = await (db as any)
            .selectFrom('OrganizationUser')
            .innerJoin('Organization', 'OrganizationUser.orgId', 'Organization.id')
            .select(['Organization.id', 'Organization.name'])
            .where('OrganizationUser.userId', '=', userId)
            .execute()

          const orgResources = await Promise.all(
            orgs.map(async (org: any) => {
              const [allUsers, activeUsers] = await Promise.all([
                (db as any)
                  .selectFrom('OrganizationUser')
                  .select(({fn}) => fn.count('userId').as('count'))
                  .where('orgId', '=', org.id)
                  .executeTakeFirst(),
                (db as any)
                  .selectFrom('OrganizationUser')
                  .innerJoin('User', 'OrganizationUser.userId', 'User.id')
                  .select(({fn}) => fn.count('User.id').as('count'))
                  .where('OrganizationUser.orgId', '=', org.id)
                  .where('User.inactive', '=', false)
                  .executeTakeFirst()
              ])

              return {
                uri: `parabol://me/organizations/${org.id}`,
                name: org.name,
                description: `${org.name} (${allUsers.count} total users, ${activeUsers.count} active)`,
                mimeType: 'application/json'
              }
            })
          )

          result = {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({resources: orgResources}, null, 2)
              }
            ]
          }
        } else if (
          segments[0] === 'me' &&
          segments[1] === 'organizations' &&
          segments.length === 3
        ) {
          // /me/organizations/{id} - return sub-resources
          const orgId = segments[2]
          result = {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    resources: [
                      {
                        uri: `parabol://me/organizations/${orgId}/teams`,
                        name: 'Organization Teams',
                        description: 'Teams in this organization',
                        mimeType: 'application/json'
                      },
                      {
                        uri: `parabol://me/organizations/${orgId}/members`,
                        name: 'Organization Members',
                        description: 'Members of this organization',
                        mimeType: 'application/json'
                      }
                    ]
                  },
                  null,
                  2
                )
              }
            ]
          }
        } else if (
          segments[0] === 'me' &&
          segments[1] === 'organizations' &&
          segments[2] &&
          segments[3] === 'teams'
        ) {
          // /me/organizations/{id}/teams - return list of team resources
          const orgId = segments[2]
          const teams = await (db as any)
            .selectFrom('Team')
            .select(['id', 'name', 'createdAt'])
            .where('orgId', '=', orgId)
            .where('isArchived', '=', false)
            .execute()

          const teamResources = await Promise.all(
            teams.map(async (team: any) => {
              // Get last meeting date
              const lastMeeting = await (db as any)
                .selectFrom('NewMeeting')
                .select('createdAt')
                .where('teamId', '=', team.id)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .executeTakeFirst()

              const createdDate = new Date(team.createdAt).toISOString().split('T')[0]
              const lastMetDate = lastMeeting
                ? new Date(lastMeeting.createdAt).toISOString().split('T')[0]
                : 'Never'

              return {
                uri: `parabol://teams/${team.id}`,
                name: team.name,
                description: `Created: ${createdDate}, Last met: ${lastMetDate}`,
                mimeType: 'application/json'
              }
            })
          )

          result = {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({resources: teamResources}, null, 2)
              }
            ]
          }
        } else if (
          segments[0] === 'me' &&
          segments[1] === 'organizations' &&
          segments[2] &&
          segments[3] === 'members'
        ) {
          // /me/organizations/{id}/members - return member data
          const orgId = segments[2]
          const members = await (db as any)
            .selectFrom('OrganizationUser')
            .innerJoin('User', 'OrganizationUser.userId', 'User.id')
            .select([
              'User.id',
              'User.name',
              'User.email',
              'OrganizationUser.role',
              'User.lastSeenAt'
            ])
            .where('OrganizationUser.orgId', '=', orgId)
            .execute()

          const membersData = members.map((member: any) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role || null,
            lastSeenAt: member.lastSeenAt ? new Date(member.lastSeenAt).toISOString() : null
          }))

          result = {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({members: membersData}, null, 2)
              }
            ]
          }
        } else if (segments[0] === 'teams' && segments.length === 1) {
          // /teams - return list of team resources accessible to user
          const teamMembers = await (db as any)
            .selectFrom('TeamMember')
            .innerJoin('Team', 'TeamMember.teamId', 'Team.id')
            .select(['Team.id', 'Team.name'])
            .where('TeamMember.userId', '=', userId)
            .where('TeamMember.isNotRemoved', '=', true)
            .where('Team.isArchived', '=', false)
            .execute()

          const teamResources = teamMembers.map((team: any) => ({
            uri: `parabol://teams/${team.id}`,
            name: team.name,
            description: `Team: ${team.name}`,
            mimeType: 'application/json'
          }))

          result = {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({resources: teamResources}, null, 2)
              }
            ]
          }
        } else if (segments[0] === 'teams' && segments.length === 2) {
          // /teams/{id} - return sub-resources
          const teamId = segments[1]
          result = {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    resources: [
                      {
                        uri: `parabol://teams/${teamId}/activity`,
                        name: 'Team Activity',
                        description: 'Active meetings for this team',
                        mimeType: 'application/json'
                      },
                      {
                        uri: `parabol://teams/${teamId}/pages`,
                        name: 'Team Pages',
                        description: 'Top-level pages for this team',
                        mimeType: 'application/json'
                      }
                    ]
                  },
                  null,
                  2
                )
              }
            ]
          }
        } else if (segments[0] === 'teams' && segments[2] === 'activity') {
          // /teams/{id}/activity - return active meetings
          const teamId = segments[1]
          const meetings = await (db as any)
            .selectFrom('NewMeeting')
            .select(['id', 'name', 'meetingType', 'createdAt'])
            .where('teamId', '=', teamId)
            .where('endedAt', 'is', null)
            .execute()

          const meetingsData = meetings.map((meeting: any) => ({
            id: meeting.id,
            name: meeting.name,
            type: meeting.meetingType,
            createdAt: new Date(meeting.createdAt).toISOString()
          }))

          result = {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({meetings: meetingsData}, null, 2)
              }
            ]
          }
        } else if (segments[0] === 'teams' && segments[2] === 'pages') {
          // /teams/{id}/pages - return team pages
          const teamId = segments[1]
          const pages = await (db as any)
            .selectFrom('Page')
            .select(['id', 'title'])
            .where('teamId', '=', teamId)
            .where('parentPageId', 'is', null)
            .where('deletedAt', 'is', null)
            .execute()

          const pageResources = pages.map((page: any) => ({
            uri: `parabol://pages/${page.id}`,
            name: page.title,
            description: `Page: ${page.title}`,
            mimeType: 'application/json'
          }))

          result = {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({resources: pageResources}, null, 2)
              }
            ]
          }
        } else if (segments[0] === 'pages' && segments.length === 1) {
          // /pages - return shared and private pages
          const pages = await (db as any)
            .selectFrom('Page')
            .innerJoin('PageAccess', 'Page.id', 'PageAccess.pageId')
            .select(['Page.id', 'Page.title', 'PageAccess.role as access'])
            .where('PageAccess.userId', '=', userId)
            .where('Page.parentPageId', 'is', null)
            .where('Page.deletedAt', 'is', null)
            .execute()

          const pageResources = pages.map((page: any) => ({
            uri: `parabol://pages/${page.id}`,
            name: page.title,
            description: `${page.title} (${page.access})`,
            mimeType: 'application/json'
          }))

          result = {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({resources: pageResources}, null, 2)
              }
            ]
          }
        } else if (segments[0] === 'pages' && segments.length === 2) {
          // /pages/{id} - return page content, sharing, and sub-pages
          const pageId = segments[1]
          const page = await (db as any)
            .selectFrom('Page')
            .select(['id', 'title', 'plaintextContent as content', 'teamId'])
            .where('id', '=', pageId)
            .executeTakeFirst()

          if (!page) throw new Error('Page not found')

          // Get sharing settings
          const [userAccess, teamAccess, orgAccess] = await Promise.all([
            (db as any)
              .selectFrom('PageUserAccess')
              .select(['userId', 'role'])
              .where('pageId', '=', pageId)
              .execute(),
            (db as any)
              .selectFrom('PageTeamAccess')
              .select(['teamId', 'role'])
              .where('pageId', '=', pageId)
              .execute(),
            (db as any)
              .selectFrom('PageOrganizationAccess')
              .select(['orgId', 'role'])
              .where('pageId', '=', pageId)
              .execute()
          ])

          // Get sub-pages
          const subPages = await (db as any)
            .selectFrom('Page')
            .select(['id', 'title'])
            .where('parentPageId', '=', pageId)
            .where('deletedAt', 'is', null)
            .execute()

          const subPageResources = subPages.map((subPage: any) => ({
            uri: `parabol://pages/${subPage.id}`,
            name: subPage.title,
            description: `Sub-page: ${subPage.title}`,
            mimeType: 'application/json'
          }))

          const sharing = [
            ...userAccess.map((access: any) => ({
              userId: access.userId,
              access: access.role
            })),
            ...teamAccess.map((access: any) => ({
              teamId: access.teamId,
              access: access.role
            })),
            ...orgAccess.map((access: any) => ({
              organizationId: access.orgId,
              access: access.role
            }))
          ]

          const pageData = {
            id: page.id,
            title: page.title,
            content: page.content,
            teamId: page.teamId,
            sharing,
            subPages: subPageResources
          }

          result = {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(pageData, null, 2)
              }
            ]
          }
        } else {
          throw new Error(`Unknown resource URI: ${uri}`)
        }
        break
      }
      case 'resources/templates/list': {
        result = {resourceTemplates: []}
        break
      }

      default:
        res.cork(() => {
          res.writeStatus('200 OK')
          res.writeHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              error: {code: -32601, message: 'Method not found'},
              id: body.id
            })
          )
        })
        return
    }

    // 4. Send Response
    console.log(`[MCP] Sending Response:`, JSON.stringify(result, null, 2))
    res.cork(() => {
      res.writeStatus('200 OK')
      res.writeHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          result,
          id: body.id
        })
      )
    })
  } catch (error: any) {
    Logger.error('MCP Error', error)
    if (!res.aborted) {
      res.cork(() => {
        res.writeStatus('500 Internal Server Error')
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {code: -32603, message: 'Internal error', data: error.message},
            id: null
          })
        )
      })
    }
  }
}

export default mcpHandler
