import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

export default {
  message: {
    flex: 1,
    marginLeft: ui.rowGutter,
  },
  messageVar: {
    color: appTheme.palette.cool,
    fontWeight: 700
  },
  button: {
    marginLeft: ui.rowGutter,
    minWidth: '4.25rem'
  },
  buttonGroup: {
    display: 'flex'
  }
};
