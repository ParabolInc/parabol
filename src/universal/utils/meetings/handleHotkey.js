const handleHotkey = (gotoFunc) => () => {
  if (document.activeElement === document.body) gotoFunc()
}

export default handleHotkey
