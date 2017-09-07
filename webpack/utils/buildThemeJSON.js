import fs from 'fs';
import theme from '../../src/universal/styles/theme/theme';

const BUILD_DIR = './build';
const OUTPUT_FILE = `${BUILD_DIR}/appTheme.json`;


if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR);
}
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(theme));
