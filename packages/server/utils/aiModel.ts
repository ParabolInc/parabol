/**
 * The one model every OpenAI call in the app uses, so swapping it is a single edit.
 *
 * It is a reasoning model: it rejects `temperature`, `top_p`, `frequency_penalty`, and
 * `presence_penalty`, and it spends hidden reasoning tokens against `max_completion_tokens`
 * before emitting a visible one. Cap output generously enough to leave room for that and control
 * length in the prompt instead.
 *
 * Callers separate themselves by `reasoning_effort`, not by model. Pass 'low' whenever a user is
 * waiting on the answer; leave it at the default only where the analysis is itself the feature.
 * Effort is the cost knob too, since AIRequest.tokenCost bills reasoning tokens against the
 * caller's 500k monthly quota.
 */
export const AI_MODEL = 'gpt-5.6-luna'
