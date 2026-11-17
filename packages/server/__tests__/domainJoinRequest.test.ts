import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import getKysely from '../postgres/getKysely'
import {getTestDomain, getTestEmail, sendPublic, signUp, signUpWithEmail} from './common'

afterAll(async () => {
  await getKysely().destroy()
})

const queryDomainJoinRequest = (requestId: string, cookie: string) =>
  sendPublic({
    query: `
      query DomainJoinRequest($requestId: ID!) {
        viewer {
          domainJoinRequest(requestId: $requestId) {
            id
            domain
          }
        }
      }
    `,
    variables: {requestId},
    cookie
  })

test('A request id with no request resolves to null', async () => {
  const {cookie} = await signUp()
  const {max} = await getKysely()
    .selectFrom('DomainJoinRequest')
    .select(({fn}) => fn.max('id').as('max'))
    .executeTakeFirstOrThrow()
  const requestId = DomainJoinRequestId.join((max ?? 0) + 1000)

  const res = await queryDomainJoinRequest(requestId, cookie)
  expect(res).toEqual({data: {viewer: {domainJoinRequest: null}}})
})

test('A request for the viewer domain still resolves', async () => {
  const domain = getTestDomain()
  const requester = await signUpWithEmail(getTestEmail(domain))
  const {cookie} = await signUpWithEmail(getTestEmail(domain))
  const {id} = await getKysely()
    .insertInto('DomainJoinRequest')
    .values({
      createdBy: requester.userId,
      domain,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  const requestId = DomainJoinRequestId.join(id)

  const res = await queryDomainJoinRequest(requestId, cookie)
  expect(res).toEqual({data: {viewer: {domainJoinRequest: {id: requestId, domain}}}})
})
