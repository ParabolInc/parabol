export interface ModelConfig {
  model: string
  url: string
}

export abstract class AbstractModel {
  public readonly url?: string

  constructor(config: ModelConfig) {
    this.url = this.normalizeUrl(config.url)
  }

  // removes a trailing slash from the inputUrl
  private normalizeUrl(inputUrl: string | undefined) {
    if (!inputUrl) return undefined
    const regex = /[/]+$/
    return inputUrl.replace(regex, '')
  }
}

export default AbstractModel
