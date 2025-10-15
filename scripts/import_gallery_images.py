#!/usr/bin/env python3
"""
Import images into the site's gallery folder, generate responsive variants (800w, 480w),
and append JSON entries to either the projects (`gallery-data`) or team (`team-gallery-data`) block in
`site/gallery.html`.

Usage (dry-run):
  python3 scripts/import_gallery_images.py --source ~/Desktop/archive3 --target team --dry-run

Usage (execute):
  python3 scripts/import_gallery_images.py --source ~/Desktop/archive3 --target team

Notes:
- Requires macOS `sips` for resizing (the repo previously used it).
- This script does NOT commit or push.
- It will print the JSON entries it plans to add and only modify files when not in --dry-run mode.
"""
import argparse
import json
import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
GALLERY_DIR = SITE / 'assets' / 'gallery' / 'web'
GALLERY_HTML = SITE / 'gallery.html'


def make_variants(src_path: Path):
    """Create -800w and -480w variants using sips (macOS). Returns dict with filenames."""
    base = src_path.stem
    dest_800 = GALLERY_DIR / f"{base}-800w.jpg"
    dest_480 = GALLERY_DIR / f"{base}-480w.jpg"
    # create using sips
    subprocess.run(['sips','-Z','800', str(src_path), '--out', str(dest_800)], check=True)
    subprocess.run(['sips','-Z','480', str(src_path), '--out', str(dest_480)], check=True)
    return {
        'src': f"assets/gallery/web/{src_path.name}",
        'src800': f"assets/gallery/web/{dest_800.name}",
        'src480': f"assets/gallery/web/{dest_480.name}"
    }


def append_json_entries(target_block_id: str, entries: list, dry_run: bool):
    html = GALLERY_HTML.read_text(encoding='utf-8')
    start = html.find(f'<script id="{target_block_id}"')
    if start == -1:
        raise SystemExit(f"Could not find script block with id '{target_block_id}' in {GALLERY_HTML}")
    # find the closing </script>
    open_tag_end = html.find('>', start) + 1
    close = html.find('</script>', open_tag_end)
    old_json = html[open_tag_end:close].strip()
    try:
        arr = json.loads(old_json)
    except Exception:
        arr = []
    arr.extend(entries)
    new_json = json.dumps(arr, indent=2)
    new_html = html[:open_tag_end] + '\n' + new_json + '\n' + html[close:]
    print(f"Prepared to update {target_block_id} with {len(entries)} new entries.")
    if dry_run:
        print(new_json)
    else:
        GALLERY_HTML.write_text(new_html, encoding='utf-8')
        print(f"Updated {GALLERY_HTML} (appended {len(entries)} entries to {target_block_id}).")


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--source', required=True, help='Source folder with images (e.g., ~/Desktop/archive3)')
    p.add_argument('--target', choices=['projects','team'], default='team', help='Which gallery to add to')
    p.add_argument('--dry-run', action='store_true')
    args = p.parse_args()

    src = Path(os.path.expanduser(args.source))
    if not src.exists() or not src.is_dir():
        raise SystemExit(f"Source folder {src} does not exist or is not a directory")

    files = [f for f in src.iterdir() if f.suffix.lower() in ('.jpg','.jpeg','.png')]
    if not files:
        raise SystemExit(f"No images found in {src}")

    entries = []
    # ensure gallery dir exists
    GALLERY_DIR.mkdir(parents=True, exist_ok=True)

    for f in files:
        dest = GALLERY_DIR / f.name
        if not dest.exists():
            shutil.copy2(f, dest)
            print(f"Copied {f} -> {dest}")
        else:
            print(f"Skipping copy, file already exists: {dest}")
        variants = make_variants(dest)
        alt = f.stem.replace('_',' ').replace('-', ' ').title()
        entry = {'id': f.stem, 'src': variants['src'], 'src800': variants['src800'], 'src480': variants['src480'], 'alt': alt}
        entries.append(entry)

    block = 'gallery-data' if args.target == 'projects' else 'team-gallery-data'
    append_json_entries(block, entries, args.dry_run)

if __name__ == '__main__':
    main()
