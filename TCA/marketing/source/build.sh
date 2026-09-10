#!/bin/bash
# Builds the standalone, self-hosted ../index.html (full <!DOCTYPE html> document,
# with real favicons) from template.html + ../data/events.json +
# ../assets/tca-logo.webp + ../assets/favicon/*.
#
# This is distinct from the Claude-artifact build (see the *fragment* build.sh
# used when publishing to claude.ai, which has no <html>/<head>/<body> of its
# own because the Artifact platform supplies that wrapper). This script
# supplies that wrapper itself, plus real <link rel="icon"> favicon tags,
# since a self-hosted page needs both.
#
# Usage:  cd source && bash build.sh
set -e
cd "$(dirname "$0")"

python3 - << 'EOF'
import base64

with open('template.html', 'r', encoding='utf-8') as f:
    template = f.read()

with open('../data/events.json', 'r', encoding='utf-8') as f:
    events_json = f.read()
events_json_safe = events_json.replace("</script", "<\\/script")

with open('../assets/tca-logo.webp', 'rb') as f:
    logo_b64 = base64.b64encode(f.read()).decode('ascii')
logo_src = f"data:image/webp;base64,{logo_b64}"

filled = template.replace("__EVENTS_JSON__", events_json_safe).replace("__LOGO_SRC__", logo_src)

MARKER = "<!-- /HEAD: marker used by source/build.sh to split this fragment into a\n     proper <head>/<body> document when building the standalone package.\n     Harmless if left in place when publishing as a Claude Artifact fragment. -->"
if MARKER not in filled:
    raise SystemExit("Could not find the /HEAD marker in template.html — did it get edited/removed?")

head_fragment, body_fragment = filled.split(MARKER, 1)

document = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="The Confidence Academy's Events & Marketing Calendar — plan, prepare and track marketing campaigns around seasonal, awareness and community events from September 2026 to December 2027.">
<meta name="theme-color" content="#00247D">

<link rel="icon" type="image/x-icon" href="assets/favicon/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="192x192" href="assets/favicon/favicon-192x192.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/favicon/apple-touch-icon.png">
<link rel="manifest" href="assets/favicon/site.webmanifest">
{head_fragment.strip()}
</head>
<body>
{body_fragment.strip()}
</body>
</html>
"""

with open('../index.html', 'w', encoding='utf-8') as f:
    f.write(document)

print("Built ../index.html —", len(document.encode('utf-8')), "bytes")
EOF
