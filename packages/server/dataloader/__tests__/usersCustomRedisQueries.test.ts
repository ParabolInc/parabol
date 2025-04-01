import faker from 'faker'
import '../../../../scripts/webpack/utils/dotenv'
import {getNewDataLoader} from '../../graphql/getDataLoader'
import isValid from '../../graphql/isValid'
import getPg from '../../postgres/getPg'

test('Result is mapped to correct id', async () => {
  const pg = getPg()
  const dataloader = getNewDataLoader()

  const expectedUsers = faker.helpers.shuffle(
    (await pg.query('SELECT "id", "email" FROM "User" LIMIT 100')).rows as {
      id: string
      email: string
    }[]
  )
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
