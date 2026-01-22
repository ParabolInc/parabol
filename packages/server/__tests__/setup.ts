import * as matchers from 'jest-extended'

expect.extend(matchers)

jest.mock('../utils/ServerIdentityManager', () => ({
  identityManager: {
    getId: () => 0,
    claimIdentity: jest.fn().mockResolvedValue(0)
  }
}))
