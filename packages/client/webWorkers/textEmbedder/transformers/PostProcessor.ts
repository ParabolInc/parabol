import {TokenizerJSON} from './tokenizerJSON'

export abstract class PostProcessor {
  static fromConfig(modelConfig: TokenizerJSON['post_processor']) {
    const {type} = modelConfig
    const classLookup = {
      TemplateProcessing
    }
    return new classLookup[type](modelConfig)
  }
  config: TokenizerJSON['post_processor']
  constructor(config: TokenizerJSON['post_processor']) {
    this.config = config
  }
  abstract post_process(tokens: string[], ...args: any[]): any[]
}

export class TemplateProcessing extends PostProcessor {
  single: TokenizerJSON['post_processor']['single']
  pair: TokenizerJSON['post_processor']['pair']
  constructor(config: TokenizerJSON['post_processor']) {
    super(config)
    this.single = config.single
    this.pair = config.pair
  }
  /**
   * Replaces special tokens in the template with actual tokens.
   * @param {Array} tokens The list of tokens for the first sequence.
   * @param {Array} [tokens_pair=null] The list of tokens for the second sequence (optional).
   * @returns {Array} The list of tokens with the special tokens replaced with actual tokens.
   */
  post_process(tokens: string[], tokens_pair = null) {
    let type = tokens_pair === null ? this.single : this.pair

    let toReturn = []
    for (let item of type) {
      if ('SpecialToken' in item) {
        toReturn.push(item.SpecialToken.id)
      } else if ('Sequence' in item) {
        if (item.Sequence.id === 'A') {
          toReturn = [...toReturn, ...tokens]
        } else if (item.Sequence.id === 'B') {
          toReturn = [...toReturn, ...tokens_pair]
        }
      }
    }
    return toReturn
  }
}
