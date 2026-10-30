import difflib, pathlib, sys
old, new = map(pathlib.Path, sys.argv[1:3])
patch = ''
for name in ('cdp.cjs','act.cjs','preflight.cjs'):
    patch += ''.join(difflib.unified_diff((old/name).read_text(encoding='utf-8').splitlines(True), (new/name).read_text(encoding='utf-8').splitlines(True), fromfile='prior-evidence/'+name,tofile='current-driver/'+name))
(new/'driver-diff.patch').write_text(patch,encoding='utf-8')
