import {clean_up_tokenization} from './clean_up_tokenization'
import {TokenizerJSON} from './tokenizerJSON'

export abstract class Decoder {
  static fromConfig(config: TokenizerJSON['decoder'], endOfWordSuffix: string | undefined) {
    const {type} = config
    const classLookup = {
      WordPiece: WordPieceDecoder
    }
    return new classLookup[type](config, endOfWordSuffix)
  }
  config: TokenizerJSON['decoder']
  added_tokens = []
  end_of_word_suffix = null
  trim_offsets: boolean
  constructor(config: TokenizerJSON['decoder']) {
    this.config = config
    this.added_tokens = []
    this.end_of_word_suffix = null
    this.trim_offsets = config.trim_offsets
  }
  /**
   * Decodes a list of tokens.
   */
  decode(tokens: string[]) {
    return this.decode_chain(tokens).join('')
  }

  /**
   * Apply the decoder to a list of tokens.
   */
  abstract decode_chain(tokens: string[]): string[]
}

export class WordPieceDecoder extends Decoder {
  cleanup: boolean
  constructor(config: TokenizerJSON['decoder'], endOfWordSuffix: string) {
    super(config)
    this.cleanup = config.cleanup
    this.end_of_word_suffix = endOfWordSuffix
  }
  decode_chain(tokens: string[]) {
    return tokens.map((token, i) => {
      if (i !== 0) {
        if (token.startsWith(this.config.prefix)) {
          // NOTE: .replace() is intended; only replace first occurrence
          token = token.replace(this.config.prefix, '')
        } else {
          token = ' ' + token
        }
      }
      if (this.cleanup) {
        token = clean_up_tokenization(token)
      }

      return token
    })
  }
}
