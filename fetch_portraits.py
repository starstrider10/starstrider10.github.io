import cloudinary
import cloudinary.api
import os

# Note: This script assumes you have CLOUDINARY_URL set in your environment
# or you can manually configure it here:
# cloudinary.config( 
#   cloud_name = "your_cloud_name", 
#   api_key = "your_api_key", 
#   api_secret = "your_api_secret" 
# )

def list_folders():
    try:
        result = cloudinary.api.subfolders("")
        print("Available root folders:")
        for folder in result.get('folders', []):
            print(f"- {folder['name']} (Path: {folder['path']})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_folders()
