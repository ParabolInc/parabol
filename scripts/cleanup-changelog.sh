#!/bin/bash
# replace uppercase words: with bold to preserve these
# replace lowercase words: with nothing as these are the conventional commit categories
# replace lowercase words (with parens): with bold to preserve the title
sed -i.bak -E '
  s/^- ([A-Z][[:lower:]]*): /- **\1**: /
  s/^- ([[:lower:]]*): ?/- /
  s/^- ([[:lower:]]*)\((.*)\): ?/- **\2**: /
' CHANGELOG.md && rm CHANGELOG.md.bak
