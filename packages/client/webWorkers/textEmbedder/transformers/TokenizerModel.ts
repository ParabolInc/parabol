import {TokenizerConfigJSON} from './tokenizerConfigJSON'
import {TokenizerJSON} from './tokenizerJSON'

export abstract class TokenizerModel {
  static fromConfig(
    modelConfig: TokenizerJSON['model'],
    _tokenizerConfigJSON: TokenizerConfigJSON
  ) {
    const {type} = modelConfig
    const classLookup = {
      WordPiece: WordPieceTokenizer
    }
    return new classLookup[type](modelConfig)
  }
  config: TokenizerJSON['model']
  vocab: string[] = []
  tokens_to_ids = new Map()
  unk_token_id = undefined
  unk_token = undefined
  end_of_word_suffix: string | undefined = undefined
  fuse_unk: boolean
  constructor(modelConfig: TokenizerJSON['model']) {
    this.config = modelConfig
    this.fuse_unk = modelConfig.fuse_unk ?? false
  }

  abstract encode(tokens: string[]): string[]
  /**
   * Converts a list of tokens into a list of token IDs.
   * @param {string[]} tokens The tokens to convert.
   * @returns {number[]} The converted token IDs.
   */
  convert_tokens_to_ids(tokens: string[]) {
    let ids = tokens.map((t) => this.tokens_to_ids.get(t) ?? this.unk_token_id)

    if (this.fuse_unk) {
      // Fuse unknown tokens
      ids = this.fuse(ids, this.unk_token_id)
    }
    return ids
  }

  /**
   * Converts a list of token IDs into a list of tokens.
   * @param {number[]} ids The token IDs to convert.
   * @returns {string[]} The converted tokens.
   */
  convert_ids_to_tokens(ids: string[]) {
    return ids.map((i) => this.vocab[i] ?? this.unk_token)
  }
  fuse(arr: string[], value: string) {
    let fused = []
    let i = 0
    while (i < arr.length) {
      fused.push(arr[i])
      if (arr[i] !== value) {
        ++i
        continue
      }

      while (i < arr.length && arr[i] === value) {
        ++i
      }
    }

    return fused
  }
}

export class WordPieceTokenizer extends TokenizerModel {
  constructor(config) {
    super(config)
    /**
     * A mapping of tokens to ids.
     * @type {Map<string, number>}
     */
    this.tokens_to_ids = new Map(Object.entries(config.vocab))

    /**
     * The id of the unknown token.
     * @type {number}
     */
    this.unk_token_id = this.tokens_to_ids.get(config.unk_token)

    /**
     * The unknown token string.
     * @type {string}
     */
    this.unk_token = config.unk_token

    /**
     * An array of tokens.
     * @type {string[]}
     */
    this.vocab = new Array(this.tokens_to_ids.size)
    for (const [key, value] of this.tokens_to_ids) {
      this.vocab[value] = key
    }
  }

  /**
   * Encodes an array of tokens using WordPiece encoding.
   * @param {string[]} tokens The tokens to encode.
   * @returns {string[]} An array of encoded tokens.
   */
  encode(tokens: string[]) {
    let outputTokens = []
    for (let token of tokens) {
      let chars = [...token]
      // TODO add
      // if len(chars) > self.max_input_chars_per_word:
      //     output_tokens.append(self.unk_token)
      //     continue

      let isUnknown = false
      let start = 0
      let subTokens = []

      while (start < chars.length) {
        let end = chars.length
        let currentSubstring = null
        while (start < end) {
          let substr = chars.slice(start, end).join('')

          if (start > 0) {
            substr = this.config.continuing_subword_prefix + substr
          }
          if (this.tokens_to_ids.has(substr)) {
            currentSubstring = substr
            break
          }

          --end
        }
        if (currentSubstring === null) {
          isUnknown = true
          break
        }
        subTokens.push(currentSubstring)
        start = end
      }
      if (isUnknown) {
        outputTokens.push(this.unk_token)
      } else {
        outputTokens.push(...subTokens)
      }
    }

    return outputTokens
  }
}
