# Glaze Protection Workflow

This document outlines the process for protecting artwork using [Glaze](https://glaze.cs.uchicago.edu/) and preparing it for the website.

## Prerequisites
1. Download and install the **Glaze** application for your OS (Windows/macOS).
2. Ensure you have your original artwork files in **PNG** or **JPG** format.

## Workflow Steps

### 1. Apply Glaze Protection
*   Open the Glaze application.
*   Select your original artwork files.
*   Choose your intensity settings (Default is usually fine).
*   **Output**: Save the "Glazed" versions to a temporary folder on your computer (e.g., `glazed_raw/`).

### 2. Optimize for Web (WebP Conversion)
Since Glaze outputs PNG/JPG, we want to convert them to WebP for the website to keep load times fast.

1.  Place your **Glazed PNG/JPG** files into a folder named `glazed_input` in the root of this project.
2.  Run the optimization script:
    ```bash
    python3 optimize_glazed_images.py
    ```
3.  The script will:
    *   Convert the images to `.webp`.
    *   Automatically move them to `assets/artwork/3d-modelling/` (or you can configure the target).
    *   Clean up the large PNGs.

### 3. Verify
*   Check the website to ensure the images look correct.
*   The visual "noise" added by Glaze should be subtle but present.

## Notes
*   **Do not** Glaze already compressed WebP files; it won't work.
*   Always keep your un-glazed originals in a safe, offline backup.
