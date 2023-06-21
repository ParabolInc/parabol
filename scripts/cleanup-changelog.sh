#!/bin/bash
# replace uppercase words: with bold to preserver these
# replace lowercase words: with nothing as these are the conventional commit categories
# replace lowercase words (with parens): with bold to preserve the title
sed -i -E '
  s/^- ([A-Z]\w*): /- **\1**: /
  s/^- \w*: ?/- /
  s/^- \w*\((.*)\): ?/- **\1**: /
' CHANGELOG.md
