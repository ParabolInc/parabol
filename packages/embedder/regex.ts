// grab the whole url, exclude <> for cases like <script src=https://bad.in></script>
export const URLRegex = /https?:\/\/[^<>\s]*\b/g
