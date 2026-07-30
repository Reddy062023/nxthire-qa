"""
NorthStar Group — Staging Website Content Update Script
Date: June 30, 2026
Purpose: Update locked content on staging site only
Staging URL: https://nstargroupinc.com/staging/7609
"""

import requests
import json
import base64
from datetime import datetime

# ============================================================
# CONFIGURATION — DO NOT SHARE THIS FILE
# ============================================================
STAGING_URL = "https://nstargroupinc.com/staging/7609"
USERNAME    = "Northstar-Group"
APP_PASSWORD = "Imc5 37wq qHOL 3BYd iDjq 58oE"

# Build auth header
credentials = f"{USERNAME}:{APP_PASSWORD}"
token = base64.b64encode(credentials.encode()).decode("utf-8")
HEADERS = {
    "Authorization": f"Basic {token}",
    "Content-Type": "application/json"
}

API_BASE = f"{STAGING_URL}/wp-json/wp/v2"

# ============================================================
# LOCKED CONTENT CHANGES
# ============================================================
CHANGES = {
    "contact_page_hero": {
        "find":    "Contact NorthStar Group today to streamline your staffing needs and find top-tier tech talent tailored to your projects.",
        "replace": "Contact NorthStar Group today to discover how our technology staffing, managed services, data analytics, and AI-powered solutions can accelerate your business — we are ready to serve you globally."
    },
    "footer_description": {
        "find":    "NorthStar Group (NSG) is a Service-Disabled Veteran-Owned Small Business (SDVOSB) professional services firm with a proven track record of delivering results.",
        "replace": "NorthStar Group (NSG) is a US-based IT services firm founded in 2008, specializing in technology staffing, managed services, data analytics, and AI-powered solutions — serving clients globally."
    },
    "email_amit": {
        "find":    "amit@nstargroupinc.com",
        "replace": "solutions@nstargroupinc.com"
    },
    "copyright_targetorate": {
        "find":    "Powered by Targetorate Consulting",
        "replace": ""
    },
    "wrong_company_name": {
        "find":    "Technology Workforce",
        "replace": "NorthStar Group"
    },
    "spelling_fulfull": {
        "find":    "fulfull",
        "replace": "fulfill"
    },
    "spelling_successfull": {
        "find":    "successfull",
        "replace": "successful"
    },
    "stats_bar_fix": {
        "find":    "5+ State of Operations",
        "replace": "5+ States Served"
    },
    "wrong_cta_data_viz": {
        "find":    "Exceed Your Hiring Goals With Us",
        "replace": "Ready to Visualize Your Data? Contact Us Today"
    }
}

# ============================================================
# LOGGING
# ============================================================
log_entries = []

def log(message, status="INFO"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{timestamp}] [{status}] {message}"
    print(entry)
    log_entries.append(entry)

# ============================================================
# TEST CONNECTION
# ============================================================
def test_connection():
    log("Testing connection to staging site...")
    try:
        response = requests.get(f"{API_BASE}/users/me", headers=HEADERS, timeout=30)
        if response.status_code == 200:
            user = response.json()
            log(f"Connected successfully as: {user.get('name', 'Unknown')}", "SUCCESS")
            return True
        else:
            log(f"Connection failed: {response.status_code} — {response.text}", "ERROR")
            return False
    except Exception as e:
        log(f"Connection error: {str(e)}", "ERROR")
        return False

# ============================================================
# GET ALL PAGES
# ============================================================
def get_all_pages():
    log("Fetching all pages from staging site...")
    pages = []
    page_num = 1
    while True:
        try:
            response = requests.get(
                f"{API_BASE}/pages",
                headers=HEADERS,
                params={"per_page": 100, "page": page_num, "_fields": "id,title,content,slug"},
                timeout=30
            )
            if response.status_code == 200:
                batch = response.json()
                if not batch:
                    break
                pages.extend(batch)
                log(f"Fetched {len(batch)} pages (batch {page_num})")
                page_num += 1
            else:
                break
        except Exception as e:
            log(f"Error fetching pages: {str(e)}", "ERROR")
            break
    log(f"Total pages fetched: {len(pages)}", "SUCCESS")
    return pages

# ============================================================
# APPLY CHANGES TO CONTENT
# ============================================================
def apply_changes(content, page_title):
    changes_made = []
    updated_content = content

    for change_key, change in CHANGES.items():
        find_text = change["find"]
        replace_text = change["replace"]

        if find_text in updated_content:
            count = updated_content.count(find_text)
            updated_content = updated_content.replace(find_text, replace_text)
            changes_made.append({
                "key": change_key,
                "find": find_text,
                "replace": replace_text,
                "count": count
            })
            log(f"  ✅ [{page_title}] '{find_text}' → '{replace_text}' ({count} instance/s)", "CHANGE")

    return updated_content, changes_made

# ============================================================
# UPDATE PAGE
# ============================================================
def update_page(page_id, new_content):
    try:
        response = requests.post(
            f"{API_BASE}/pages/{page_id}",
            headers=HEADERS,
            json={"content": new_content},
            timeout=30
        )
        if response.status_code == 200:
            return True
        else:
            log(f"Update failed for page {page_id}: {response.status_code}", "ERROR")
            return False
    except Exception as e:
        log(f"Error updating page {page_id}: {str(e)}", "ERROR")
        return False

# ============================================================
# UPDATE FOOTER / WIDGETS (via WordPress options API)
# ============================================================
def update_site_options():
    log("Checking site options for footer content...")
    # Footer text is often stored in theme customizer or widgets
    # We will handle this via page content search above
    # For Astra theme footer — handled through customizer
    log("Note: Footer description and copyright may need manual update in Astra Customizer", "INFO")
    log("Go to: Appearance → Customize → Footer → Footer Bar", "INFO")

# ============================================================
# MAIN SCRIPT
# ============================================================
def main():
    log("=" * 60)
    log("NorthStar Group — Staging Content Update Script")
    log("=" * 60)
    log(f"Staging site: {STAGING_URL}")
    log(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log("=" * 60)

    # Step 1 — Test connection
    if not test_connection():
        log("STOPPING — Cannot connect to staging site.", "ERROR")
        return

    # Step 2 — Get all pages
    pages = get_all_pages()
    if not pages:
        log("STOPPING — No pages found.", "ERROR")
        return

    # Step 3 — Process each page
    total_changes = 0
    pages_updated = 0
    change_report = []

    for page in pages:
        page_id    = page.get("id")
        page_title = page.get("title", {}).get("rendered", "Unknown")
        content    = page.get("content", {}).get("rendered", "")
        slug       = page.get("slug", "")

        log(f"\nProcessing: [{page_title}] (ID: {page_id}, slug: /{slug})")

        # Apply all changes
        new_content, changes_made = apply_changes(content, page_title)

        if changes_made:
            # Update the page
            success = update_page(page_id, new_content)
            if success:
                pages_updated += 1
                total_changes += len(changes_made)
                change_report.append({
                    "page": page_title,
                    "slug": slug,
                    "changes": changes_made
                })
                log(f"  ✅ Page updated successfully!", "SUCCESS")
            else:
                log(f"  ❌ Failed to update page!", "ERROR")
        else:
            log(f"  — No changes needed on this page")

    # Step 4 — Footer/Options
    log("\n" + "=" * 60)
    update_site_options()

    # Step 5 — Summary Report
    log("\n" + "=" * 60)
    log("FINAL SUMMARY REPORT")
    log("=" * 60)
    log(f"Total pages scanned:  {len(pages)}")
    log(f"Total pages updated:  {pages_updated}")
    log(f"Total changes made:   {total_changes}")
    log("\nCHANGES BY PAGE:")
    for item in change_report:
        log(f"\n  📄 {item['page']} (/{item['slug']})")
        for c in item["changes"]:
            log(f"     • {c['key']}: '{c['find']}' → '{c['replace']}' x{c['count']}")

    log("\n" + "=" * 60)
    log("Script completed successfully!", "SUCCESS")
    log(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log("=" * 60)

    # Save log to file
    with open("northstar_update_log.txt", "w") as f:
        f.write("\n".join(log_entries))
    log("Log saved to: northstar_update_log.txt")

if __name__ == "__main__":
    main()