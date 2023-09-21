import {drainRethink} from './common'
import * as matchers from 'jest-extended'
expect.extend(matchers)

afterAll(() => {
  return drainRethink()
})
