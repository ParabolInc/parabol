const handleHotkey = (gotoFunc, submitting) => () => {
  if (!submitting && document.activeElement === document.body) gotoFunc();
};

export default handleHotkey;
