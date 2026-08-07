import os
import sys
import json
import cloudinary
import cloudinary.uploader
import cloudinary.search

# Load Cloudinary configuration from .env or environment
if os.path.exists('.env'):
    for line in open('.env'):
        if line.startswith('CLOUDINARY_URL='):
            os.environ['CLOUDINARY_URL'] = line.strip().split('=', 1)[1]

if 'CLOUDINARY_URL' in os.environ:
    url = os.environ['CLOUDINARY_URL'].replace('cloudinary://', '')
    keys, cloud_name = url.split('@')
    api_key, api_secret = keys.split(':')
    cloudinary.config(cloud_name=cloud_name, api_key=api_key, api_secret=api_secret)

RAW_DIR = sys.argv[1] if len(sys.argv) > 1 else os.environ.get(
    "RAW_DIR", "/Users/leofan/Documents/website portfolio"
)
IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic'}

def clean_name(s):
    return ''.join(c.lower() for c in s if c.isalnum())

def sync_and_fetch():
    local_images = []
    folders = {'portraits', 'adventure/backpacking', 'adventure/outdoors', 'street', 'prints', 'prints/alpine', 'prints/urban', 'prints/wildlife', 'prints/travel'}

    if os.path.exists(RAW_DIR):
        for root, _, files in os.walk(RAW_DIR):
            if 'masters' in root.split(os.sep):
                continue
            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext in IMAGE_EXTS and not f.startswith('.'):
                    rel_path = os.path.relpath(os.path.join(root, f), RAW_DIR)
                    folder = os.path.dirname(rel_path) or 'portraits'
                    local_images.append({
                        'full_path': os.path.join(root, f),
                        'filename': f,
                        'stem': os.path.splitext(f)[0],
                        'folder': folder
                    })
                    folders.add(folder)

    # Collect existing Cloudinary assets
    existing_clean_ids = set()
    for folder in sorted(folders):
        print(f"Fetching {folder} from Cloudinary...")
        res = cloudinary.Search().expression(f'folder:{folder}').max_results(500).execute()
        for resource in res.get('resources', []):
            existing_clean_ids.add(clean_name(resource.get('public_id', '')))

    # Upload missing local images
    for img in local_images:
        c_stem = clean_name(img['stem'])
        if not any(c_stem in pub for pub in existing_clean_ids):
            print(f"Uploading new image: {img['filename']} to {img['folder']}...")
            cloudinary.uploader.upload(
                img['full_path'],
                folder=img['folder'],
                use_filename=True,
                unique_filename=True
            )

    # Sync Full-Resolution Masters for POD Auto-Fulfillment
    masters_dir = os.path.join(RAW_DIR, 'masters')
    if os.path.exists(masters_dir):
        print("\n=== Syncing Full-Resolution Print Masters for POD Fulfillment ===")
        for root, _, files in os.walk(masters_dir):
            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext in IMAGE_EXTS and not f.startswith('.'):
                    rel_path = os.path.relpath(os.path.join(root, f), masters_dir)
                    master_folder = os.path.join('masters', os.path.dirname(rel_path)).rstrip('/')
                    full_p = os.path.join(root, f)
                    c_stem = clean_name(os.path.splitext(f)[0])
                    
                    m_res = cloudinary.Search().expression(f'folder:{master_folder}').max_results(500).execute()
                    m_clean_ids = {clean_name(r.get('public_id', '')) for r in m_res.get('resources', [])}
                    
                    if not any(c_stem in pub for pub in m_clean_ids):
                        print(f"Uploading Full-Res Master: {f} to Cloudinary {master_folder}...")
                        cloudinary.uploader.upload(
                            full_p,
                            folder=master_folder,
                            use_filename=True,
                            unique_filename=True,
                            resource_type="auto"
                        )

    # Re-fetch web assets and save to gallery-data.js
    all_assets = {}
    for folder in sorted(folders):
        if folder.startswith('masters'):
            continue
        res = cloudinary.Search().expression(f'folder:{folder}').max_results(500).execute()
        assets = []
        for resource in res.get('resources', []):
            tags = resource.get('tags', [])
            if 'backpacking' in folder and 'backpacking' not in tags:
                tags.append('backpacking')
            
            asset_item = {
                'public_id': resource['public_id'],
                'url': resource['secure_url'],
                'created_at': resource['created_at'],
                'folder': folder,
                'tags': tags
            }

            if folder.startswith('prints') or 'print' in tags:
                asset_item['is_print'] = True
                parts = folder.split('/')
                if len(parts) > 1:
                    asset_item['print_collection'] = parts[1]
                else:
                    asset_item['print_collection'] = 'general'

            assets.append(asset_item)
        if assets:
            all_assets[folder] = assets
            print(f"Found {len(assets)} web assets in {folder}")

    with open('gallery-data.js', 'w') as f:
        f.write(f"const galleryData = {json.dumps(all_assets, indent=2)};\n")
    print("\nSuccessfully updated gallery-data.js.")

if __name__ == '__main__':
    sync_and_fetch()
