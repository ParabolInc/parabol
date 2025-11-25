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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeStatus('401 Unauthorized')
      res.writeHeader(
        'WWW-Authenticate',
        `Bearer resource_metadata="${appOrigin}/.well-known/oauth-protected-resource/mcp", scope="parabol:read parabol:write mcp:read mcp:write"`
      )
      res.end(JSON.stringify({error: 'Unauthorized'}))
      return
    }

    const token = authHeader.split(' ')[1]
    let decoded: any
    try {
      if (!SERVER_SECRET) throw new Error('SERVER_SECRET is not defined')
      decoded = verify(token, Buffer.from(SERVER_SECRET, 'base64'))
    } catch (_err) {
      res.writeStatus('401 Unauthorized')
      res.writeHeader(
        'WWW-Authenticate',
        `Bearer resource_metadata="${appOrigin}/.well-known/oauth-protected-resource/mcp", error="invalid_token"`
      )
      res.end(JSON.stringify({error: 'Invalid token'}))
      return
    }

    if (decoded.iss !== 'parabol-oauth2') {
      res.writeStatus('403 Forbidden')
      res.end(JSON.stringify({error: 'Invalid token issuer'}))
      return
    }

    // 2. Parse Request
    const rawBody = await parseBody({
      res,
      parser: (buffer: Buffer) => buffer.toString()
    })

    if (!rawBody) {
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'Parse error'}))
      return
    }

    const body: MCPRequest = JSON.parse(rawBody)

    if (body.jsonrpc !== '2.0' || !body.method) {
      res.writeStatus('400 Bad Request')
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {code: -32600, message: 'Invalid Request'},
          id: null
        })
      )
      return
    }

    // 3. Dispatch Command
    const db = getKysely() as unknown as Kysely<DB>
    const userId = decoded.sub
    let result: any

    switch (body.method) {
      case 'list_org_users': {
        const {limit = 50, cursor} = body.params || {}

        // Get user's organization
        const userOrg = await (db as any)
          .selectFrom('OrganizationUser')
          .select('organizationId')
          .where('userId', '=', userId)
          .executeTakeFirst()

        if (!userOrg) {
          throw new Error('User does not belong to any organization')
        }

        let query = (db as any)
          .selectFrom('OrganizationUser')
          .innerJoin('User', 'OrganizationUser.userId', 'User.id')
          .select(['User.id', 'User.name', 'User.email', 'OrganizationUser.role'])
          .where('OrganizationUser.organizationId', '=', userOrg.organizationId)
          .limit(limit)

        if (cursor) {
          query = query.where('User.id', '>', cursor)
        }

        const users = await query.execute()
        result = {users}
        break
      }
      case 'list_org_teams': {
        const {limit = 50} = body.params || {}

        const userOrg = await (db as any)
          .selectFrom('OrganizationUser')
          .select('organizationId')
          .where('userId', '=', userId)
          .executeTakeFirst()

        if (!userOrg) {
          throw new Error('User does not belong to any organization')
        }

        const teams = await (db as any)
          .selectFrom('Team')
          .select(['id', 'name', 'description', 'createdAt'])
          .where('orgId', '=', userOrg.organizationId)
          .limit(limit)
          .execute()

        result = {teams}
        break
      }
      case 'list_org_meeting_history': {
        const {teamId, limit = 50} = body.params || {}

        const userOrg = await (db as any)
          .selectFrom('OrganizationUser')
          .select('organizationId')
          .where('userId', '=', userId)
          .executeTakeFirst()

        if (!userOrg) {
          throw new Error('User does not belong to any organization')
        }

        let query = (db as any)
          .selectFrom('TimelineEvent')
          .select(['id', 'type', 'createdAt as date', 'teamId'])
          .where('organizationId', '=', userOrg.organizationId)
          .where('type', 'in', ['retroComplete', 'pokerComplete'])
          .orderBy('createdAt', 'desc')
          .limit(limit)

        if (teamId) {
          query = query.where('teamId', '=', teamId)
        }

        const meetings = await query.execute()
        result = {meetings}
        break
      }
      case 'read_user': {
        const {userId: targetUserId} = body.params || {}
        if (!targetUserId) throw new Error('userId is required')

        const user = await (db as any)
          .selectFrom('User')
          .selectAll()
          .where('id', '=', targetUserId)
          .executeTakeFirst()

        result = {user}
        break
      }
      case 'read_team': {
        const {teamId} = body.params || {}
        if (!teamId) throw new Error('teamId is required')

        const team = await (db as any)
          .selectFrom('Team')
          .selectAll()
          .where('id', '=', teamId)
          .executeTakeFirst()

        if (!team) {
          result = {team: null}
          break
        }

        // Get members
        const members = await (db as any)
          .selectFrom('TeamMember')
          .innerJoin('User', 'TeamMember.userId', 'User.id')
          .select(['User.id', 'User.name', 'User.email', 'TeamMember.roles'])
          .where('TeamMember.teamId', '=', teamId)
          .execute()

        result = {
          team: {
            ...team,
            members
          }
        }
        break
      }
      case 'read_meeting': {
        const {meetingId} = body.params || {}
        if (!meetingId) throw new Error('meetingId is required')

        // Try to find the meeting
        // We check NewMeeting table which stores active and some completed meetings?
        // Or maybe we need to check specific tables based on type.
        // For now, let's query NewMeeting as it seems to be the main table.
        const meeting = await (db as any)
          .selectFrom('NewMeeting')
          .selectAll()
          .where('id', '=', meetingId)
          .executeTakeFirst()

        if (!meeting) {
          throw new Error('Meeting not found')
        }

        // Fetch Reflections
        const reflections = await (db as any)
          .selectFrom('RetroReflection')
          .selectAll()
          .where('meetingId', '=', meetingId)
          .execute()

        // Fetch Discussions
        const discussions = await (db as any)
          .selectFrom('Discussion')
          .selectAll()
          .where('meetingId', '=', meetingId)
          .execute()

        // Fetch Tasks (associated with meeting or discussions)
        // Tasks usually have meetingId or discussionId
        const tasks = await (db as any)
          .selectFrom('Task')
          .selectAll()
          .where('meetingId', '=', meetingId)
          .execute()

        // Format as Markdown
        let markdown = `# ${meeting.name || 'Untitled Meeting'}\n`
        markdown += `Date: ${meeting.createdAt}\n\n`

        markdown += `## Reflections\n`
        if (reflections.length === 0) {
          markdown += `No reflections.\n`
        } else {
          reflections.forEach((r: any) => {
            markdown += `- ${r.plaintextContent || r.content}\n`
          })
        }
        markdown += `\n`

        markdown += `## Discussions\n`
        if (discussions.length === 0) {
          markdown += `No discussions.\n`
        } else {
          discussions.forEach((d: any) => {
            markdown += `### ${d.title}\n`
            // Find tasks for this discussion?
            // Assuming tasks might be linked to discussionId if schema supports it,
            // but we fetched by meetingId.
          })
        }
        markdown += `\n`

        markdown += `## Tasks\n`
        if (tasks.length === 0) {
          markdown += `No tasks created.\n`
        } else {
          tasks.forEach((t: any) => {
            markdown += `- [ ] ${t.plaintextContent || t.content} (Assigned to: ${t.userId || 'Unassigned'})\n`
          })
        }

        result = {
          meeting: {
            id: meetingId,
            name: meeting.name,
            markdown
          }
        }
        break
      }
      default:
        res.writeStatus('200 OK')
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {code: -32601, message: 'Method not found'},
            id: body.id
          })
        )
        return
    }

    // 4. Send Response
    res.writeStatus('200 OK')
    res.writeHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        jsonrpc: '2.0',
        result,
        id: body.id
      })
    )
  } catch (error: any) {
    Logger.error('MCP Error', error)
    if (!res.aborted) {
      res.writeStatus('500 Internal Server Error')
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {code: -32603, message: 'Internal error', data: error.message},
          id: null
        })
      )
    }
  }
}

export default mcpHandler
