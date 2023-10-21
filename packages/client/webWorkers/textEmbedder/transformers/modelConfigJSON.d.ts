export interface ModelConfigJSON {
  _name_or_path: string
  architectures: string[]
  attention_probs_dropout_prob: number
  classifier_dropout: number | null
  hidden_act: string
  hidden_dropout_prob: number
  hidden_size: number
  id2label: {[key: string]: string}
  initializer_range: number
  intermediate_size: number
  label2id: {[key: string]: number}
  layer_norm_eps: number
  max_position_embeddings: number
  model_type: string
  num_attention_heads: number
  num_hidden_layers: number
  pad_token_id: number
  position_embedding_type: string
  torch_dtype: string
  transformers_version: string
  type_vocab_size: number
  use_cache: boolean
  vocab_size: number
}
