import {Page} from '@playwright/test'
import {newConfig, number, string} from 'ts-app-env'
import '../../../scripts/webpack/utils/dotenv'

const EnvConfig = {
  HOST: string(),
  PORT: number({optional: true})
}

export class Config {
  readonly rootUrlPath: string

  constructor(env = newConfig(EnvConfig, process.env)) {
    this.rootUrlPath = this.rootUrlPathFromEnv(env)
  }

  public async goto(page: Page, path: string) {
    return page.goto(this.urlForPath(path))
  }

  public urlForPath(path: string) {
    return `${this.rootUrlPath}${path}`
  }

  private rootUrlPathFromEnv({HOST, PORT}: typeof EnvConfig): string {
    const scheme = HOST === 'localhost' ? 'http' : 'https'
    return `${scheme}://${HOST}${HOST === 'localhost' ? `:${PORT}` : ''}`
  }
}

const config = new Config()
export default config
