/* eslint-env jest */

export default class MockRes {
  constructor () {
    this.sendStatus = jest.fn()
  }
}
