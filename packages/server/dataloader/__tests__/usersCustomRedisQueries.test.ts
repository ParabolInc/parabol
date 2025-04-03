import faker from 'faker'
import '../../../../scripts/webpack/utils/dotenv'
import isValid from '../../graphql/isValid'
import getKysely from '../../postgres/getKysely'
import {getNewDataLoader} from '../getNewDataLoader'

test('Result is mapped to correct id', async () => {
  const dataloader = getNewDataLoader()

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
