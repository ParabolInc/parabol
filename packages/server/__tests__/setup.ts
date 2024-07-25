import * as matchers from 'jest-extended'
import {drainRethink} from './common'
expect.extend(matchers)

afterAll(() => {
  return drainRethink()
})
