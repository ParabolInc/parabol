export type ReflectionInput = {id: string; text: string}

/**
 * Two shapes, chosen to keep the input as small as possible.
 *
 * When every reflection in the batch answers the same reflect prompt, naming it once at the top
 * beats repeating it on every line. When the batch spans columns the question genuinely varies, so
 * each reflection carries its own.
 */
export type GroupReflectionsInput =
  | {
      /** Shared by every reflection below, so it is stated once instead of per line */
      prompt: string
      reflections: ReflectionInput[]
    }
  | {
      reflections: (ReflectionInput & {prompt: string})[]
    }

export type GroupReflectionsResult = {
  groups: {
    title: string
    reflectionIds: string[]
  }[]
  tokenCost: number
}

export type GroupReflectionsOptions = {
  /** Replaces the built-in grouping strategy. The invariant rules & JSON shape still apply */
  userPrompt?: string | null
  signal?: AbortSignal
}
