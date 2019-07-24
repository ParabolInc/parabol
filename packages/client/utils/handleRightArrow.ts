const handleRightArrow = (cb: (e?: React.KeyboardEvent) => void) => (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowRight') {
    cb(e)
  }
}

export default handleRightArrow
