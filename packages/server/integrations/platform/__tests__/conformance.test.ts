jest.mock('../../TaskIntegrationManagerFactory', () => ({
  __esModule: true,
  default: {initManager: jest.fn()}
}))

import {describeServerIntegrationConformance} from '../conformance/describeServerIntegrationConformance'
import {serverIntegrations} from '../registry'

describe('server integration conformance', () => {
  Object.values(serverIntegrations).forEach(describeServerIntegrationConformance)
})
