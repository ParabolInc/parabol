#!/bin/bash
# replace uppercase words: with bold to preserve these
# replace lowercase words: with nothing as these are the conventional commit categories
# replace lowercase words (with parens): with bold to preserve the title
sed -i.bak -E '
  s/^- ([[:upper:]][[:alnum:]]*): /- **\1**: /
  s/^- ([[:alnum:]]*): ?/- /
  s/^- ([[:alnum:]]*)\((.*)\): ?/- **\2**: /
' CHANGELOG.md && rm CHANGELOG.md.bak
