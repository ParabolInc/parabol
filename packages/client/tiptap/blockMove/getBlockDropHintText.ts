export const getBlockDropHintText = ({
  title,
  refusal
}: {
  title: string
  refusal: string | null | undefined
}) => refusal || `Move to the bottom of ${title}`
