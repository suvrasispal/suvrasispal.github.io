#!/bin/bash
# Rebuilds ../index.html from template.html + ../data/events.json + ../assets/tca-logo.webp
# Usage:  cd source && bash build.sh
set -e
cd "$(dirname "$0")"

python3 - << 'EOF'
import json, base64

with open('template.html', 'r', encoding='utf-8') as f:
    template = f.read()

with open('../data/events.json', 'r', encoding='utf-8') as f:
    events_json = f.read()
# guard against a stray "</script" substring breaking out of the <script> tag
events_json_safe = events_json.replace("</script", "<\\/script")

with open('../assets/tca-logo.webp', 'rb') as f:
    logo_b64 = base64.b64encode(f.read()).decode('ascii')
logo_src = f"data:image/webp;base64,{logo_b64}"

out = template.replace("__EVENTS_JSON__", events_json_safe).replace("__LOGO_SRC__", logo_src)

with open('../index.html', 'w', encoding='utf-8') as f:
    f.write(out)

print("Built ../index.html —", len(out.encode('utf-8')), "bytes")
EOF
