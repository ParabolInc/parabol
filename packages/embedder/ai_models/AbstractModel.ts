export abstract class AbstractModel {
  public readonly url: string

  constructor(url: string) {
    this.url = this.normalizeUrl(url)
  }

  // removes a trailing slash from the inputUrl
  private normalizeUrl(inputUrl: string) {
    const regex = /[/]+$/
    return inputUrl.replace(regex, '')
  }
}

export default AbstractModel
