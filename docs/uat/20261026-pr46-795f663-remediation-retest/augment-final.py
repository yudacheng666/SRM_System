from pathlib import Path
import json,csv,shutil,hashlib,zipfile
R=Path('/workspace/uat795');D=Path('/tmp/srm66-evidence/docs/uat/20261026-pr46-795f663-remediation-retest')
for n in ['full-run-extra-three-readonly.json']:
 shutil.copy2(R/n,D/n)
shutil.copy2(R/'attempt-03/evidence/S4-tampered-PDF-readonly-info.json',D/'attempt-03/evidence/S4-tampered-PDF-readonly-info.json')
phase=json.loads((D/'automation/phase2/automated-results.json').read_text());extra=[]
for c in phase['cases']:
 if c['status']=='expected'or not any(t in c['title']for t in ['pending-only','manual-only','tied-lowest']):continue
 extra.append({'id':f'NEW-TEST-{len(extra)+1:02}','title':c['title'],'status':'FAIL','severity':'P2-TEST coverage gap, not a confirmed product arithmetic defect','classification':'CELL_CENTER_HITS_NEW_DETAIL_DISCLOSURE','facts':'Original test clicks an award cell center; screenshot/trace shows price detail expanded while manual count/amount unchanged. Current UI has a distinct .quotePrice button; independent explicit-button tests passed real pending, tie, higher-reason,1979/manual state,persistence. Original later assertions NOT REACHED. No original test edit/retry.','originalErrors':[e for r in c['results']for e in r['errors']],'evidence':'full-run-extra-three-readonly.json; automation/phase2/failures'})
assert len(extra)==3
(D/'automation/full-run-extra-classification.json').write_text(json.dumps(extra,ensure_ascii=False,indent=2)+'\n')
with(D/'results.csv').open('a',newline='')as f:
 w=csv.writer(f,lineterminator='\n')
 for a in extra:w.writerow([a['id'],'full-new-test-target-failure','FAIL',a['title'],a['facts'],'automation/full-run-extra-classification.json','795f663933f6883bc6e05d30b4ebbc2623a3301c'])
for name in ['REPORT.zh-CN.md','REPORT.en.md']:
 p=D/name;s=p.read_text()
 if name.endswith('zh-CN.md'):
  s=s.replace('保留 **P2-TEST-01（测试适配/覆盖缺口）**','保留 **P2-TEST-01（测试适配/覆盖缺口，共6条失败）**')
  paragraph='''### 完整套件额外三条FAIL（不是原15项的重复计数）

完整套件还发现三条此前通过的原测试失败，均点击整报价单元格中心，新布局该位置是详情入口；原截图/trace显示详情展开、没有执行预期的价格按钮定标：

| 测试 | 实际失败 |
|---|---|
| UX pending-only，171行 | 预期待决定11，实际12；第一行详情已展开 |
| UX manual-only，203行 | 预期人工191/3项，实际63/1项；部分整格点击只展开详情 |
| B3 tied-lowest，196行 | 预期人工1，实际0；同价乙方详情展开，未完成价格按钮选择 |

原始FAIL保留，后续断言NOT REACHED；不能因同类独立业务通过而删去这三条。分类为**测试点击目标与新布局不一致/覆盖缺口**；独立精确价格按钮已实际验证同价、高价理由、待决定分页、人工1979和持久化，暂未确认这些数值差异是产品计算缺陷。证据：[三条分类](automation/full-run-extra-classification.json)、[只读原trace动作](full-run-extra-three-readonly.json)及完整失败截图。ChatGPT应适配真实按钮目标并重新运行原测试，Codex不修。

'''
  s=s.replace('## 3. 完整原自动化',paragraph+'## 3. 完整原自动化')
  s=s.replace('处理剩余三条原测试适配和P3比价首屏/密度','处理剩余六条原测试交互/断言适配和P3比价首屏/密度')
  s=s.replace('PDF结构及页仍有效','PDF结构及页仍有效（事后只读pdfinfo退出0、2页，原结果一并归档）')
 else:
  paragraph='''### Three additional full-suite failures

These are outside the old15 and were not erased: UX pending-only line171 expects11pending but has12; UX manual-only line203 expects191/3manual but has63/1; B3 tied-lowest line196 expects1manual but has0. Original whole-cell center clicks now land on inline detail disclosures, visible expanded in original screenshots/traces. The independent explicit .quotePrice button path passed pending, ties, higher reasons, manual1979 and persistence; these are classified as test interaction/coverage mismatches, not confirmed arithmetic defects. Later original assertions remain NOT REACHED. Together with AF02/04/06 there are **six failed interaction/assertion tests**, plus the confirmed densityFAIL. [Classification](automation/full-run-extra-classification.json), [original trace actions](full-run-extra-three-readonly.json). No original test was fixed or rerun.

'''
  s=s.replace('## Confirmed P3-UX09-01 remains',paragraph+'## Confirmed P3-UX09-01 remains')
  s=s.replace('resolve the3remaining original-test adaptations','resolve the6remaining original-test interaction/assertion adaptations')
  s=s.replace('remainingPDF structure intact','remainingPDF structure intact (post-run read-only pdfinfo exit0,2pages; raw output archived)')
 p.write_text(s)
# Documentation bookend collection assertion, distinct from browser-driver corrections.
(D/'evidence-packaging-notes.json').write_text(json.dumps({'bookendCollection':'Initial read-only end-ref query mistakenly requested nonexistent refs/heads/M1 and omitted actual draft baseline/evidence ref; identical-file assertion failed. Corrected query uses the exact start ref set; actual refs unchanged. No browser driver, test assertion or product changed, no retest triggered.','rawError':'AssertionError while comparing differing queried ref sets','actualStartAndEndMatch':True,'driverCorrectionsRemain':2,'scope':'Evidence bookkeeping only'},indent=2)+'\n')
x=json.loads((D/'raw-error-register.json').read_text());x['fullRunAdditionalFailures']='automation/full-run-extra-classification.json (3 original whole-cell click mismatches)';x['evidenceBookkeeping']='evidence-packaging-notes.json';(D/'raw-error-register.json').write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
# Read-only independent trace integrity and density summary.
tr=[]
for p in D.glob('*/evidence/*trace*.zip'):
 with zipfile.ZipFile(p)as z:bad=z.testzip()
 tr.append({'path':str(p.relative_to(D)),'validCRC':bad is None,'badMember':bad});assert bad is None
(D/'independent-trace-integrity.json').write_text(json.dumps(tr,indent=2)+'\n')
log=[json.loads(l)for l in(R/'attempt-03/evidence/browser.jsonl').read_text().splitlines()];density=[]
for t in log:
 if t['kind']=='row-density':
  rows=t.get('rows',[]);hs=[q['height']for q in rows];density.append({'name':t.get('name'),'viewport':t.get('viewport'),'minHeight':min(hs)if hs else None,'maxHeight':max(hs)if hs else None,'rows':len(rows),'firstRowTop':rows[0].get('top')if rows else None,'raw':t})
(D/'row-density-summary.json').write_text(json.dumps({'entries':density,'independentBeforeAward':json.loads((D/'attempt-03/evidence/UX09-independent-before-awards.json').read_text()),'verdict':'FAIL:44.4375px and first row843.96875 at1366x768; same-line details/price PASS'},ensure_ascii=False,indent=2)+'\n')
shutil.copy2(R/'augment-final.py',D/'augment-final.py')
files=sorted(p for p in D.rglob('*')if p.is_file()and p.name!='SHA256SUMS');(D/'SHA256SUMS').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+str(p.relative_to(D))+'\n'for p in files))
print('FINAL_EVIDENCE',len(files),'files',sum(p.stat().st_size for p in files),'bytes; traces',len(tr))
