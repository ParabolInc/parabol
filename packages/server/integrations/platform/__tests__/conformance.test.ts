jest.mock('../../TaskIntegrationManagerFactory', () => ({
  __esModule: true,
  default: {initManager: jest.fn()}
}))

import {serverIntegrations} from '../registry'
import {describeServerIntegrationConformance} from './describeServerIntegrationConformance'

describe('server integration conformance', () => {
  Object.values(serverIntegrations).forEach(describeServerIntegrationConformance)
})
