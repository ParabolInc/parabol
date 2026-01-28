interface Props {
  title: string
}

export const SearchResultSectionHeader = (props: Props) => {
  const {title} = props
  return (
    <h3 className='sticky top-0 z-10 flex flex-1 items-center text-nowrap bg-white px-1 pb-0 font-medium text-xs'>
      {title}
    </h3>
  )
}
