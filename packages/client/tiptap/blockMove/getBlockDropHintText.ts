export const getBlockDropHintText = ({
  title,
  refusal,
  count
}: {
  title: string
  refusal: string | null | undefined
  count: number | null | undefined
}) =>
  refusal ||
  (count && count > 1
    ? `Move ${count} blocks to the bottom of ${title}`
    : `Move to the bottom of ${title}`)
