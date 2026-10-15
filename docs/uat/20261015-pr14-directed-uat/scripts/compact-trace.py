"""Omit only screencast frames; preserve actions, DOM snapshots, network and logs.
Original unmodified trace SHA256 and omitted counts are recorded beside output.
"""
import sys, json, zipfile, hashlib, pathlib
src, dst = map(pathlib.Path, sys.argv[1:3])
removed, bodies, counts = set(), {}, {}
with zipfile.ZipFile(src) as z:
    for name in z.namelist():
        if not name.endswith('.trace'):
            continue
        keep = []
        for line in z.read(name).splitlines(keepends=True):
            event = json.loads(line)
            if event.get('type') == 'screencast-frame':
                removed.add('resources/' + event['sha1'])
            else:
                keep.append(line)
                kind = event.get('type', 'unknown')
                counts[kind] = counts.get(kind, 0) + 1
        bodies[name] = b''.join(keep)
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as out:
        for info in z.infolist():
            if info.filename in removed:
                continue
            out.writestr(info, bodies.get(info.filename, z.read(info.filename)))
with zipfile.ZipFile(dst) as z:
    assert z.testzip() is None
meta = {'processing': 'Only screencast-frame events and their frame JPEG resources omitted. Original action, DOM snapshot, network, console and log events retained. Separate original PNG captures are archived.', 'original_filename': src.name, 'original_sha256': hashlib.sha256(src.read_bytes()).hexdigest(), 'original_bytes': src.stat().st_size, 'compact_sha256': hashlib.sha256(dst.read_bytes()).hexdigest(), 'compact_bytes': dst.stat().st_size, 'omitted_frame_resources': len(removed), 'retained_event_counts': counts}
dst.with_suffix('.manifest.json').write_text(json.dumps(meta, indent=2) + '\n')
print(json.dumps(meta, indent=2))
