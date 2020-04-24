/* used to prevent scrollbars from out-of-bounds absolutes https://stackoverflow.com/questions/19308257/positionabsolute-causes-horizontal-scrollbar */
const hideBodyScroll = () => {
  const {
    body: {style: bodyStyle}
  } = document
  bodyStyle.overflow = 'hidden'
  bodyStyle.position = 'relative'
  return () => {
    bodyStyle.overflow = ''
    bodyStyle.position = ''
  }
}

export default hideBodyScroll
