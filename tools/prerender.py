#!/usr/bin/env python3
"""Pre-render step 2 of 2: write tools/prerender.json into index.html between the
<!-- prerender:ID --> markers inside each list container. Safe to re-run."""
import json, re, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(root, 'tools', 'prerender.json'); idx = os.path.join(root, 'index.html')
data = json.load(open(src)); html = open(idx).read()
for cid, inner in data.items():
    block = f'<!-- prerender:{cid} -->{inner.strip()}\n<!-- /prerender:{cid} -->'
    pat = re.compile(rf'(<(?:div|ul)[^>]*\bid="{cid}"[^>]*>)(?:<!-- prerender:{cid} -->[\s\S]*?<!-- /prerender:{cid} -->)?')
    html, n = pat.subn(lambda m: m.group(1) + block, html, count=1)
    if n != 1: sys.exit(f'container #{cid} not found in index.html')
open(idx, 'w').write(html)
print('index.html updated with', ', '.join(data))
