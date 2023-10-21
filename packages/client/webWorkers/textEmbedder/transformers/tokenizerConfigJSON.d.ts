interface TokenizerConfigDecoder {
  [id: string]: {
    content: string
    lstrip: boolean
    normalized: boolean
    rstrip: boolean
    single_word: boolean
    special: boolean
  }
}

export interface TokenizerConfigJSON {
  added_tokens_decoder: TokenizerConfigDecoder
  additional_special_tokens: string[]
  clean_up_tokenization_spaces: boolean
  cls_token: string
  do_basic_tokenize: boolean
  do_lower_case: boolean
  do_lowercase_and_remove_accent?: boolean
  mask_token: string
  max_length: number
  model_max_length: number
  never_split: string[] | null
  pad_to_multiple_of: number | null
  pad_token: string
  pad_token_type_id: number
  padding_side: string
  remove_space?: boolean
  sep_token: string
  stride: number
  strip_accents: number | null
  tokenize_chinese_chars: boolean
  tokenizer_class: string
  truncation_side: string
  truncation_strategy: string
  unk_token: string
}
