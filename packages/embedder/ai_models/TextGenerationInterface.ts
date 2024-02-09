import {
  AbstractGenerationModel,
  GenerationModelConfig,
  GenerationModelParams
} from './AbstractModel'

const MAX_REQUEST_TIME_MS = 120 * 1000

export enum ModelSubTypes {
  Zephyr_7b = 'TheBloke/zephyr-7b-beta'
}

const modelSubTypeDefinitions: Record<ModelSubTypes, GenerationModelParams> = {
  [ModelSubTypes.Zephyr_7b]: {
    maxInputTokens: 512
  }
}

function isValidModelSubType(type: any): type is ModelSubTypes {
  return Object.values(ModelSubTypes).includes(type)
}

export class TextGenerationInterface extends AbstractGenerationModel {
  constructor(config: GenerationModelConfig) {
    super(config)
  }

  public async summarize(content: string, temperature: number = 0.8, maxNewTokens: number = 512) {
    const prompt = `Create a brief, one-paragraph summary of the following: ${content}`
    const body = {
      inputs: prompt,
      parameters: {
        maxNewTokens: maxNewTokens,
        temperature: temperature
      }
    }
    const controller = new AbortController()
    const {signal} = controller as any
    const timeout = setTimeout(() => {
      controller.abort()
    }, MAX_REQUEST_TIME_MS)

    try {
      // console.log(`TextGenerationInterface.summarize(): summarizing from ${this.url}/generate`)
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
        throw new Error('TextGenerationInterface.summarize(): malformed response')
      return json.generated_text as string
    } catch (e) {
      console.log(`error: `, e)
      clearTimeout(timeout)
      console.log('TextGenerationInterfaceSummarizer.summarize(): timeout')
      throw e
    }
  }
  protected constructModelParams(): GenerationModelParams {
    const modelConfigStringSplit = this.modelConfigString.split(':')
    if (modelConfigStringSplit.length != 2) {
      throw new Error('TextGenerationInterface model string must be colon-delimited and len 2')
    }

    if (!this.url) throw new Error('TextGenerationInterfaceSummarizer model requires url')
    const modelSubType = modelConfigStringSplit[1]
    if (!isValidModelSubType(modelSubType))
      throw new Error(`TextGenerationInterface model subtype unknown: ${modelSubType}`)
    return modelSubTypeDefinitions[modelSubType]
  }
}

export default TextGenerationInterface
