import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';

const {hasCommandModifier} = KeyBindingUtil;

const keyBindingFn = (e) => {
  if (e.key === 'X' && hasCommandModifier(e)) {
    return 'strikethrough';
  }
  return getDefaultKeyBinding(e);
};

export default keyBindingFn;
