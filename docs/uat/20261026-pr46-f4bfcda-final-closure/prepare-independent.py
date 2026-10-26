from pathlib import Path
import runpy,sys,json,hashlib,subprocess
R=Path('/workspace/uatf4');P=Path('/workspace/srmf4-product');F=R/'fixtures';M=R/'methods';M.mkdir();sys.argv=['fixtures.py',str(F)];g=runpy.run_path(str(P/'prototype/m1-lite/tests/e2e/fixtures.py'));xlsx=g['xlsx'];pdf=g['pdf']
qty=[5,2,3,4,5,6,100,8,9,10,11,12];header=['存货编码','存货名称','规格型号','所属类别','询价数量','询价单位']
xlsx('buyer-items.xlsx',[header]+[['UF4-DUP'if i<2 else f'UF4-{i+1:03}',f'虚构收口验收部件{i+1}',f'长规格-{i+1}-测试型','虚构机加工类',q,'件']for i,q in enumerate(qty)])
xlsx('buyer-suppliers.xlsx',[['往来单位编码','供应商编码','往来单位名称'],['CP-UF4-A','UF4-A','虚构收口甲方制造'],['CP-UF4-B','UF4-B','虚构收口乙方精工'],['CP-UF4-C','UF4-C','虚构收口丙方零件']])
xlsx('paging52.xlsx',[header]+[[f'PGF4-{i:03}',f'虚构分页收口物料{i}',f'规格{i}','虚构分页类',1,'件']for i in range(1,53)])
for n in ['UF4-003_A.pdf','UF4-DUP_A.pdf','UF4-unmatched.pdf']:pdf(n,'ClosureF4 '+n)
for p in Path('/workspace/uat795/methods').iterdir():
 if not p.is_file():continue
 s=p.read_text()
 for a,b in [('/workspace/uat795','/workspace/uatf4'),('/tmp/srm795-product','/workspace/srmf4-product'),('attempt-03','independent'),('U795','UF4'),('UF795','UF4'),('PG795','PGF4'),('Remediation795','ClosureF4'),('虚构整改','虚构收口'),('整改复验','最终收口复验'),('整改795','收口F4')]:s=s.replace(a,b)
 (M/p.name).write_text(s)
# New independent driver, strict complete-row observation; original test files stay untouched.
p=M/'04b-ux09-independent.js';s=p.read_text().replace('top:box.top,line:','top:box.top,bottom:box.bottom,viewport:window.innerHeight,scrollY:window.scrollY,line:').replace("await verify('UX09 1366 first actual quote visible',values[0].top<768,true)","await verify('UX09 1366 complete first actual quote visible at scrollY0',values[0].top>=0&&values[0].bottom<=768&&values[0].scrollY===0,true)");p.write_text(s)
# No prior round databases, ZIPs or business JSON are inputs; fixed arithmetic is the explicitly requested fixture.
(R/'fixture-generation.json').write_text(json.dumps({'freshCurrentGenerator':str(P/'prototype/m1-lite/tests/e2e/fixtures.py'),'quantities':qty,'expectedManual':1979,'expectedTheory':6940,'expectedMixed':7064,'freshSyntheticCodes':'UF4,PGF4','priorDatabaseOrZipInput':False,'pdfMarker':'ClosureF4','files':[{'name':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(F.iterdir())]},ensure_ascii=False,indent=2)+'\n')
(R/'independent/evidence').mkdir(parents=True);(R/'independent/downloads').mkdir()
# Parse each standalone JS method in async context before any UI action.
names=[]
for p in M.glob('*.js'):
 subprocess.run(['node','-e',"new (require('vm').Script)('(async()=>{'+require('fs').readFileSync(process.argv[1],'utf8')+'})()')",str(p)],check=True);names.append(p.name)
subprocess.run(['node','--check',str(M/'driver.cjs')],check=True)
assert not any('/workspace/uat795'in p.read_text()or'/tmp/srm795'in p.read_text()or'attempt-03'in p.read_text()for p in M.iterdir()if p.is_file())
(R/'independent-preflight.json').write_text(json.dumps({'JSparsePASS':names+['driver.cjs'],'pathsNewRootOnly':True,'clickTarget':'Explicit .quotePrice, not whole-cell center','toggles':'open() tests current open state; importer tests visibility before toggling','async':'Visible/enabled and original response/saved predicate before dependent actions','backendBody':'Node fetch/APIRequest body, never Page Response.json','S4':'Valid current ZIP_STORED, same-length one-byte PDF change, unchanged manifest and rebuiltCRC','exportValidator':'Explicit real root argument','originalTestsModified':False,'methodHashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(M.iterdir())if p.is_file()}},indent=2)+'\n');print('NEW_INDEPENDENT_PREFLIGHT_PASS',len(names))
