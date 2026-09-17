"""
NorthStar Job Postings — Screenshot Capture Script
====================================================
Run this on YOUR computer (not in Claude's sandbox — it can't
reach the site). It visits each job posting URL below, takes a
full-page screenshot, and combines them into one PDF.

Requirements (run once):
    pip install playwright reportlab
    playwright install chromium

Then run:
    python capture_job_pages.py

Output:
    NorthStar_Job_Postings_Capture/NorthStar_Jobs_Capture.pdf
"""

import os
from datetime import datetime
from playwright.sync_api import sync_playwright
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Image as RLImage, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from PIL import Image as PILImage

OUTPUT_DIR = "NorthStar_Job_Postings_Capture"
PDF_NAME = "NorthStar_Jobs_Capture.pdf"

# Label -> URL. Edit/add rows here if needed.
PAGES = [
    ("Careers listing (page 1)", "https://nstargroupinc.com/careers/"),
    ("Sr. Application Developer (BS/5yr) slug", "https://nstargroupinc.com/jobs/java-backend-developer/"),
    ("Sr. Application Developer (MS/2yr) slug", "https://nstargroupinc.com/jobs/ui-ux-designer/"),
    ("Sr. Business Functional Analyst (MS/2yr) slug", "https://nstargroupinc.com/jobs/python-developer/"),
    ("Sr. Business Functional Analyst (BS/5yr) slug", "https://nstargroupinc.com/jobs/net-architect/"),
    ("Programmer Analyst slug", "https://nstargroupinc.com/jobs/sap-abap-developer/"),
]


def screenshot_page(page, url, filepath):
    try:
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.screenshot(path=filepath, full_page=True)
        return True
    except Exception as e:
        print(f"   FAILED: {url} -> {e}")
        return False


def build_pdf(output_dir, pdf_path, pages_info):
    doc = SimpleDocTemplate(pdf_path, pagesize=letter,
                             topMargin=0.5 * inch, bottomMargin=0.5 * inch)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("NorthStar Job Postings — Capture Record", styles["Title"]))
    story.append(Paragraph(f"Captured: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
    story.append(Spacer(1, 16))

    for i, item in enumerate(pages_info, 1):
        story.append(Paragraph(f"{i}. {item['label']}", styles["Heading2"]))
        story.append(Paragraph(item["url"], styles["Normal"]))
        story.append(Spacer(1, 8))
        try:
            max_width = 6.5 * inch
            max_height = 9.0 * inch

            with PILImage.open(item["path"]) as pil_img:
                px_w, px_h = pil_img.size
                # How tall a page-width-scaled slice can be, in source pixels
                slice_px_h = int(max_height / (max_width / px_w))

                if px_h <= slice_px_h:
                    # Fits on one page as-is
                    scale = max_width / px_w
                    story.append(RLImage(item["path"], width=px_w * scale, height=px_h * scale))
                else:
                    # Split into vertical slices, one per page
                    n_slices = -(-px_h // slice_px_h)  # ceil
                    for s in range(n_slices):
                        top = s * slice_px_h
                        bottom = min(top + slice_px_h, px_h)
                        crop = pil_img.crop((0, top, px_w, bottom))
                        crop_path = item["path"].replace(".png", f"_part{s+1}.png")
                        crop.save(crop_path)
                        scale = max_width / px_w
                        story.append(RLImage(crop_path, width=px_w * scale, height=(bottom - top) * scale))
                        if s < n_slices - 1:
                            story.append(PageBreak())
        except Exception as e:
            story.append(Paragraph(f"[image failed to embed: {e}]", styles["Normal"]))
        story.append(PageBreak())

    doc.build(story)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("=" * 55)
    print("  NorthStar Job Postings — Screenshot Capture")
    print("=" * 55)

    pages_info = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1400, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
        )
        bpage = context.new_page()

        for i, (label, url) in enumerate(PAGES, 1):
            filename = f"{i:02d}_{label.split(' ')[0].lower()}.png"
            filepath = os.path.join(OUTPUT_DIR, filename)
            print(f"[{i}/{len(PAGES)}] {label} -> {url}")
            if screenshot_page(bpage, url, filepath):
                pages_info.append({"label": label, "url": url, "path": filepath})

        browser.close()

    pdf_path = os.path.join(OUTPUT_DIR, PDF_NAME)
    build_pdf(OUTPUT_DIR, pdf_path, pages_info)

    print("\n" + "=" * 55)
    print("  DONE")
    print("=" * 55)
    print(f"  Pages captured : {len(pages_info)} / {len(PAGES)}")
    print(f"  PDF report     : {pdf_path}")
    print("\n  Upload that PDF back to Claude to merge into the")
    print("  compliance packet.")
    print("=" * 55)


if __name__ == "__main__":
    main()
