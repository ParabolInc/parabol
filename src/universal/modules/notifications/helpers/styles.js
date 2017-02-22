import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

export default {
  message: {
    color: appTheme.palette.dark,
    flex: 1,
    fontSize: appTheme.typography.sBase,
    lineHeight: 1.5,
    marginLeft: ui.rowGutter,
  },
  messageVar: {
    color: appTheme.palette.cool,
    fontWeight: 700
  },
  messageSub: {
    color: appTheme.palette.dark10d,
    fontSize: appTheme.typography.s2,
    marginTop: '.25rem'
  },
  button: {
    marginLeft: ui.rowGutter,
    minWidth: '4.25rem'
  },
  buttonGroup: {
    display: 'flex'
  }
};
