from pathlib import Path
import sys,runpy,json,hashlib,subprocess
R=Path('/workspace/uatd7');P=Path('/workspace/srmd7-product');F=R/'fixtures';M=R/'methods';M.mkdir();sys.argv=['fixtures.py',str(F)];g=runpy.run_path(str(P/'prototype/m1-lite/tests/e2e/fixtures.py'));xlsx=g['xlsx'];pdf=g['pdf'];q=[5,2,3,4,5,6,100,8,9,10,11,12];h=['存货编码','存货名称','规格型号','所属类别','询价数量','询价单位']
xlsx('buyer-items.xlsx',[h]+[['UD7-DUP'if i<2 else f'UD7-{i+1:03}',f'虚构采购验收部件{i+1}',f'长规格-{i+1}-测试型','虚构机加工类',n,'件']for i,n in enumerate(q)])
xlsx('buyer-suppliers.xlsx',[['往来单位编码','供应商编码','往来单位名称'],['CP-UD7-A','UD7-A','虚构复验甲方制造'],['CP-UD7-B','UD7-B','虚构复验乙方精工'],['CP-UD7-C','UD7-C','虚构复验丙方零件']])
xlsx('paging52.xlsx',[h]+[[f'PGD7-{i:03}',f'虚构分页复验物料{i}',f'规格{i}','虚构分页类',1,'件']for i in range(1,53)])
for n in ['UD7-003_A.pdf','UD7-DUP_A.pdf','UD7-unmatched.pdf']:pdf(n,'FreshD7 '+n)
(F/'business-expected.json').write_text(json.dumps({'A':[118,20,30,None,75,None,2.25,80,90,100,110,120],'B':[119,82,32,40,75,60,2.35,82,92,102,112,122]})+'\n')
for p in Path('/workspace/uatf8/methods-attempt02').iterdir():
 if not p.is_file()or p.suffix not in ['.js','.cjs','.py']:continue
 s=p.read_text()
 for a,b in [('/workspace/uatf8/attempt-02/','/workspace/uatd7/independent/'),('/workspace/uatf8/methods-attempt02/','/workspace/uatd7/methods/'),('/workspace/uatf8','/workspace/uatd7'),('/workspace/srmf8-product','/workspace/srmd7-product'),('UF8','UD7'),('PGF8','PGD7'),('FreshF8','FreshD7'),('虚构验收甲方','虚构复验甲方'),('虚构验收乙方','虚构复验乙方'),('虚构验收丙方','虚构复验丙方'),('虚构验收验收部件','虚构采购验收部件'),('术语与备份验收','浮层及恢复复验')]:s=s.replace(a,b)
 if p.name=='12-stored-s4-negative.js':
  s=s.replace("await expect(target.locator('#pilotS4RestoreFeedback')).toContainText('RESTORE_PDF_HASH_MISMATCH');","await expect(target.locator('#pilotS4RestoreFeedback')).toContainText('图纸完整性校验未通过');await expect(target.locator('#pilotS4RestoreFeedback')).not.toContainText(/RESTORE_[A-Z_]+/);")
  s=s.replace("await expect(target.locator('#pilotS4RestoreFeedback')).toContainText('禁止');","await expect(target.locator('#pilotS4RestoreFeedback')).toContainText('不能直接覆盖恢复');await expect(target.locator('#pilotS4RestoreFeedback')).not.toContainText(/RESTORE_[A-Z_]+/);")
 if p.name=='06-backup-classification.js':s=s.replace("await expect(classPage.locator('#pilotS4RestoreFeedback')).toContainText('未成功');","await expect(classPage.locator('#pilotS4RestoreFeedback')).toContainText('不是完整备份');await expect(classPage.locator('#pilotS4RestoreFeedback')).toContainText('下载完整备份');await expect(classPage.locator('#pilotS4RestoreFeedback')).not.toContainText(/RESTORE_[A-Z_]+/);")
 (M/p.name).write_text(s)
(R/'independent/evidence').mkdir(parents=True);(R/'independent/downloads').mkdir()
for p in M.glob('*.js'):subprocess.run(['node','-e',"new (require('vm').Script)('(async()=>{'+require('fs').readFileSync(process.argv[1],'utf8')+'})()')",str(p)],check=True)
subprocess.run(['node','--check',str(M/'driver.cjs')],check=True)
assert all((F/n).exists()for n in ['business-expected.json','buyer-items.xlsx','buyer-suppliers.xlsx','paging52.xlsx','UD7-003_A.pdf','UD7-DUP_A.pdf','UD7-unmatched.pdf'])
(R/'independent-preflight.json').write_text(json.dumps({'productSHA':'d7c4c88abd354ebdc5d3bfedfc9199e278c48483','freshCurrentFixtures':True,'oldDatabasesOrArchivesImported':False,'oraclePresent':True,'demoSnapshotNullable':True,'restorationUICopy':'Chinese business descriptions; backend audit still asserts real unchanged error codes','nonemptyUICopy':'不能直接覆盖恢复','materialTitleExpectedMatchesFixture':True,'priceSelectionTarget':'Actual .quotePrice buttons','toggles':'Checks open/visible state before toggling','S4':'STORED, same-length1byte PDFchange, manifest unchanged, correctCRC','existingProductTestsAndCIUnmodified':True,'methodSHA256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in M.iterdir()if p.is_file()},'fixtureSHA256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in F.iterdir()if p.is_file()}},indent=2)+'\n');print('CURRENT_SHA_INDEPENDENT_PREFLIGHT_PASS')
