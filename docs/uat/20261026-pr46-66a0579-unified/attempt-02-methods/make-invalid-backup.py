import zipfile,json,pathlib
r=pathlib.Path('/tmp/uat66');src=r/'attempt-02/downloads/unified-S4-full.zip';out=r/'fixtures/tampered-current-S4.zip'
with zipfile.ZipFile(src)as z,zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED)as target:
 manifest=json.loads(z.read('manifest.json'));victim=manifest['assets'][0]['path']
 for name in z.namelist():target.writestr(name,z.read(name)+(b'\nFictional integrity-negative test\n'if name==victim else b''))
