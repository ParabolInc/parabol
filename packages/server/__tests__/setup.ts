import {drainRethink} from './common'

afterAll(() => {
  return drainRethink()
})
