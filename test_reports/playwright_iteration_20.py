"""
Iteration 20: Test attachment features in messaging + UniversityFormModal validations
- Partner messaging: paperclip button visible, send button enabled with attachment
- Admin messaging: paperclip button visible
- UniversityFormModal: header text, counters, sequential validation errors
"""
import asyncio
import base64
import json

# Minimal valid 1x1 PNG image (for file upload mocking)
MINIMAL_PNG = base64.b64decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
)

BASE_URL = "https://accesshub-cms.preview.emergentagent.com"

results = {
    "passed": [],
    "failed": []
}

def mark_pass(name):
    results["passed"].append(name)
    print(f"  [PASS] {name}")

def mark_fail(name, reason=""):
    results["failed"].append(name)
    print(f"  [FAIL] {name}: {reason}")

# ==========================================
# SETUP
# ==========================================
await page.set_viewport_size({"width": 1920, "height": 1080})
page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type in ["error", "warn"] else None)

# Mock /api/upload (fallback) to return a fake URL
async def mock_upload_handler(route):
    await route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({"url": "https://fake.example.com/test-image.jpg"})
    )

# Mock /api/upload/signature to fail (so it falls back to /api/upload)
async def mock_signature_handler(route):
    await route.fulfill(status=400, content_type="application/json", body=json.dumps({"error": "mocked"}))

await page.route("**/api/upload/signature", mock_signature_handler)
await page.route("**/api/upload", mock_upload_handler)

# ==========================================
# LOGIN AS PARTNER
# ==========================================
print("\n=== PARTNER LOGIN ===")
try:
    await page.goto(BASE_URL, wait_until='domcontentloaded')
    await page.wait_for_timeout(2000)

    login_btn = await page.wait_for_selector('[data-testid="login-button"]', timeout=8000)
    await login_btn.click()
    await page.wait_for_timeout(500)

    await page.fill('[data-testid="auth-email"]', "partner@test.com")
    await page.fill('[data-testid="auth-password"]', "Partner2025!")
    await page.click('[data-testid="auth-submit-btn"]')
    await page.wait_for_timeout(3000)
    print("  Partner login submitted")

    # Navigate to partner dashboard
    await page.goto(f"{BASE_URL}/partner", wait_until='domcontentloaded')
    await page.wait_for_timeout(2000)

    # Check we're on the partner dashboard
    dashboard_header = await page.query_selector('text=Espace Partenaire')
    if dashboard_header:
        mark_pass("Partner login → dashboard accessible")
    else:
        mark_fail("Partner login → dashboard accessible", "Header 'Espace Partenaire' not found")
except Exception as e:
    mark_fail("Partner login", str(e))

# ==========================================
# PART 1: PARTNER MESSAGING - PAPERCLIP BUTTON
# ==========================================
print("\n=== PARTNER MESSAGING TESTS ===")
try:
    # Click Messages tab
    messages_tab = await page.wait_for_selector('[data-testid="partner-tab-messages"]', timeout=5000)
    await messages_tab.click()
    await page.wait_for_timeout(1500)

    # Check paperclip button visible
    paperclip = await page.wait_for_selector('[data-testid="partner-attach-file"]', timeout=5000)
    if await paperclip.is_visible():
        mark_pass("Partner Messages: paperclip button (partner-attach-file) visible")
    else:
        mark_fail("Partner Messages: paperclip button visible", "Element not visible")
except Exception as e:
    mark_fail("Partner Messages: paperclip button visible", str(e))

# Test send button enabled with attachment (mock upload)
try:
    # Find the hidden file input (near the messages area)
    # The file input is in the messages tab area
    file_inputs = await page.query_selector_all('input[type="file"]')
    partner_file_input = None
    for fi in file_inputs:
        accept = await fi.get_attribute("accept") or ""
        if ".pdf" in accept or ".doc" in accept:  # partner's file input accepts pdf/doc
            partner_file_input = fi
            break

    if partner_file_input is None and len(file_inputs) > 0:
        partner_file_input = file_inputs[0]

    if partner_file_input:
        # Set a file on the input to trigger handleFileSelect
        await partner_file_input.set_input_files({
            'name': 'test-attachment.png',
            'mimeType': 'image/png',
            'buffer': MINIMAL_PNG
        })
        await page.wait_for_timeout(3000)  # wait for mocked upload

        # Check if attachment preview appeared
        attach_preview = await page.query_selector('.bg-emerald-50.border-emerald-200')
        send_btn = await page.query_selector('[data-testid="partner-message-send"]')

        if send_btn:
            is_disabled = await send_btn.get_attribute("disabled")
            # Check if button is enabled
            if is_disabled is None:
                mark_pass("Partner Messages: send button ENABLED when attachment selected (no text)")
            else:
                mark_fail("Partner Messages: send button enabled with attachment", "Send button is still disabled")
        else:
            mark_fail("Partner Messages: send button enabled with attachment", "Send button not found")

        if attach_preview:
            mark_pass("Partner Messages: attachment preview shown after file selection")
        else:
            # Check by file name text
            attach_text = await page.query_selector('text=test-attachment.png')
            if attach_text:
                mark_pass("Partner Messages: attachment preview shows file name")
            else:
                mark_fail("Partner Messages: attachment preview visible", "Preview not shown - upload may have failed (Cloudinary not configured)")
    else:
        mark_fail("Partner Messages: send button with attachment", "File input not found")
except Exception as e:
    mark_fail("Partner Messages: send button with attachment", str(e))

# ==========================================
# PART 2: UNIVERSITY FORM MODAL TESTS
# ==========================================
print("\n=== UNIVERSITY FORM MODAL TESTS ===")
try:
    # Navigate to university tab
    uni_tab = await page.wait_for_selector('[data-testid="partner-tab-university"]', timeout=5000)
    await uni_tab.click()
    await page.wait_for_timeout(1000)

    # Check if there's already a university submitted
    uni_header = await page.query_selector('text=Mon Université')
    add_btn = await page.query_selector('[data-testid="add-university-btn"]')
    edit_btn = await page.query_selector('[data-testid="edit-university-btn"]')

    if add_btn:
        print("  Partner has no university - will open new form")
        await add_btn.click()
    elif edit_btn:
        print("  Partner has existing university - will open edit form (this may affect some validations)")
        await edit_btn.click()
    else:
        # Try to find any trigger button
        submit_btn_text = await page.query_selector('text=Soumettre une université')
        if submit_btn_text:
            await submit_btn_text.click()
        else:
            raise Exception("No add/edit university button found")

    await page.wait_for_timeout(1500)

    # Check modal opened
    modal_header = await page.wait_for_selector('[data-testid="uni-save-btn"]', timeout=5000)
    print("  University form modal opened")

    # ---- Test 1: Header text ----
    # Check the required fields message
    header_text_el = await page.query_selector('text=Requis *')
    if not header_text_el:
        header_text_el = await page.query_selector('text=Requis')
    
    if header_text_el:
        header_text = await header_text_el.inner_text()
        print(f"  Header text found: '{header_text}'")
        if '3 facultés' in header_text and '6 conditions' in header_text and '5 photos' in header_text:
            mark_pass("UniversityFormModal: header shows '3 facultés, 6 conditions, 5 photos et 1 vidéo'")
        else:
            # Check broader area
            amber_text = await page.query_selector('.text-amber-600')
            if amber_text:
                full_text = await amber_text.inner_text()
                print(f"  Amber text: '{full_text}'")
                if '3 facultés' in full_text and '6 conditions' in full_text:
                    mark_pass("UniversityFormModal: header shows '3 facultés, 6 conditions, 5 photos'")
                else:
                    mark_fail("UniversityFormModal: header text", f"Text '{full_text}' doesn't contain '3 facultés, 6 conditions'")
            else:
                mark_fail("UniversityFormModal: header text", f"Text found: '{header_text}'")
    else:
        # Look for amber text in the header
        all_amber = await page.query_selector_all('.text-amber-600')
        found_header = False
        for el in all_amber:
            txt = await el.inner_text()
            if '3 facultés' in txt or '6 conditions' in txt:
                mark_pass(f"UniversityFormModal: header text mentions required fields: '{txt}'")
                found_header = True
                break
        if not found_header:
            mark_fail("UniversityFormModal: header text", "No amber required fields text found")

    # ---- Test 2: Faculties counter 0/3 minimum ----
    await page.wait_for_timeout(500)
    # Look for the counter badge "0/3 minimum"
    all_spans = await page.query_selector_all('span')
    found_faculties_counter = False
    found_conditions_counter = False
    for span in all_spans:
        text = await span.inner_text()
        if '0/3 minimum' in text or '0/3' in text:
            # Check it's amber colored
            classes = await span.get_attribute('class') or ''
            if 'amber' in classes:
                mark_pass("UniversityFormModal: faculties counter '0/3 minimum' visible in amber")
            else:
                mark_pass("UniversityFormModal: faculties counter '0/3 minimum' visible")
            found_faculties_counter = True
        if '0/6 minimum' in text or '0/6' in text:
            classes = await span.get_attribute('class') or ''
            if 'amber' in classes:
                mark_pass("UniversityFormModal: conditions counter '0/6 minimum' visible in amber")
            else:
                mark_pass("UniversityFormModal: conditions counter '0/6 minimum' visible")
            found_conditions_counter = True

    if not found_faculties_counter:
        mark_fail("UniversityFormModal: faculties counter '0/3 minimum'", "Counter not found")
    if not found_conditions_counter:
        mark_fail("UniversityFormModal: conditions counter '0/6 minimum'", "Counter not found")

    # ---- Test 3: Submit without coverImage → error ----
    # Clear fields first (in case editing existing university)
    name_input = await page.wait_for_selector('[data-testid="uni-name"]', timeout=3000)
    await name_input.fill("Université de Test")
    city_input = await page.wait_for_selector('[data-testid="uni-city"]', timeout=3000)
    await city_input.fill("Shanghai")
    
    # Clear coverImage if set
    # Find "Suppr." button for coverImage (first one in Images section)
    suppr_buttons = await page.query_selector_all('button:has-text("Suppr.")')
    for btn in suppr_buttons:
        await btn.click()
        await page.wait_for_timeout(200)
    
    # Submit form without coverImage
    submit_btn = await page.wait_for_selector('[data-testid="uni-save-btn"]', timeout=3000)
    await submit_btn.click()
    await page.wait_for_timeout(500)

    # Check error message
    error_el = await page.query_selector('.bg-red-50.border-red-200')
    if error_el:
        error_text = await error_el.inner_text()
        print(f"  Error text after submit: '{error_text}'")
        if 'photo de couverture' in error_text.lower() and 'obligatoire' in error_text.lower():
            mark_pass("UniversityFormModal: submit without coverImage → error 'La photo de couverture est obligatoire'")
        else:
            mark_fail("UniversityFormModal: coverImage validation", f"Got error: '{error_text}' (expected: photo de couverture obligatoire)")
    else:
        # Try generic error selector
        err_text = await page.evaluate("""() => {
            const errorElements = Array.from(document.querySelectorAll('.bg-red-50, [class*="red"]'));
            return errorElements.map(el => el.textContent).join(" | ");
        }""")
        if 'couverture' in err_text:
            mark_pass("UniversityFormModal: submit without coverImage → error 'La photo de couverture est obligatoire'")
        else:
            mark_fail("UniversityFormModal: coverImage validation", f"No error found. Errors: {err_text}")

    # ---- Test 4: Mock coverImage upload → submit → logo error ----
    print("\n  -- Testing logo validation --")
    # Find the first image file input (for coverImage)
    form_file_inputs = await page.query_selector_all('.fixed input[type="file"][accept="image/*"]')
    
    if len(form_file_inputs) >= 1:
        # First file input = coverImage
        await form_file_inputs[0].set_input_files({
            'name': 'cover.png',
            'mimeType': 'image/png',
            'buffer': MINIMAL_PNG
        })
        await page.wait_for_timeout(2500)  # wait for mocked upload
        
        # Submit again
        submit_btn = await page.wait_for_selector('[data-testid="uni-save-btn"]', timeout=3000)
        await submit_btn.click()
        await page.wait_for_timeout(500)
        
        error_el = await page.query_selector('.bg-red-50.border-red-200')
        if error_el:
            error_text = await error_el.inner_text()
            print(f"  Error after coverImage set: '{error_text}'")
            if 'logo' in error_text.lower() and 'obligatoire' in error_text.lower():
                mark_pass("UniversityFormModal: submit without logo → error 'Le logo est obligatoire'")
            else:
                mark_fail("UniversityFormModal: logo validation", f"Got: '{error_text}'")
        else:
            mark_fail("UniversityFormModal: logo validation", "No error found after coverImage set")
    else:
        mark_fail("UniversityFormModal: logo validation", f"File inputs found: {len(form_file_inputs)}, expected >= 1")

    # ---- Test 5: Mock logo upload → submit → image error ----
    print("\n  -- Testing image principale validation --")
    if len(form_file_inputs) >= 2:
        await form_file_inputs[1].set_input_files({
            'name': 'logo.png',
            'mimeType': 'image/png',
            'buffer': MINIMAL_PNG
        })
        await page.wait_for_timeout(2500)
        
        submit_btn = await page.wait_for_selector('[data-testid="uni-save-btn"]', timeout=3000)
        await submit_btn.click()
        await page.wait_for_timeout(500)
        
        error_el = await page.query_selector('.bg-red-50.border-red-200')
        if error_el:
            error_text = await error_el.inner_text()
            print(f"  Error after logo set: '{error_text}'")
            if 'image principale' in error_text.lower() and 'obligatoire' in error_text.lower():
                mark_pass("UniversityFormModal: submit without image principale → error 'L image principale est obligatoire'")
            else:
                mark_fail("UniversityFormModal: image principale validation", f"Got: '{error_text}'")
        else:
            mark_fail("UniversityFormModal: image principale validation", "No error found after logo set")
    else:
        mark_fail("UniversityFormModal: image principale validation", f"Not enough file inputs (found {len(form_file_inputs)})")

    # ---- Test 6: Mock image upload → fill description → submit → foundedYear error ----
    print("\n  -- Testing foundedYear validation --")
    if len(form_file_inputs) >= 3:
        await form_file_inputs[2].set_input_files({
            'name': 'image.png',
            'mimeType': 'image/png',
            'buffer': MINIMAL_PNG
        })
        await page.wait_for_timeout(2500)
        
        # Fill description
        desc_textarea = await page.query_selector('textarea')
        if desc_textarea:
            await desc_textarea.fill("Une description complète de l'université pour les tests automatisés.")
        
        submit_btn = await page.wait_for_selector('[data-testid="uni-save-btn"]', timeout=3000)
        await submit_btn.click()
        await page.wait_for_timeout(500)
        
        error_el = await page.query_selector('.bg-red-50.border-red-200')
        if error_el:
            error_text = await error_el.inner_text()
            print(f"  Error after image set + description: '{error_text}'")
            if 'année' in error_text.lower() and 'obligatoire' in error_text.lower():
                mark_pass("UniversityFormModal: submit without foundedYear → error 'L année de création est obligatoire'")
            else:
                mark_fail("UniversityFormModal: foundedYear validation", f"Got: '{error_text}'")
        else:
            mark_fail("UniversityFormModal: foundedYear validation", "No error found")
    else:
        mark_fail("UniversityFormModal: foundedYear validation", f"Not enough file inputs (found {len(form_file_inputs)})")

    # ---- Test 7: Fill foundedYear → submit → president error ----
    print("\n  -- Testing president validation --")
    # Fill foundedYear field
    founded_year_input = await page.query_selector('input[placeholder="1956"]')
    if founded_year_input:
        await founded_year_input.fill("1985")
    
    # Clear president if any
    president_input = None
    inputs = await page.query_selector_all('input[type="text"]')
    for inp in inputs:
        placeholder = await inp.get_attribute('placeholder') or ''
        if placeholder == '':
            # Check label nearby
            pass
    
    # Find president input specifically by its amber border (isPartner && !formData.president)
    president_inputs = await page.query_selector_all('input.border-amber-300')
    print(f"  Found {len(president_inputs)} amber-bordered inputs")
    
    submit_btn = await page.wait_for_selector('[data-testid="uni-save-btn"]', timeout=3000)
    await submit_btn.click()
    await page.wait_for_timeout(500)
    
    error_el = await page.query_selector('.bg-red-50.border-red-200')
    if error_el:
        error_text = await error_el.inner_text()
        print(f"  Error after foundedYear: '{error_text}'")
        if 'président' in error_text.lower() and 'obligatoire' in error_text.lower():
            mark_pass("UniversityFormModal: submit without président → error 'Le nom du président est obligatoire'")
        else:
            mark_fail("UniversityFormModal: president validation", f"Got: '{error_text}'")
    else:
        mark_fail("UniversityFormModal: president validation", "No error found after foundedYear fill")

    # ---- Test 8: Fill president + youtubeUrl → add 1 faculty → submit → faculties error ----
    print("\n  -- Testing faculties < 3 validation --")
    # Find and fill president input
    # President input is after foundedYear in the grid
    all_text_inputs = await page.query_selector_all('input[type="text"]')
    for inp in all_text_inputs:
        placeholder = await inp.get_attribute('placeholder') or ''
        if placeholder == '':
            # Try to identify president by checking for amber class
            classes = await inp.get_attribute('class') or ''
            if 'amber' in classes:
                # This could be president or foundedYear
                current_val = await inp.input_value()
                if not current_val:
                    await inp.fill("Dr. Wang Li")
                    print(f"  Filled empty amber input with president name")
                    break
    
    # Also look for president by position - after founded year field
    # Fill YouTube URL
    yt_input = await page.query_selector('input[placeholder*="youtube"]')
    if not yt_input:
        yt_input = await page.query_selector('input[placeholder*="YouTube"]')
    if yt_input:
        await yt_input.fill("https://youtube.com/watch?v=test123")
    
    # Add 1 faculty (not enough - need 3)
    faculty_input = await page.query_selector('input[placeholder*="Faculté"]')
    if faculty_input:
        await faculty_input.fill("Faculté des Sciences")
        add_btn = await page.query_selector('button:has-text("+"):near(input[placeholder*="Faculté"])')
        if not add_btn:
            # Try to find the + button near the faculty input
            await faculty_input.press("Enter")
        else:
            await add_btn.click()
        await page.wait_for_timeout(300)
    
    submit_btn = await page.wait_for_selector('[data-testid="uni-save-btn"]', timeout=3000)
    await submit_btn.click()
    await page.wait_for_timeout(500)
    
    error_el = await page.query_selector('.bg-red-50.border-red-200')
    if error_el:
        error_text = await error_el.inner_text()
        print(f"  Error with 1 faculty: '{error_text}'")
        if 'faculté' in error_text.lower() and ('minimum' in error_text.lower() or '3' in error_text):
            mark_pass("UniversityFormModal: submit with < 3 faculties → error 'Minimum 3 facultés'")
        else:
            mark_fail("UniversityFormModal: faculties < 3 validation", f"Got: '{error_text}'")
    else:
        mark_fail("UniversityFormModal: faculties < 3 validation", "No error found with 1 faculty")

    # ---- Test 9: Add 3 faculties + 3 conditions → submit → conditions < 6 error ----
    print("\n  -- Testing conditions < 6 validation --")
    # Add 2 more faculties (total 3)
    faculty_input = await page.query_selector('input[placeholder*="Faculté"]')
    if faculty_input:
        await faculty_input.fill("Faculté de Médecine")
        await faculty_input.press("Enter")
        await page.wait_for_timeout(300)
        await faculty_input.fill("Faculté de Droit")
        await faculty_input.press("Enter")
        await page.wait_for_timeout(300)
    
    # Add 3 conditions (not enough - need 6)
    condition_input = await page.query_selector('input[placeholder*="Bac"]')
    if condition_input:
        conditions_to_add = ["Bac +2 minimum", "Dossier académique", "Lettre de motivation"]
        for cond in conditions_to_add:
            await condition_input.fill(cond)
            await condition_input.press("Enter")
            await page.wait_for_timeout(300)
    
    submit_btn = await page.wait_for_selector('[data-testid="uni-save-btn"]', timeout=3000)
    await submit_btn.click()
    await page.wait_for_timeout(500)
    
    error_el = await page.query_selector('.bg-red-50.border-red-200')
    if error_el:
        error_text = await error_el.inner_text()
        print(f"  Error with 3 conditions: '{error_text}'")
        if 'condition' in error_text.lower() and ('minimum' in error_text.lower() or '6' in error_text):
            mark_pass("UniversityFormModal: submit with < 6 conditions → error 'Minimum 6 conditions'")
        else:
            mark_fail("UniversityFormModal: conditions < 6 validation", f"Got: '{error_text}'")
    else:
        mark_fail("UniversityFormModal: conditions < 6 validation", "No error found with 3 conditions")

    # Screenshot of current state
    await page.screenshot(path=".screenshots/uni_form_validation.jpg", quality=40, full_page=False)

except Exception as e:
    mark_fail("UniversityFormModal tests", str(e))
    import traceback
    print(traceback.format_exc())

# ==========================================
# PART 3: ADMIN MESSAGING TESTS
# ==========================================
print("\n=== ADMIN MESSAGING TESTS ===")
try:
    # Logout partner
    logout_btn = await page.query_selector('[data-testid="partner-logout"]')
    if logout_btn:
        await logout_btn.click()
        await page.wait_for_timeout(2000)
    
    # Navigate to home and login as admin
    await page.goto(BASE_URL, wait_until='domcontentloaded')
    await page.wait_for_timeout(2000)

    # Open login modal
    login_btn = await page.wait_for_selector('[data-testid="login-button"]', timeout=8000)
    await login_btn.click()
    await page.wait_for_timeout(500)

    await page.fill('[data-testid="auth-email"]', "admin@winners-consulting.com")
    await page.fill('[data-testid="auth-password"]', "Admin2025!")
    await page.click('[data-testid="auth-submit-btn"]')
    await page.wait_for_timeout(3000)
    print("  Admin login submitted")

    # Navigate to admin panel
    await page.goto(f"{BASE_URL}/admin", wait_until='domcontentloaded')
    await page.wait_for_timeout(2000)

    # Find Partenaires section  
    # Look for navigation to Partenaires
    partner_nav = await page.query_selector('text=Partenaires')
    if partner_nav:
        await partner_nav.click()
        await page.wait_for_timeout(1000)
    
    # Look for Gestion tab first
    gestion_tab = await page.query_selector('text=Gestion')
    if gestion_tab:
        await gestion_tab.click()
        await page.wait_for_timeout(500)
        partner_nav = await page.query_selector('text=Partenaires')
        if partner_nav:
            await partner_nav.click()
            await page.wait_for_timeout(1000)

    # Find a partner's offers - look for Offres tab
    offres_tab = await page.query_selector('text=Offres')
    if offres_tab:
        await offres_tab.click()
        await page.wait_for_timeout(1000)
    
    # Find the Message button in partner offers
    message_btn = await page.query_selector('button:has-text("Message")')
    if not message_btn:
        message_btn = await page.query_selector('[data-testid*="message"]')
    
    # If no direct partner in view, try to find/click a partner first
    if not message_btn:
        # Look for any partner entry
        partner_entries = await page.query_selector_all('[data-testid*="partner"]')
        print(f"  Found {len(partner_entries)} partner entries")
        
        # Try clicking the first partner
        if partner_entries:
            await partner_entries[0].click()
            await page.wait_for_timeout(1000)
            
            # Look for Offres tab
            offres_tab = await page.query_selector('text=Offres')
            if offres_tab:
                await offres_tab.click()
                await page.wait_for_timeout(1000)
            
            message_btn = await page.query_selector('button:has-text("Message")')
    
    if message_btn:
        await message_btn.click()
        await page.wait_for_timeout(1500)
        
        # Check for admin-attach-file button
        admin_paperclip = await page.query_selector('[data-testid="admin-attach-file"]')
        if admin_paperclip and await admin_paperclip.is_visible():
            mark_pass("Admin messaging modal: paperclip button (admin-attach-file) visible")
        else:
            mark_fail("Admin messaging modal: paperclip button visible", "admin-attach-file not found or not visible")
        
        # Check for admin-message-input
        admin_input = await page.query_selector('[data-testid="admin-message-input"]')
        if admin_input and await admin_input.is_visible():
            mark_pass("Admin messaging modal: message input (admin-message-input) present")
        else:
            mark_fail("Admin messaging modal: message input present", "admin-message-input not found")
        
        # Check for admin-message-send
        admin_send = await page.query_selector('[data-testid="admin-message-send"]')
        if admin_send and await admin_send.is_visible():
            mark_pass("Admin messaging modal: send button (admin-message-send) present")
        else:
            mark_fail("Admin messaging modal: send button present", "admin-message-send not found")
        
        await page.screenshot(path=".screenshots/admin_message_modal.jpg", quality=40, full_page=False)
    else:
        mark_fail("Admin messaging: Message button found", "Could not find Message button in admin Offres tab")
        # Take screenshot to understand current state
        await page.screenshot(path=".screenshots/admin_state.jpg", quality=40, full_page=False)

except Exception as e:
    mark_fail("Admin messaging tests", str(e))
    import traceback
    print(traceback.format_exc())

# ==========================================
# SUMMARY
# ==========================================
print("\n" + "="*50)
print("TEST SUMMARY")
print("="*50)
print(f"PASSED: {len(results['passed'])}")
for p in results['passed']:
    print(f"  ✓ {p}")
print(f"\nFAILED: {len(results['failed'])}")
for f in results['failed']:
    print(f"  ✗ {f}")
print(f"\nTotal: {len(results['passed'])} passed, {len(results['failed'])} failed")
total = len(results['passed']) + len(results['failed'])
if total > 0:
    print(f"Success rate: {len(results['passed'])}/{total} ({int(len(results['passed'])/total*100)}%)")
