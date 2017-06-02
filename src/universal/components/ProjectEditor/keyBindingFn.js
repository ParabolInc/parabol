import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';

const {hasCommandModifier} = KeyBindingUtil;

const keyBindingFn = (e) => {
  console.log(`__${e.key}__`)
  if (e.key === 'X' && hasCommandModifier(e)) {
    return 'strikethrough';
  } else if (e.key === ' ') {
    // handleBeforeInput is buggy, let's just intercept space commands & handle them ourselves
    return 'space';
  }
  return getDefaultKeyBinding(e);
};

export default keyBindingFn;
