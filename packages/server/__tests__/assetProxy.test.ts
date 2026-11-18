import {HOST, PROTOCOL, signUp} from './common'

const requestAsset = (partialPath: string, cookie?: string) =>
  fetch(`${PROTOCOL}://${HOST}/assets/${partialPath}`, {
    headers: cookie ? {cookie} : {},
    redirect: 'manual'
  })

test('Redirects to an asset the viewer owns', async () => {
  const {userId, cookie} = await signUp()
  const res = await requestAsset(`User/${userId}/assets/abc.png`, cookie)
  expect(res.status).toBe(307)
  expect(res.headers.get('Location')).toContain(`User/${userId}/assets/abc.png`)
})

test('Refuses an encoded path that climbs into another org', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])
  const climb = encodeURIComponent(`../../../Organization/${victim.orgId}/assets/abc.png`)
  const res = await requestAsset(`User/${attacker.userId}/assets/${climb}`, attacker.cookie)
  expect(res.status).toBe(404)
  expect(res.headers.get('Location')).toBeNull()
})

test('Refuses an encoded climb out of a public asset type without a sign-in', async () => {
  const {orgId} = await signUp()
  const climb = encodeURIComponent(`../../../Organization/${orgId}/assets/abc.png`)
  const res = await requestAsset(`Organization/${orgId}/picture/${climb}`)
  expect(res.status).toBe(404)
  expect(res.headers.get('Location')).toBeNull()
})
