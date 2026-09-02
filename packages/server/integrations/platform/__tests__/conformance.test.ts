jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import {serverIntegrations} from '../registry'
import {describeServerIntegrationConformance} from './describeServerIntegrationConformance'

describe('server integration conformance', () => {
  Object.values(serverIntegrations).forEach(describeServerIntegrationConformance)
})
