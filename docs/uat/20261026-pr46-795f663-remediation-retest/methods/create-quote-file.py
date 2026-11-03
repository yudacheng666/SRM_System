from pathlib import Path
import sys,json,zipfile
from xml.sax.saxutils import escape
ids=json.loads(Path(sys.argv[1]).read_text());kind=sys.argv[2];out=Path(sys.argv[3]);prices=['1-9:120|10+:108','20','30','','75','','1-99:2.50|100+:2.25','80','90','100','110','120'];rows=[['RFQ Line ID','报价单价','交期','MOQ','报价状态','物料备注']]
for i,id in enumerate(ids):
 if kind=='R2'and i not in [0,3,5]:continue
 price=prices[i]if kind=='R1'else ('1-9:118|10+:106'if i==0 else'');status='不供货'if i==3 else'未报价'if i==5 else'正常报价';rows.append([id,price,7,1,status,'虚构整改795 '+kind+' 行'+str(i+1)])
cells=''.join('<row r="%s">%s</row>'%(i,''.join('<c r="%s%s" t="inlineStr"><is><t>%s</t></is></c>'%(chr(65+j),i,escape(str(v)))for j,v in enumerate(row)))for i,row in enumerate(rows,1))
# Reuse a known synthetic workbook container, replacing its sole worksheet only.
with zipfile.ZipFile('/workspace/uat795/fixtures/buyer-items.xlsx')as src,zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED)as dst:
 for n in src.namelist():dst.writestr(n,('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+cells+'</sheetData></worksheet>').encode()if n=='xl/worksheets/sheet1.xml'else src.read(n))
print(out)
