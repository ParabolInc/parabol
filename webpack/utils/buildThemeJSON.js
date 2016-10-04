import fs from 'fs';
import theme from '../../src/universal/styles/theme/theme';
fs.mkdirSync('./build');
fs.writeFileSync('./build/appTheme.json', JSON.stringify(theme));
