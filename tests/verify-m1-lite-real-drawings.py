# 中文：独立于浏览器使用标准 Python 工具验收供方图纸隔离、PDF 哈希和完整 ZIP 恢复包。
# English: Independently audit vendor ZIP segregation, real PDF hashes and full backup integrity.
import io, json, hashlib, zipfile
from pathlib import Path
from openpyxl import load_workbook
folder=Path("/tmp/srm-drawings-test")
with zipfile.ZipFile(folder/"supplier-drawings.zip") as outer:
    assert outer.testzip() is None
    names=outer.namelist()
    assert len(names)==2 and all(n.endswith(".zip") for n in names),names
    expected={"FAKE-SUP-A":({"FAKE-PART-01"},2),"FAKE-SUP-B":({"FAKE-PART-02"},1)}
    for supplier,(codes,num_pdfs) in expected.items():
        matching=[n for n in names if supplier in n]
        assert len(matching)==1,matching
        with zipfile.ZipFile(io.BytesIO(outer.read(matching[0]))) as inner:
            assert inner.testzip() is None
            files=inner.namelist()
            assert "图纸关联清单.json" in files
            assert len([n for n in files if n.endswith(".xlsx")])==1
            pdfs=[n for n in files if n.endswith(".pdf")]
            assert len(pdfs)==num_pdfs,files
            manifest=json.loads(inner.read("图纸关联清单.json"))
            assert manifest["supplierId"]==supplier,manifest
            assert {x["itemCode"] for x in manifest["items"]}==codes,manifest
            assert len(manifest["documents"])==num_pdfs
            workbook=load_workbook(io.BytesIO(inner.read(next(n for n in files if n.endswith(".xlsx")))),read_only=True)
            rows=list(workbook.active.values);col=rows[0].index("存货编码")
            assert {row[col] for row in rows[1:]}==codes
            for item in manifest["documents"]:
                content=inner.read(item["file"])
                assert content.startswith(b"%PDF-") and b"%%EOF" in content
                assert hashlib.sha256(content).hexdigest()==item["sha256"]
                assert content.count(b"/Type /Page ")==2
            total=b"".join(inner.read(n) for n in pdfs)
            if supplier=="FAKE-SUP-B":
                assert b"BETA PAGE" not in total,"非本家图纸被泄露"
print("PASS DRAW-PY01: vendor-independent XLSX, true 2-page PDFs and no cross-supplier drawing leaks")
with zipfile.ZipFile(folder/"complete-drawings.zip") as full:
    assert full.testzip() is None
    files=full.namelist()
    assert "全部询价结构化数据.json" in files and "图纸文件索引.json" in files
    source=json.loads(full.read("全部询价结构化数据.json"))
    assert source["workspaceCount"]==1
    index=json.loads(full.read("图纸文件索引.json"))
    assert len(index["files"])==2
    for item in index["files"]:
        content=full.read(item["file"])
        assert hashlib.sha256(content).hexdigest()==item["sha256"]
print("PASS DRAW-PY02: complete ZIP contains every hash-consistent PDF binary and structured RFQ snapshot")
