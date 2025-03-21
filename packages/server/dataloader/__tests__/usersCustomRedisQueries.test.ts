import faker from 'faker'
import '../../../../scripts/webpack/utils/dotenv'
import getDataLoader from '../../graphql/getDataLoader'
import isValid from '../../graphql/isValid'
import getKysely from '../../postgres/getKysely'

afterAll(async () => {
  const dataloader = getDataLoader()
  dataloader.dispose(true)
  // TODO shutdown redis to properly end test
})

test('Result is mapped to correct id', async () => {
  const dataloader = getDataLoader()

  const existingUsers = await getKysely()
    .selectFrom('User')
    .select(['id', 'email'])
    .limit(100)
    .execute()
  // just shuffle to make sure our comparison is correct
  const expectedUsers = faker.helpers.shuffle(existingUsers)

  const userIds = expectedUsers.map(({id}) => id)
  const actualUsers = (await dataloader.get('users').loadMany(userIds))
    .filter(isValid)
    .map(({id, email}) => ({
      id,
      email
    }))

  console.log('Ran with #users:', actualUsers.length)

  expect(actualUsers).toEqual(expectedUsers)
})
