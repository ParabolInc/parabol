import {TokenizerJSON} from './tokenizerJSON'

export abstract class Normalizer {
  static fromConfig(config: TokenizerJSON['normalizer']) {
    const {type} = config
    const classLookup = {
      BertNormalizer
    }
    return new classLookup[type](config)
  }
  config: TokenizerJSON['normalizer']
  constructor(normalizerJSON: TokenizerJSON['normalizer']) {
    this.config = normalizerJSON
  }
  abstract normalize(text: string): string
}

export class BertNormalizer extends Normalizer {
  /**
   * Adds whitespace around any CJK (Chinese, Japanese, or Korean) character in the input text.
   *
   * @param {string} text The input text to tokenize.
   * @returns {string} The tokenized text with whitespace added around CJK characters.
   */
  _tokenize_chinese_chars(text: string) {
    /* Adds whitespace around any CJK character. */
    let output = []
    for (let i = 0; i < text.length; ++i) {
      let char = text[i]
      let cp = char.charCodeAt(0)
      if (this._is_chinese_char(cp)) {
        output.push(' ')
        output.push(char)
        output.push(' ')
      } else {
        output.push(char)
      }
    }
    return output.join('')
  }

  /**
   * Checks whether the given Unicode codepoint represents a CJK (Chinese, Japanese, or Korean) character.
   *
   * A "chinese character" is defined as anything in the CJK Unicode block:
   * https://en.wikipedia.org/wiki/CJK_Unified_Ideographs_(Unicode_block)
   *
   * Note that the CJK Unicode block is NOT all Japanese and Korean characters, despite its name.
   * The modern Korean Hangul alphabet is a different block, as is Japanese Hiragana and Katakana.
   * Those alphabets are used to write space-separated words, so they are not treated specially
   * and are handled like all other languages.
   *
   * @param {number} cp The Unicode codepoint to check.
   * @returns {boolean} True if the codepoint represents a CJK character, false otherwise.
   */
  _is_chinese_char(cp: number) {
    return (
      (cp >= 0x4e00 && cp <= 0x9fff) ||
      (cp >= 0x3400 && cp <= 0x4dbf) ||
      (cp >= 0x20000 && cp <= 0x2a6df) ||
      (cp >= 0x2a700 && cp <= 0x2b73f) ||
      (cp >= 0x2b740 && cp <= 0x2b81f) ||
      (cp >= 0x2b820 && cp <= 0x2ceaf) ||
      (cp >= 0xf900 && cp <= 0xfaff) ||
      (cp >= 0x2f800 && cp <= 0x2fa1f)
    )
  }
  /**
   * Strips accents from the given text.
   * @param {string} text The text to strip accents from.
   * @returns {string} The text with accents removed.
   */
  stripAccents(text: string) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  /**
   * Normalizes the given text based on the configuration.
   * @param {string} text The text to normalize.
   * @returns {string} The normalized text.
   */
  normalize(text: string) {
    // TODO use rest of config
    // config.clean_text,
    // config.handle_chinese_chars,
    // config.strip_accents,
    // config.lowercase,

    if (this.config.handle_chinese_chars) {
      text = this._tokenize_chinese_chars(text)
    }

    if (this.config.lowercase) {
      text = text.toLowerCase()

      if (this.config.strip_accents !== false) {
        text = this.stripAccents(text)
      }
    } else if (this.config.strip_accents) {
      text = this.stripAccents(text)
    }

    return text
  }
}
