import faker from 'faker'
import '../../../../scripts/webpack/utils/dotenv'
import getDataLoader from '../../graphql/getDataLoader'
import getPg from '../../postgres/getPg'

afterAll(async () => {
  const pg = getPg()
  const dataloader = getDataLoader()

  await pg.end()
  dataloader.dispose(true)
  // TODO shutdown redis to properly end test
})

test('Result is mapped to correct id', async () => {
  const pg = getPg()
  const dataloader = getDataLoader()

  const expectedUsers = faker.helpers.shuffle(
    (await pg.query('SELECT "id", "email" FROM "User" LIMIT 100')).rows
  )
  const userIds = expectedUsers.map(({id}) => id)

  const actualUsers = (await (dataloader.get('users') as any).loadMany(userIds)).map(
    ({id, email}) => ({
      id,
      email
    })
  )

  console.log('Ran with #users:', actualUsers.length)

  expect(actualUsers).toEqual(expectedUsers)
})
