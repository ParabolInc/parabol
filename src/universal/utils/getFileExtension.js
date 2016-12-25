
/*
 * "a.b"     (=> "b")
 * "a"       (=> "")
 * ".hidden" (=> "")
 * ""        (=> "")
 * null      (=> "")
 * "a.b.c.d" (=> "d")
 * ".a.b"    (=> "b")
 * "a..b"    (=> "b")
 *
 * See: http://stackoverflow.com/posts/190933/revisions
 */

export default function getFileExtension(filename) {
  const ext = /^.+\.([^.]+)$/.exec(filename);
  return ext == null ? '' : ext[1];
}
