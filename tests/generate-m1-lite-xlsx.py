# 中文：由独立的 openpyxl 创建真实压缩 XLSX 测试夹具，验证我们的导入不是循环自证。
# English: Build genuinely deflated Excel workbooks using independent openpyxl for real-world import tests.
from pathlib import Path
from openpyxl import Workbook
out=Path("/tmp/srm-lite-xlsx-fixtures")
out.mkdir(exist_ok=True)
def save(name,sheet,rows):
    wb=Workbook()
    ws=wb.active
    ws.title=sheet
    for row in rows: ws.append(row)
    wb.save(out/name)
save("items.xlsx","询价物料",[
    ["存货编码","存货名称","所属类别","询价数量","询价单位"],
    ["0001","虚构铰链","结构件",10,"件"],
    ["PART-002","虚构支架","结构件",3,"套"]])
save("suppliers.xlsx","供应商名录",[
    ["往来单位编码","供应商编码","往来单位名称"],
    ["CP-01","SUP-01","匿名供应商甲"],
    ["CP-02","SUP-02","匿名供应商乙"]])
save("quote.xlsx","报价明细",[
    ["存货编码","报价单价","交期","MOQ","报价状态","物料备注"],
    ["0001",12.5,7,1,"正常报价","更换包装；可替代，需确认"],
    ["PART-002",19.75,9,2,"正常报价","样品先行"]])
save("formula.xlsx","报价明细",[
    ["存货编码","报价单价","交期","MOQ","报价状态"],
    ["0001","=2*3",7,1,"正常报价"]])
save("bad_headers.xlsx","杂项",[
    ["无关字段","备注"],["x","y"]])
save("repeated_sheet.xlsx","询价物料",[
    ["存货编码","存货名称","所属类别","询价数量","询价单位"],
    ["A","A","A",1,"件"]])
wb=Workbook()
wb.active.title="材料甲"
wb.active.append(["存货编码","存货名称","询价数量","询价单位"])
wb.active.append(["A","甲",1,"件"])
ws=wb.create_sheet("材料乙")
ws.append(["存货编码","存货名称","询价数量","询价单位"])
ws.append(["B","乙",2,"件"])
wb.save(out/"multi_matching.xlsx")
print("PASS generated 7 independent .xlsx fixtures in",out)
