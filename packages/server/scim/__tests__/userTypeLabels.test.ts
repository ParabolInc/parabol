import SCIMMY from 'scimmy'
import '../UserIngress'

const userName = 'jdoe@acme.co'

test.each([
  ['phoneNumbers', {phoneNumbers: [{value: '+1 555 0100', type: 'work_mobile'}]}],
  ['emails', {emails: [{value: userName, type: 'Work', primary: true}]}],
  ['addresses', {addresses: [{locality: 'Springfield', type: 'office'}]}],
  ['roles', {roles: [{value: 'Engineer', type: 'jobTitle'}]}]
])('an IdP may label %s with a type of its own', (_name, attributes) => {
  expect(() => new SCIMMY.Schemas.User({userName, ...attributes}, 'in')).not.toThrow()
})

test('a PATCH may add a phone number with a type of its own', async () => {
  const patchOp = new SCIMMY.Messages.PatchOp({
    schemas: [SCIMMY.Messages.PatchOp.id],
    Operations: [
      {op: 'add', path: 'phoneNumbers', value: [{value: '+1 555 0100', type: 'work_mobile'}]}
    ]
  })
  const user = new SCIMMY.Schemas.User({id: 'user1', userName}, 'out')
  await expect(patchOp.apply(user, async (instance) => instance)).resolves.toMatchObject({
    phoneNumbers: [{type: 'work_mobile'}]
  })
})

test('a User attribute that Parabol reads is still validated', () => {
  expect(() => new SCIMMY.Schemas.User({emails: [{value: userName}]}, 'in')).toThrow(
    "Required attribute 'userName' is missing"
  )
})
