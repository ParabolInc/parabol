import type {Page} from '@playwright/test'
import {newConfig, number, string} from 'ts-app-env'
import '../../../scripts/webpack/utils/dotenv'

const EnvConfig = {
  HOST: string(),
  PORT: number({optional: true}),
  PROTO: string()
}

export class Config {
  readonly rootUrlPath: string
  readonly isLocalhost: boolean

  constructor(env = newConfig(EnvConfig, process.env)) {
    this.isLocalhost = env.HOST === 'localhost'
    this.rootUrlPath = this.rootUrlPathFromEnv(env)
  }

  public async goto(page: Page, path: string) {
    return page.goto(this.urlForPath(path))
  }

  public urlForPath(path: string) {
    return `${this.rootUrlPath}${path}`
  }

  private rootUrlPathFromEnv({HOST, PORT, PROTO}: typeof EnvConfig): string {
    return `${PROTO}://${HOST}${this.isLocalhost ? `:${PORT}` : ''}`
  }
}

const config = new Config()
export default config
