# ==========================================================
# extract_selected_covers.py  (Auto-crop + auto-copy)
# - Finds pages mentioning IGCSE subjects + Coursebook/Workbook
# - Crops the right half (where Cambridge prints the cover)
# - Detects ISBN(s), renames image to first ISBN
# - Copies to D:\BBA Coursebook Images\highres
# ==========================================================
import fitz  # PyMuPDF
import re, os, shutil

pdf_path   = r"D:\BBA Coursebook Images\EDU_Secondary_Catalogue_Digital_FY25 copy.pdf"
out_dir    = r"D:\BBA Coursebook Images\selected_subjects"
highres    = r"D:\BBA Coursebook Images\highres"
os.makedirs(out_dir, exist_ok=True)
os.makedirs(highres, exist_ok=True)

subjects = ["Mathematics", "English", "Physics", "Chemistry", "Biology"]
keywords = ["Coursebook", "Workbook"]

isbn_re  = re.compile(r"(97[89][-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d)")

print("🔍 Opening PDF...")
pdf = fitz.open(pdf_path)

for i, page in enumerate(pdf):
    text = page.get_text("text")
    if not any(sub in text and kw in text for sub in subjects for kw in keywords):
        continue

    print(f"\n📘 Page {i+1}: target found → extracting cover…")

    # --- crop right half of the page (cover area in Cambridge catalogue) ---
    rect = page.rect
    right_half = fitz.Rect(rect.width/2, 0, rect.width, rect.height)

    # 2x resolution for high-res cover
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=right_half)

    # detect ISBNs from page text
    matches = isbn_re.findall(text)
    isbns = list({re.sub(r"[^0-9X]", "", m) for m in matches if m})
    detected = isbns[0] if isbns else None

    # save temp file if no ISBN (kept for inspection), else rename to ISBN
    if detected:
        jpg_name = f"{detected}.jpg"
    else:
        jpg_name = f"page_{i+1}_nocode.jpg"

    temp_path = os.path.join(out_dir, jpg_name)
    pix.save(temp_path)

    # write debug text file
    with open(os.path.join(out_dir, jpg_name.replace(".jpg", ".txt")), "w", encoding="utf-8") as f:
        f.write(f"Page: {i+1}\nDetected ISBNs: {', '.join(isbns) if isbns else 'NONE'}\n\n{text}")

    # copy to highres only if we have a detected ISBN
    if detected:
        shutil.copy2(temp_path, os.path.join(highres, jpg_name))
        print(f"✅ Saved & copied → {jpg_name}")
    else:
        print(f"⚠️ No ISBN detected on page {i+1} (file kept in selected_subjects).")

pdf.close()
print("\n🎯 Done. Covers copied to:", highres)
