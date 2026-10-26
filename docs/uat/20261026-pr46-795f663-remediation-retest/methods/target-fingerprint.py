from pathlib import Path
import sys,subprocess,json,hashlib
root=Path(sys.argv[1]);out=Path(sys.argv[2]);semantic=out.with_suffix('.semantic.json');subprocess.run(['python','/workspace/uat795/methods/db-state.py',str(root),str(semantic)],check=True)
files={};volatile={}
for p in sorted(root.rglob('*')):
 if not p.is_file():continue
 rel=str(p.relative_to(root));entry={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
 (volatile if p.name.endswith(('-wal','-shm'))else files)[rel]=entry
out.write_text(json.dumps({'semantic':json.loads(semantic.read_text()),'persistentFiles':files,'sqliteVolatileFiles':volatile,'directories':sorted(str(p.relative_to(root))for p in root.rglob('*')if p.is_dir())},ensure_ascii=False,indent=2)+'\n')
