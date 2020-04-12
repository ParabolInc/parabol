const handleHotkey = (gotoFunc: () => void) => () => {
  if (document.activeElement === document.body) gotoFunc()
}

export default handleHotkey
