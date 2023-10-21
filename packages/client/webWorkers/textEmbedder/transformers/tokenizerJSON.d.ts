export interface TokenizerJSON {
  version: string
  truncation: {
    direction: string
    max_length: number
    strategy: string
    stride: number
  }
  padding: {
    strategy: {
      Fixed: number
    }
    direction: string
    pad_to_multiple_of: number | null
    pad_id: number
    pad_type_id: number
    pad_token: string
  }
  added_tokens: Array<{
    id: number
    content: string
    single_word: boolean
    lstrip: boolean
    rstrip: boolean
    normalized: boolean
    special: boolean
  }>
  normalizer: {
    type: string
    clean_text: boolean
    handle_chinese_chars: boolean
    strip_accents: boolean | null
    lowercase: boolean
  }
  pre_tokenizer: {
    type: string
  }
  post_processor: {
    type: string
    single: Array<{
      SpecialToken?: {
        id: string
        type_id: number
      }
      Sequence?: {
        id: string
        type_id: number
      }
    }>
    pair: Array<{
      SpecialToken?: {
        id: string
        type_id: number
      }
      Sequence?: {
        id: string
        type_id: number
      }
    }>
    special_tokens: {
      '[CLS]': {
        id: string
        ids: number[]
        tokens: string[]
      }
      '[SEP]': {
        id: string
        ids: number[]
        tokens: string[]
      }
    }
  }
  decoder: {
    type: string
    prefix: string
    cleanup: boolean
    trim_offsets?: boolean
  }
  model: {
    type: string
    unk_token: string
    continuing_subword_prefix: string
    max_input_chars_per_word: number
    vocab: {
      [key: string]: number
    }
    fuse_unk?: boolean
  }
}
