const isGroupTitleUserDefined = ({
  title,
  smartTitle
}: {
  title: string | null
  smartTitle: string | null
}) => (title ? title !== smartTitle : false)

export default isGroupTitleUserDefined
