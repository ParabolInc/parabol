import '../../../../../scripts/webpack/utils/dotenv'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'

const mockDetect = jest.fn()

// Stubbed so the selection SQL is exercised against the real schema without contacting a vendor
jest.mock('../detectServicesForUser', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockDetect(...args),
  isDetectionEnabled: () => process.env.SUGGESTED_SERVICES_ENABLED === 'true'
}))

const dataLoader = getNewDataLoader('test')

beforeEach(() => {
  process.env.SUGGESTED_SERVICES_ENABLED = 'true'
  mockDetect.mockResolvedValue(0)
})

afterAll(() => {
  dataLoader.dispose()
})

test('selects unprocessed users without error', async () => {
  const backfillSuggestedServices = (await import('../backfillSuggestedServices')).default
  const processed = await backfillSuggestedServices({
    lastSeenAfter: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    limit: 3,
    dataLoader
  })
  expect(typeof processed).toBe('number')
  expect(processed).toBeLessThanOrEqual(3)
  expect(mockDetect).toHaveBeenCalledTimes(processed)
})

test('the retryInconclusive selection is valid SQL against both subject types', async () => {
  const backfillSuggestedServices = (await import('../backfillSuggestedServices')).default
  const processed = await backfillSuggestedServices({
    lastSeenAfter: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    limit: 3,
    retryInconclusive: true,
    dataLoader
  })
  expect(typeof processed).toBe('number')
})

test('the kill switch stops the backfill before it reads anything', async () => {
  process.env.SUGGESTED_SERVICES_ENABLED = 'false'
  const backfillSuggestedServices = (await import('../backfillSuggestedServices')).default
  const processed = await backfillSuggestedServices({
    lastSeenAfter: new Date(0),
    limit: 100,
    dataLoader
  })
  expect(processed).toBe(0)
  expect(mockDetect).not.toHaveBeenCalled()
})
