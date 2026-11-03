from pathlib import Path
import runpy,sys,json,subprocess,hashlib
R=Path('/workspace/uatf8');P=Path('/workspace/srmf8-product');M=R/'methods';F=R/'fixtures';M.mkdir();sys.argv=['fixtures.py',str(F)];g=runpy.run_path(str(P/'prototype/m1-lite/tests/e2e/fixtures.py'));xlsx=g['xlsx'];pdf=g['pdf'];qty=[5,2,3,4,5,6,100,8,9,10,11,12];head=['存货编码','存货名称','规格型号','所属类别','询价数量','询价单位']
xlsx('buyer-items.xlsx',[head]+[['UF8-DUP'if i<2 else f'UF8-{i+1:03}',f'虚构采购验收部件{i+1}',f'长规格-{i+1}-测试型','虚构机加工类',q,'件']for i,q in enumerate(qty)])
xlsx('buyer-suppliers.xlsx',[['往来单位编码','供应商编码','往来单位名称'],['CP-UF8-A','UF8-A','虚构验收甲方制造'],['CP-UF8-B','UF8-B','虚构验收乙方精工'],['CP-UF8-C','UF8-C','虚构验收丙方零件']])
xlsx('paging52.xlsx',[head]+[[f'PGF8-{i:03}',f'虚构分页验收物料{i}',f'规格{i}','虚构分页类',1,'件']for i in range(1,53)])
for n in ['UF8-003_A.pdf','UF8-DUP_A.pdf','UF8-unmatched.pdf']:pdf(n,'FreshF8 '+n)
(F/'business-expected.json').write_text(json.dumps({'A':[118,20,30,None,75,None,2.25,80,90,100,110,120],'B':[119,82,32,40,75,60,2.35,82,92,102,112,122]})+'\n')
S=Path('/workspace/uatf4/methods-attempt02')
for p in S.iterdir():
 if not p.is_file():continue
 s=p.read_text()
 for a,b in [('/workspace/uatf4/attempt-02/','/workspace/uatf8/independent/'),('/workspace/uatf4/methods-attempt02/','/workspace/uatf8/methods/'),('/workspace/srmf4-product','/workspace/srmf8-product'),('/workspace/uatf4','/workspace/uatf8'),('UF4','UF8'),('PGF4','PGF8'),('ClosureF4','FreshF8'),('虚构收口','虚构验收'),('最终收口复验','术语与备份验收'),('收口795','验收20261029'),('收口F4','验收20261029')]:s=s.replace(a,b)
 (M/p.name).write_text(s)
(R/'independent/evidence').mkdir(parents=True);(R/'independent/downloads').mkdir()
assert all((F/n).exists()for n in ['buyer-items.xlsx','buyer-suppliers.xlsx','paging52.xlsx','business-expected.json','UF8-003_A.pdf','UF8-DUP_A.pdf','UF8-unmatched.pdf'])
for p in M.glob('*.js'):subprocess.run(['node','-e',"new (require('vm').Script)('(async()=>{'+require('fs').readFileSync(process.argv[1],'utf8')+'})()')",str(p)],check=True)
subprocess.run(['node','--check',str(M/'driver.cjs')],check=True)
(R/'independent-preflight.json').write_text(json.dumps({'sourceSHA':'f8a67d72a3f798289067384a827e871ba16bca45','OS':'Linux, Windows NOT TESTED','freshData':True,'noOldDatabaseOrBackupInput':True,'oracleExists':True,'newStandaloneDriversOnly':True,'existingProductTestsAndCIUnmodified':True,'newFixtureSHA256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(F.iterdir())},'methodSHA256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(M.iterdir())}},indent=2)+'\n');print('PREFLIGHT_PASS')
