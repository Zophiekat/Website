import os
from PIL import Image
from pathlib import Path
import shutil

# Configuration
INPUT_DIR = "glazed_input"
# Default target directory - change this if you are processing files for a different section
TARGET_DIR = "assets/artwork/3d-modelling" 

def optimize_images():
    # Ensure input directory exists
    if not os.path.exists(INPUT_DIR):
        os.makedirs(INPUT_DIR)
        print(f"Created '{INPUT_DIR}' folder. Please put your Glazed PNG/JPG files here and run the script again.")
        return

    # Ensure target directory exists
    if not os.path.exists(TARGET_DIR):
        os.makedirs(TARGET_DIR)

    files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if not files:
        print(f"No PNG or JPG files found in '{INPUT_DIR}'.")
        return

    print(f"Found {len(files)} files to process...")

    for filename in files:
        file_path = os.path.join(INPUT_DIR, filename)
        file_stem = Path(filename).stem
        
        # Handle Glaze naming convention if present (e.g., "Image_Glazed.png")
        # We might want to strip "_Glazed" to match the website's expected filenames
        clean_name = file_stem.replace("_Glazed", "").replace("-Glazed", "")
        output_filename = f"{clean_name}.webp"
        output_path = os.path.join(TARGET_DIR, output_filename)

        try:
            with Image.open(file_path) as img:
                # Save as WebP
                img.save(output_path, "WEBP", quality=85)
                print(f"Processed: {filename} -> {output_path}")
            
            # Optional: Remove the source file from input after processing
            # os.remove(file_path) 
            
        except Exception as e:
            print(f"Error converting {filename}: {e}")

    print("\nDone! Don't forget to update your HTML if filenames changed significantly.")

if __name__ == "__main__":
    optimize_images()
