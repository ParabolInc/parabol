import {readFileSync} from 'node:fs'
import path from 'node:path'
import OrgPlansAndBillingQuery from 'parabol-client/__generated__/OrgPlansAndBillingQuery.graphql'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const INVITE_TO_TEAM_MUTATION = `
  mutation InviteToTeam($teamId: ID!, $invitees: [Email!]!) {
    inviteToTeam(teamId: $teamId, invitees: $invitees) {
      team {
        id
      }
    }
  }
`

const ACCEPT_TEAM_INVITATION_MUTATION = `
  mutation AcceptTeamInvitation($invitationToken: ID!) {
    acceptTeamInvitation(invitationToken: $invitationToken) {
      error {
        message
      }
      team {
        id
      }
    }
  }
`

// the client sends the OrgPlansAndBillingQuery it persisted at build time
const getPersistedOrgPlansAndBillingQuery = () => {
  const queryMap = JSON.parse(
    readFileSync(path.join(__dirname, '../../../queryMap.json'), 'utf8')
  ) as Record<string, string>
  return queryMap[OrgPlansAndBillingQuery.params.id!]!
}

const signUpOrgMember = async () => {
  const [owner, member] = await Promise.all([signUp(), signUp()])
  await sendPublic({
    query: INVITE_TO_TEAM_MUTATION,
    variables: {teamId: owner.teamId, invitees: [member.email]},
    cookie: owner.cookie
  })
  const {token} = await getKysely()
    .selectFrom('TeamInvitation')
    .select('token')
    .where('email', '=', member.email)
    .where('teamId', '=', owner.teamId)
    .executeTakeFirstOrThrow()
  const acceptResult = await sendPublic({
    query: ACCEPT_TEAM_INVITATION_MUTATION,
    variables: {invitationToken: token},
    cookie: member.cookie
  })
  expect(acceptResult).toMatchObject({
    data: {acceptTeamInvitation: {error: null, team: {id: owner.teamId}}}
  })
  return {owner, member}
}

test('an org member who is not a billing leader can load the plans and billing page', async () => {
  const {owner, member} = await signUpOrgMember()

  const res = await sendPublic({
    query: getPersistedOrgPlansAndBillingQuery(),
    variables: {orgId: owner.orgId, first: 4, isBillingLeader: false},
    cookie: member.cookie
  })

  expect(res.errors).toBeUndefined()
  expect(res.data).toEqual({})
})

test('a billing leader gets the invoices on the plans and billing page', async () => {
  const owner = await signUp()

  const res = await sendPublic({
    query: getPersistedOrgPlansAndBillingQuery(),
    variables: {orgId: owner.orgId, first: 4, isBillingLeader: true},
    cookie: owner.cookie
  })

  expect(res.errors).toBeUndefined()
  expect(res.data.viewer.invoices).toMatchObject({edges: []})
})
