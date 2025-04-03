import '../../../../scripts/webpack/utils/dotenv'
import {getNewDataLoader} from '../getNewDataLoader'

const dataloader = getNewDataLoader()

afterAll(async () => {
  dataloader.dispose()
})

test('Result is mapped to correct id', async () => {
  const testDomains = [
    'gmail.com',
    'yahoo.com',
    'parabol.fun',
    'googlemail.com',
    'hotmail.com',
    'outlook.com',
    'parabol.co',
    'mail.com',
    'icloud.com'
  ]
  const companyDomains = await dataloader.get('isCompanyDomain').loadMany(testDomains)
  expect(companyDomains).toEqual([false, false, true, false, false, false, true, false, false])
})

test('Loader does not check for valid domain', async () => {
  const testDomains = ['', 'Hello World!']
  const companyDomains = await dataloader.get('isCompanyDomain').loadMany(testDomains)
  expect(companyDomains).toEqual([true, true])
})
