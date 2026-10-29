from pathlib import Path
import zipfile,json,hashlib,copy,zlib,sys
source=Path(sys.argv[1]);target=Path(sys.argv[2]);proof=Path(sys.argv[3]);checks=[]
def h(b):return hashlib.sha256(b).hexdigest()
def ck(name,a,b):
 ok=a==b;checks.append({'name':name,'actual':a,'expected':b,'pass':ok});assert ok,name
with zipfile.ZipFile(source)as z:
 ck('source CRC',z.testzip(),None);infos=z.infolist();names=z.namelist();manifest=z.read('manifest.json');m=json.loads(manifest);asset=m['assets'][0];victim=asset['path'];original=z.read(victim);marker=b'FreshFB';assert marker in original
 pos=original.index(marker);changed=original[:pos]+b'T'+original[pos+1:];ck('same PDF length',len(changed),len(original));ck('exactly one PDF byte changed',sum(a!=b for a,b in zip(original,changed)),1);ck('source matches manifest',h(original),asset['sha256']);ck('changed content differs from manifest',h(changed)!=asset['sha256'],True)
 with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_STORED,allowZip64=False)as out:
  for item in infos:
   info=copy.copy(item);info.compress_type=zipfile.ZIP_STORED;out.writestr(info,changed if item.filename==victim else z.read(item.filename),compress_type=zipfile.ZIP_STORED)
 with zipfile.ZipFile(target)as bad:
  ck('valid modified ZIP CRC',bad.testzip(),None);ck('same names/order',bad.namelist(),names);ck('all entries ZIP_STORED',all(i.compress_type==zipfile.ZIP_STORED for i in bad.infolist()),True);ck('no encrypted/directory entries',all(not(i.flag_bits&1)and not i.is_dir()for i in bad.infolist()),True);ck('manifest bytes unchanged',bad.read('manifest.json'),manifest);ck('all non-victim entries unchanged',all(bad.read(n)==z.read(n)for n in names if n!=victim),True);ck('manifest expected size unchanged and actual same',len(bad.read(victim)),asset['size']);ck('PDF CRC matches changed bytes',bad.getinfo(victim).CRC,zlib.crc32(changed)&0xffffffff)
# Store readable hashes rather than large byte objects in the JSON proof.
for c in checks:
 for k in ['actual','expected']:
  if isinstance(c[k],bytes):c[k]={'sha256':h(c[k]),'size':len(c[k])}
proof.write_text(json.dumps({'victim':victim,'expectedManifestSHA256':asset['sha256'],'actualChangedSHA256':h(changed),'manifestSHA256':h(manifest),'sourceZipSHA256':h(source.read_bytes()),'tamperedZipSHA256':h(target.read_bytes()),'byteChangeOffset':pos,'checks':checks,'checksPASS':len(checks)},indent=2)+'\n');print('STORED_TAMPER_PREFLIGHT_PASS',len(checks),flush=True)
