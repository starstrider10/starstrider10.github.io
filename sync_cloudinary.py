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
    folders = {'portraits', 'adventure/backpacking', 'adventure/outdoors', 'street'}

    if os.path.exists(RAW_DIR):
        for root, _, files in os.walk(RAW_DIR):
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

    # Re-fetch all assets and save to portraits.js
    all_assets = {}
    for folder in sorted(folders):
        res = cloudinary.Search().expression(f'folder:{folder}').max_results(500).execute()
        assets = []
        for resource in res.get('resources', []):
            tags = resource.get('tags', [])
            if 'backpacking' in folder and 'backpacking' not in tags:
                tags.append('backpacking')
            assets.append({
                'public_id': resource['public_id'],
                'url': resource['secure_url'],
                'created_at': resource['created_at'],
                'folder': folder,
                'tags': tags
            })
        if assets:
            all_assets[folder] = assets
            print(f"Found {len(assets)} assets in {folder}")

    with open('gallery-data.js', 'w') as f:
        f.write(f"const galleryData = {json.dumps(all_assets, indent=2)};\n")
    print("\nSuccessfully updated gallery-data.js.")

if __name__ == '__main__':
    sync_and_fetch()
