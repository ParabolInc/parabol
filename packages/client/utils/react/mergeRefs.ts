/**
 * Merges multiple React refs into a single ref callback.
 * Credit: https://github.com/gregberge/react-merge-refs
 */
export function mergeRefs<T = any>(
  ...refs: (React.MutableRefObject<T | null> | React.LegacyRef<T>)[]
): React.Ref<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref !== null) {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}
