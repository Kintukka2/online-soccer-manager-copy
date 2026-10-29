#!/usr/bin/env bash
# Downloads the official OSM store screenshots at native resolution into ./shots,
# using the same file names the regions*.json files expect. Images are Gamebasics'
# copyright: keep them local, never commit or redistribute them.
set -euo pipefail
OUT="${1:-shots}"; mkdir -p "$OUT/ios" "$OUT/play"
curl -sS "https://itunes.apple.com/lookup?id=400201466&country=gb" -o "$OUT/ios.json"
python3 - "$OUT" <<'PY'
import json, sys, subprocess
out = sys.argv[1]; r = json.load(open(f"{out}/ios.json"))["results"][0]
urls = list(dict.fromkeys(r.get("screenshotUrls", []) + r.get("ipadScreenshotUrls", [])))
for u in urls:
    base = u.rsplit("/", 1)[0]; name = base.rsplit("/", 1)[-1]
    subprocess.run(["curl", "-sS", "-o", f"{out}/ios/{name}", f"{base}/4000x4000bb.png"], check=True)
    print(name)
PY
echo "App Store images saved under their original names, as regions*.json expects."
curl -sS -o "$OUT/play/icon_en.png" "https://play-lh.googleusercontent.com/Hwg5atkrwK1ShPk-GfmLRZtl25AyHiiDK4PQv91zfzwd554HGlc893ixwEzBF5bSMWUZTq-1xvDJP6bgt2fJask=s0"   # Google Play 26/27 icon (512x512)
echo "For regions3 web_* regions, save a 1440x900 browser screenshot of https://en.onlinesoccermanager.com/ (privacy gate, not accepted) as $OUT/web/privacy_gate_1440.png"
