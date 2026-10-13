# 中文：用独立 Python zipfile/openpyxl 核查各供应商 XLSX 只含自己的询价范围。
# English: Independently validate ZIP integrity, readable XLSX and supplier confidentiality.
import io
import zipfile
from pathlib import Path
from openpyxl import load_workbook

archive=Path("/tmp/srm-lite-bulk-tests/suppliers.zip")
assert archive.exists(),"批量 ZIP 文件未生成"
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None,"ZIP CRC32 损坏"
    names=z.namelist()
    assert len(names)==2 and len(set(names))==2,names
    assert all(n.endswith(".xlsx") for n in names),names
    expected={"SUP-A":(3,{"0001","0002","0003"}),"SUP-B":(2,{"0001","0002"})}
    for supplier,(count,codes) in expected.items():
        matches=[n for n in names if "_"+supplier+"_" in n]
        assert len(matches)==1,(supplier,names)
        with z.open(matches[0]) as f:
            blob=f.read()
        wb=load_workbook(io.BytesIO(blob),read_only=True,data_only=False)
        assert wb.sheetnames==["供应商报价填写"],wb.sheetnames
        rows=list(wb.active.values)
        headers=list(rows[0])
        assert "RFQ Line ID" in headers and "存货编码" in headers
        assert "所属类别" not in headers,"未选字段被错误导出"
        code_ix=headers.index("存货编码")
        price_ix=headers.index("报价单价")
        assert len(rows)-1==count,(supplier,len(rows))
        assert {str(r[code_ix]) for r in rows[1:]}==codes,(supplier,rows)
        assert all((r[price_ix] if len(r)>price_ix else None) in ("",None) for r in rows[1:]),"供应商询价单泄露已有报价"
        as_text="\n".join(str(x) for r in rows for x in r)
        if supplier=="SUP-A":
            assert "匿名供方乙" not in as_text and "乙报价含运费" not in as_text
        else:
            assert "匿名供方甲" not in as_text and "甲第2轮特别条款" not in as_text
        assert "最终选择供应商" not in as_text
    print("PASS ZIP01: two XLSX workbooks are independently readable, scoped and CRC-valid")
    print("PASS ZIP02: selected fields, blank supplier price cells and competitor confidentiality verified")
