# 中文：用独立 openpyxl 验证 SRM 导出的 Excel 是真正可读取的三 Sheet 工作簿。
# English: Independently validate the actual SRM XLSX download is parseable by Excel-compatible tooling.
from pathlib import Path
from openpyxl import load_workbook
p=Path("/tmp/srm-lite-xlsx-fixtures/exported-business.xlsx")
wb=load_workbook(p,read_only=True,data_only=False)
assert wb.sheetnames==["询价物料","供应商","报价明细"],wb.sheetnames
items=list(wb["询价物料"].values)
assert items[0]==("RFQ Line ID","存货编码","存货名称","所属类别","询价数量","询价单位"),items[0]
assert items[1][1]=="0001" and items[1][4]==10,items[1]
suppliers=list(wb["供应商"].values)
assert suppliers[1]==("CP-01","SUP-01","匿名供应商甲"),suppliers[1]
quotes=list(wb["报价明细"].values)
assert len(quotes)==3,quotes
assert quotes[1][4]=="报价有效期30天、含包装",quotes[1]
assert any(row[13]=="更换包装；可替代，需确认" and row[9]==12.5 for row in quotes[1:]),quotes
assert all(not cell.data_type=="f" for ws in wb for row in ws for cell in row)
print("PASS EXCEL11: openpyxl independently validates SRM workbook, all 3 sheets, original IDs, quantities, prices and remarks")
