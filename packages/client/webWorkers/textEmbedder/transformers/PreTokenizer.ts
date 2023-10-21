import {TokenizerJSON} from './tokenizerJSON'

const PUNCTUATION_REGEX = '\\p{P}\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E'

export abstract class PreTokenizer {
  static fromConfig(config: TokenizerJSON['pre_tokenizer']) {
    const {type} = config
    const classLookup = {
      BertPreTokenizer
    }
    return new classLookup[type]()
  }
  // unsure of return type
  abstract pre_tokenize_text(text: string): string[]

  pre_tokenize(text: string) {
    let result = []
    if (Array.isArray(text)) {
      result = text.map((x) => this.pre_tokenize_text(x))
    } else {
      result = this.pre_tokenize_text(text)
    }
    return result.flat()
  }
}

export class BertPreTokenizer extends PreTokenizer {
  pattern: RegExp
  /**
   * Adds whitespace around any CJK (Chinese, Japanese, or Korean) character in the input text.
   */
  constructor() {
    super()
    // Construct a pattern which matches the rust implementation:
    // https://github.com/huggingface/tokenizers/blob/b4fcc9ce6e4ad5806e82826f816acfdfdc4fcc67/tokenizers/src/pre_tokenizers/bert.rs#L11
    // Equivalent to removing whitespace and splitting on punctuation (both \p{P} and other ascii characters)
    this.pattern = new RegExp(`[^\\s ${PUNCTUATION_REGEX}]+|[${PUNCTUATION_REGEX}]`, 'gu')
  }
  pre_tokenize_text(text: string) {
    return text.trim().match(this.pattern) || []
  }
}
