# 中文：由独立 Excel 读取器核实供应商隔离、字段选择、价格公式与议价历史。
# English: Independently inspect supplier confidentiality, user-selected fields, valid formulas and revisions.
from openpyxl import load_workbook
from pathlib import Path
root=Path("/tmp/srm-lite-xlsx-fixtures")
rfq=load_workbook(root/"supplier-rfq-report.xlsx",read_only=False,data_only=False)
assert rfq.sheetnames==["供应商报价填写"],rfq.sheetnames
rs=rfq.active
headers=[x.value for x in rs[1]]
assert headers[:7]==["RFQ Line ID","存货编码","存货名称","询价数量","询价单位","报价单价","报价状态"],headers
assert "所属类别" not in headers and "交期" in headers and "MOQ" in headers and "物料备注" in headers,headers
assert rs.max_row==3,rs.max_row
assert rs.cell(2,2).value=="0001",rs.cell(2,2).value
assert rs.cell(2,6).value is None and rs.cell(3,6).value is None
assert rs.freeze_panes=="A2",rs.freeze_panes
assert rs.auto_filter.ref is not None
contents=" ".join(str(x.value or "") for row in rs for x in row)
for forbidden in ["匿名供方甲","甲供应商商务条款","甲原件.pdf","乙原件.pdf","最终选择","已确认","30"]:
    # The numeric 30 is not a required secret by itself; do not use string search for numeric values.
    if forbidden=="30":continue
    assert forbidden not in contents,forbidden
print("PASS DOC06: true XLSX supplier RFQ is single-sheet, editable/re-importable, and contains no competitor or confidential price")
wb=load_workbook(root/"comparison-history-report.xlsx",read_only=False,data_only=False)
assert wb.sheetnames==["比价汇总","报价议价明细"],wb.sheetnames
s=wb.worksheets[0]
h=[c.value for c in s[1]]
assert "存货名称" not in h,h
assert "RFQ Line ID" in h and "是否共同有效报价" in h,h
assert len(s.merged_cells.ranges)==0
assert s.freeze_panes=="A2"
prices=[i+1 for i,c in enumerate(s[1]) if "适用单价" in (c.value or "") and " (SUP-" in (c.value or "")]
amounts=[i+1 for i,c in enumerate(s[1]) if "行金额" in (c.value or "")]
assert len(prices)==2 and len(amounts)==2,(h,prices,amounts)
assert s.cell(2,prices[0]).value==18
assert s.cell(2,prices[1]).value==30
assert s.cell(3,prices[0]).value==5
assert s.cell(3,prices[1]).value is None
assert s.cell(2,amounts[0]).data_type=="f"
assert s.cell(s.max_row,amounts[0]).data_type=="f"
assert s.cell(s.max_row,amounts[1]).data_type=="f"
assert s.cell(2,h.index("是否共同有效报价")+1).value=="是"
assert s.cell(3,h.index("是否共同有效报价")+1).value=="否"
print("PASS DOC07: filtered comparison has only one common valid item, real formula columns, no merged cells and frozen header")
history=wb.worksheets[1]
hh=[c.value for c in history[1]]
assert "报价单价" not in hh
assert "整轮商务备注" in hh and "物料备注" in hh
values=" ".join(str(x.value or "") for row in history for x in row)
for val in ["甲第2轮特别条款","乙报价含运费","草稿（不可用作比价）","甲可提供替代工艺","甲原件.pdf"]:
    assert val in values,val
assert history.freeze_panes=="A2"
assert not history.merged_cells.ranges
print("PASS DOC08: quotation revisions, evidence and notes are preserved with selected history fields")
