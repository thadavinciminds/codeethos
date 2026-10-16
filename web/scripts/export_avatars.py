from PIL import Image
import os

source_path = r"C:\Users\vitrus\.gemini\antigravity-ide\brain\ca094b68-57f7-43cc-b072-20a0d1e17737\.user_uploaded\media_1792156817961.jpg"
out_dir = r"c:\Users\vitrus\python_profesor\web\public\avatars"
os.makedirs(out_dir, exist_ok=True)

img = Image.open(source_path)

cols = 14
rows = 6

col_start = 15.0
col_width = 60
col_step = 71.77

row_start = 109.0
row_height = 70
row_step = 78.0

avatar_index = 0
for r in range(rows):
    y1 = int(round(row_start + r * row_step))
    y2 = y1 + row_height
    for c in range(cols):
        x1 = int(round(col_start + c * col_step))
        x2 = x1 + col_width
        
        avatar_crop = img.crop((x1, y1, x2, y2))
        # Let's resize smoothly with Lanczos to a crisp 128x128 or 96x96 for avatars
        avatar_hd = avatar_crop.resize((96, 96), Image.Resampling.LANCZOS)
        
        filename = f"mascot_{avatar_index + 1:02d}.png"
        filepath = os.path.join(out_dir, filename)
        avatar_hd.save(filepath, "PNG")
        avatar_index += 1

print(f"Successfully generated {avatar_index} avatars into {out_dir}")
