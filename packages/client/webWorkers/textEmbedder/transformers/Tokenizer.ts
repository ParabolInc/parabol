import {Tensor} from 'onnxruntime-web'
import {Decoder} from './Decoder'
import {Normalizer} from './Normalizer'
import {PostProcessor} from './PostProcessor'
import {PreTokenizer} from './PreTokenizer'
import {TokenizerModel} from './TokenizerModel'
import {clean_up_tokenization} from './clean_up_tokenization'
import {isIntegralNumber} from './isIntegralNumber'
import {lowercase_and_remove_accent} from './lowercase_and_remove_accent'
import {max} from './max'
import {TokenizerConfigJSON} from './tokenizerConfigJSON'
import {TokenizerJSON} from './tokenizerJSON'

export abstract class Tokenizer<
  TNorm extends Normalizer,
  TPre extends PreTokenizer,
  TModel extends TokenizerModel,
  TPost extends PostProcessor,
  TDec extends Decoder
> {
  static fromConfig<TTokenizer>(
    tokenizerJSON: TokenizerJSON,
    tokenizerConfigJSON: TokenizerConfigJSON
  ) {
    const {tokenizer_class} = tokenizerConfigJSON
    const classLookup = {
      BertTokenizer
    }
    return new classLookup[tokenizer_class](tokenizerJSON, tokenizerConfigJSON) as TTokenizer
  }

  normalizer: TNorm
  pre_tokenizer: TPre
  model: TModel
  post_processor: TPost
  decoder: TDec
  special_tokens = []
  all_special_ids = []
  added_tokens = []
  added_tokens_regex: RegExp
  mask_token: string
  mask_token_id: string
  pad_token: string
  pad_token_id: string
  sep_token: string
  sep_token_id: string
  model_max_length: number
  remove_space: boolean
  clean_up_tokenization_spaces: boolean
  do_lowercase_and_remove_accent: boolean
  padding_side = 'right'

  constructor(tokenizerJSON: TokenizerJSON, tokenizerConfigJSON: TokenizerConfigJSON) {
    this.normalizer = Normalizer.fromConfig(tokenizerJSON.normalizer)
    this.pre_tokenizer = PreTokenizer.fromConfig(tokenizerJSON.pre_tokenizer)
    this.model = TokenizerModel.fromConfig(tokenizerJSON.model, tokenizerConfigJSON)
    this.post_processor = PostProcessor.fromConfig(tokenizerJSON.post_processor)
    // Another slight hack to add `end_of_word_suffix` (if present) to the decoder
    // This is needed for cases where BPE model and ByteLevel decoder are used
    // For more information, see https://github.com/xenova/transformers.js/issues/74
    // TODO: save this to the decoder when exporting?
    this.decoder = Decoder.fromConfig(tokenizerJSON.decoder, this.model.end_of_word_suffix)

    // Add added_tokens to model
    for (let addedToken of tokenizerJSON.added_tokens) {
      let id = addedToken.id
      let content = addedToken.content

      this.added_tokens.push(content)

      this.model.tokens_to_ids.set(content, id)
      this.model.vocab[id] = content

      if (addedToken.special) {
        this.special_tokens.push(content)
        this.all_special_ids.push(id)
      }
    }

    // Update additional_special_tokens
    this.special_tokens.push(...(tokenizerConfigJSON.additional_special_tokens ?? []))
    this.special_tokens = [...new Set(this.special_tokens)]
    // Remove duplicates

    // Slight hack, but it prevents code duplication:
    this.decoder.added_tokens = this.added_tokens

    this.added_tokens_regex =
      this.added_tokens.length > 0
        ? new RegExp(
            '(' +
              this.added_tokens
                // escapeRegex
                .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('|') +
              ')'
          )
        : null

    // Set mask token if present (otherwise will be undefined, which is fine)
    this.mask_token = this.getToken(tokenizerConfigJSON, 'mask_token')
    this.mask_token_id = this.model.tokens_to_ids.get(this.mask_token)

    this.pad_token = this.getToken(tokenizerConfigJSON, 'pad_token', 'eos_token')
    this.pad_token_id = this.model.tokens_to_ids.get(this.pad_token)

    this.sep_token = this.getToken(tokenizerConfigJSON, 'sep_token')
    this.sep_token_id = this.model.tokens_to_ids.get(this.sep_token)

    this.model_max_length = tokenizerConfigJSON.model_max_length

    /** @type {boolean} Whether or not to strip the text when tokenizing (removing excess spaces before and after the string). */
    this.remove_space = tokenizerConfigJSON.remove_space

    this.clean_up_tokenization_spaces = tokenizerConfigJSON.clean_up_tokenization_spaces ?? true
    this.do_lowercase_and_remove_accent =
      tokenizerConfigJSON.do_lowercase_and_remove_accent ?? false
  }
  /**
   * Returns the value of the first matching key in the tokenizer config object.
   * @param {...string} keys One or more keys to search for in the tokenizer config object.
   * @returns {string|null} The value associated with the first matching key, or null if no match is found.
   * @throws {Error} If an object is found for a matching key and its __type property is not "AddedToken".
   */
  getToken(tokenizerConfigJSON: TokenizerConfigJSON, ...keys: string[]) {
    for (let key of keys) {
      let item = tokenizerConfigJSON[key]

      if (!item) continue

      if (typeof item === 'object') {
        if (item.__type === 'AddedToken') {
          return item.content
        } else {
          throw Error(`Unknown token: ${item}`)
        }
      } else {
        return item
      }
    }
    return null
  }
  prepare_model_inputs<T>(inputs: T) {
    return inputs
  }

  _call(
    // Required positional arguments
    text,
    // Optional keyword arguments
    {
      text_pair = null,
      add_special_tokens = true,
      padding = false,
      truncation = null,
      max_length = null,
      return_tensor = true // Different to HF
    } = {}
  ) {
    let tokens: number[] | number[][] | Tensor

    if (Array.isArray(text)) {
      if (text.length === 0) {
        throw Error('text array must be non-empty')
      }

      if (text_pair !== null) {
        if (!Array.isArray(text_pair)) {
          throw Error('text_pair must also be an array')
        } else if (text.length !== text_pair.length) {
          throw Error('text and text_pair must have the same length')
        }

        tokens = text.map((t, i) =>
          this.encode(t, text_pair[i], {
            add_special_tokens
          })
        )
      } else {
        tokens = text.map((x) =>
          this.encode(x, null, {
            add_special_tokens
          })
        )
      }
    } else {
      if (text === null) {
        throw Error('text may not be null')
      }

      if (Array.isArray(text_pair)) {
        throw Error(
          'When specifying `text_pair`, since `text` is a string, `text_pair` must also be a string (i.e., not an array).'
        )
      }

      // For single input, we just wrap in an array, and then unwrap later.
      tokens = [
        this.encode(text, text_pair, {
          add_special_tokens
        })
      ]
    }
    // At this point, tokens is batched: [batch_size, tokens]
    // However, array may be jagged. So, we pad to max_length

    let maxLengthOfBatch = max(tokens.map((x) => x.length))[0]

    // If null, we calculate max length from sequences
    if (max_length === null) {
      max_length = maxLengthOfBatch
    }

    // Ensure it is less than model max length
    max_length = Math.min(max_length, this.model_max_length)

    let attention_mask = [] as any
    if (padding || truncation) {
      // Perform padding and/or truncation
      for (let i = 0; i < tokens.length; ++i) {
        if (tokens[i].length === max_length) {
          attention_mask.push(new Array(tokens[i].length).fill(1))
          continue
        } else if (tokens[i].length > max_length) {
          // possibly truncate
          if (truncation) {
            tokens[i] = tokens[i].slice(0, max_length)
          }
          attention_mask.push(new Array(tokens[i].length).fill(1))
        } else {
          // t.length < max_length
          if (padding) {
            let diff = max_length - tokens[i].length

            if (this.padding_side === 'right') {
              attention_mask.push(
                new Array(tokens[i].length).fill(1).concat(new Array(diff).fill(0))
              )
              tokens[i].push(...new Array(diff).fill(this.pad_token_id))
            } else {
              // left
              attention_mask.push(
                new Array(diff).fill(0).concat(new Array(tokens[i].length).fill(1))
              )
              tokens[i].unshift(...new Array(diff).fill(this.pad_token_id))
            }
          } else {
            attention_mask.push(new Array(tokens[i].length).fill(1))
          }
        }
      }
    } else {
      attention_mask = tokens.map((x) => new Array(x.length).fill(1))
    }

    if (return_tensor) {
      if (!(padding && truncation)) {
        // Not, guaranteed that all items have same length, so
        // we perform additional check

        if (tokens.some((x) => x.length !== tokens[0].length)) {
          throw Error(
            'Unable to create tensor, you should probably activate truncation and/or padding ' +
              "with 'padding=true' and 'truncation=true' to have batched tensors with the same length."
          )
        }
      }

      // Now we actually convert to tensor
      // NOTE: In the same way as the python library, we return a batched tensor, regardless of
      // whether we have a single input or multiple inputs.
      let dims = [tokens.length, tokens[0].length]

      tokens = new Tensor('int64', BigInt64Array.from(tokens.flat().map(BigInt)), dims)

      attention_mask = new Tensor(
        'int64',
        BigInt64Array.from(attention_mask.flat().map(BigInt)),
        dims
      )
    } else {
      // If not returning a tensor, we match the input type
      if (!Array.isArray(text)) {
        // Input was not batched, so we unwrap
        tokens = tokens[0]
        attention_mask = attention_mask[0]
      }
    }

    // Finally, add attention mask, and possibly model-specific parameters
    let modelInputs = {
      input_ids: tokens,
      attention_mask: attention_mask
    }

    // Optional post-processing
    modelInputs = this.prepare_model_inputs(modelInputs)

    return modelInputs
  }

  /**
   * Encodes a single text using the preprocessor pipeline of the tokenizer.
   *
   * @param {string|null} text The text to encode.
   * @returns {string[]|null} The encoded tokens.
   */
  _encode_text(text) {
    if (text === null) return null

    // Actual function which does encoding, for a single text
    // First, we take care of special tokens. Needed to avoid issues arising from
    // normalization and/or pretokenization (which may not preserve special tokens)
    const sections = this.added_tokens_regex
      ? text.split(this.added_tokens_regex).filter((x) => x)
      : [text]
    let tokens = sections
      .map((x) => {
        if (this.added_tokens.includes(x)) {
          // Ignore added tokens
          return x
        } else {
          if (this.remove_space === true) {
            x = x.trim().split(/\s+/).join(' ')
          }
          if (this.do_lowercase_and_remove_accent) {
            x = lowercase_and_remove_accent(x)
          }

          if (this.normalizer !== null) {
            x = this.normalizer.normalize(x)
          }

          let sectionTokens = this.pre_tokenizer !== null ? this.pre_tokenizer.pre_tokenize(x) : [x]

          let tokens = this.model.encode(sectionTokens)

          return tokens
        }
      })
      .flat()

    return tokens
  }

  /**
   * Encodes a single text or a pair of texts using the model's tokenizer.
   *
   * @param {string} text The text to encode.
   * @param {string|null} text_pair The optional second text to encode.
   * @param {Object} options An optional object containing the following properties:
   * @param {boolean} [options.add_special_tokens=true] Whether or not to add the special tokens associated with the corresponding model.
   * @returns {number[]} An array of token IDs representing the encoded text(s).
   */
  encode(text, text_pair = null, {add_special_tokens = true} = {}) {
    // Function called by users to encode possibly multiple texts
    let tokens = this._encode_text(text)
    let tokens2 = this._encode_text(text_pair)

    // TODO improve `add_special_tokens` and ensure correctness
    let combinedTokens =
      this.post_processor !== null && add_special_tokens
        ? this.post_processor.post_process(tokens, tokens2)
        : [...(tokens ?? []), ...(tokens2 ?? [])]

    let ids = this.model.convert_tokens_to_ids(combinedTokens)
    return ids
  }

  /**
   * Decode a batch of tokenized sequences.
   * @param {number[][]} batch List of tokenized input sequences.
   * @param {Object} decode_args (Optional) Object with decoding arguments.
   * @returns {string[]} List of decoded sequences.
   */
  batch_decode(batch, decode_args = {}) {
    return batch.map((x) => this.decode(x, decode_args))
  }

  /**
   * Decodes a sequence of token IDs back to a string.
   *
   * @param {number[]} token_ids List of token IDs to decode.
   * @param {Object} [decode_args={}]
   * @param {boolean} [decode_args.skip_special_tokens=false] If true, special tokens are removed from the output string.
   * @param {boolean} [decode_args.clean_up_tokenization_spaces=true] If true, spaces before punctuations and abbreviated forms are removed.
   *
   * @returns {string} The decoded string.
   * @throws {Error} If `token_ids` is not a non-empty array of integers.
   */
  decode(token_ids, decode_args = {}) {
    if (!Array.isArray(token_ids) || token_ids.length === 0 || !isIntegralNumber(token_ids[0])) {
      throw Error('token_ids must be a non-empty array of integers.')
    }

    return this.decode_single(token_ids, decode_args)
  }

  /**
   * Decode a single list of token ids to a string.
   * @param {number[]} token_ids List of token ids to decode
   * @param {Object} decode_args Optional arguments for decoding
   * @param {boolean} [decode_args.skip_special_tokens=false] Whether to skip special tokens during decoding
   * @param {boolean} [decode_args.clean_up_tokenization_spaces=null] Whether to clean up tokenization spaces during decoding.
   * If null, the value is set to `this.decoder.cleanup` if it exists, falling back to `this.clean_up_tokenization_spaces` if it exists, falling back to `true`.
   * @returns {string} The decoded string
   */
  decode_single(token_ids, {skip_special_tokens = false, clean_up_tokenization_spaces = null}) {
    let tokens = this.model.convert_ids_to_tokens(token_ids)
    if (skip_special_tokens) {
      tokens = tokens.filter((x) => !this.special_tokens.includes(x))
    }

    /** @type {string} */
    let decoded = this.decoder.decode(tokens)

    // Slight hack, but prevents having to pass `skip_special_tokens` to
    // each call to `decode`, which would lead to code duplication.
    if (this.decoder.end_of_word_suffix) {
      decoded = decoded.replaceAll(this.decoder.end_of_word_suffix, ' ')
      if (skip_special_tokens) {
        decoded = decoded.trim()
      }
    }

    if (clean_up_tokenization_spaces ?? this.clean_up_tokenization_spaces) {
      decoded = clean_up_tokenization(decoded)
    }

    return decoded
  }
}

export class BertTokenizer<
  TNorm extends Normalizer,
  TPre extends PreTokenizer,
  TModel extends TokenizerModel,
  TPost extends PostProcessor,
  TDec extends Decoder
> extends Tokenizer<TNorm, TPre, TModel, TPost, TDec> {}
