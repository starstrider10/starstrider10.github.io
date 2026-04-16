import cloudinary
import cloudinary.api
import os
import json

# The CLOUDINARY_URL is loaded from the environment
def fetch_all_assets():
    try:
        # Define the folders you want to sync
        folders = ['portraits', 'adventure/backpacking', 'adventure/outdoors', 'street']
        all_assets = {}

        for folder in folders:
            print(f"Fetching {folder} from Cloudinary...")
            result = cloudinary.Search() \
              .expression(f'folder:{folder}') \
              .max_results(500) \
              .execute()
            
            assets = []
            for resource in result.get('resources', []):
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
            all_assets[folder] = assets
            print(f"Found {len(assets)} assets in {folder}")
            
        # Save to JS for local browser access
        with open('portraits.js', 'w') as f:
            f.write(f"const galleryData = {json.dumps(all_assets, indent=2)};")
            
        print("\nSuccessfully updated portraits.js with all categories.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fetch_all_assets()
