import {Page} from '@playwright/test'

type TestingMode = 'production' | 'local'

export class Config {
  readonly testingMode: TestingMode
  readonly rootUrlPath: string

  constructor(env = process.env) {
    this.testingMode = env.INTEGRATION_TESTING_MODE === 'production' ? 'production' : 'local'
    this.rootUrlPath =
      this.testingMode === 'production' ? 'https://action.parabol.co' : 'http://localhost:3000'
  }

  public async goto(page: Page, path: string) {
    return page.goto(`${this.rootUrlPath}${path}`)
  }
}

const config = new Config()
export default config
