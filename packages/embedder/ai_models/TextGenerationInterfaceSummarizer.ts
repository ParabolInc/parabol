import {AbstractSummerizerModel, SummarizationModelConfig} from './abstractModel'

const MAX_REQUEST_TIME_MS = 120 * 1000

export class TextGenerationInterfaceSummarizer extends AbstractSummerizerModel {
  private readonly modelSubType: string
  constructor(config: SummarizationModelConfig) {
    super(config)

    const modelConfigStringSplit = this.modelConfigString.split(':')
    if (modelConfigStringSplit.length != 2) {
      throw new Error(
        'TextGenerationInterfaceSummarizer model string must be colon-delimited and len 2'
      )
    }

    if (!this.url) throw new Error('TextGenerationInterfaceSummarizer model requires url')

    this.modelSubType = modelConfigStringSplit[1]
  }

  public async summarize(content: string, temperature: number = 0.8, maxTokens: number = 512) {
    const prompt = `Create a brief, one-paragraph summary of the following: ${content}`
    const body = {
      inputs: prompt,
      parameters: {
        maxNewTokens: maxTokens,
        temperature: temperature
      }
    }
    const controller = new AbortController()
    const {signal} = controller as any
    const timeout = setTimeout(() => {
      controller.abort()
    }, MAX_REQUEST_TIME_MS)

    try {
      console.log(`summarizing from ${this.url}/generate`)
      const res = await fetch(`${this.url}/generate`, {
        signal,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(body)
      })
      clearTimeout(timeout)
      const json = await res.json()
      if (!json || !json.generated_text)
        throw new Error('TextGenerationInterfaceSummarizer.summarize(): malformed response')
      return json.generated_text as string
    } catch (e) {
      console.log(`error: `, e)
      clearTimeout(timeout)
      console.log('TextGenerationInterfaceSummarizer.summarize(): timeout')
      throw e
    }
  }
}

export default TextGenerationInterfaceSummarizer
