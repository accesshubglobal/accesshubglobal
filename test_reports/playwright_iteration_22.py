"""
Iteration 22 - Playwright tests for StudentFormModal validation
Tests all 13 validation scenarios:
- Step 1 (Identité): required fields red on Suivant, currentEmployer optional
- Step 2 (Résidence): all required
- Step 3 (Santé): bloodGroup/height/weight required
- Step 4 (Passeport): passportNumber/issuedDate/expiryDate required
- Step 5 (Scolarité): 3 schools all fields required
- Step 6 (Travail): optional, no error on Suivant
- Step 7 (Famille): Père/Mère/Emergency required, Conjoint optional
"""
import asyncio
import json

BASE_URL = "https://accesshub-cms.preview.emergentagent.com"
AGENT_EMAIL = "agent@test.com"
AGENT_PASSWORD = "Test2025!"

results = []

def record(name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}" + (f": {detail}" if detail else ""))
    results.append({"name": name, "passed": passed, "detail": detail})

async def login_agent(page):
    """Login as agent via homepage modal"""
    await page.goto(BASE_URL, wait_until="networkidle")
    await page.wait_for_timeout(1500)
    
    # Click Login button on homepage
    login_btn = page.get_by_role("button", name="Login")
    if not await login_btn.is_visible():
        login_btn = page.get_by_text("Login").first
    await login_btn.click(force=True)
    await page.wait_for_timeout(800)
    
    # Fill credentials
    await page.fill('[data-testid="auth-email"]', AGENT_EMAIL)
    await page.fill('[data-testid="auth-password"]', AGENT_PASSWORD)
    await page.click('[data-testid="auth-submit-btn"]', force=True)
    await page.wait_for_timeout(2000)
    
    # Navigate to /agent if not already there
    if "/agent" not in page.url:
        await page.goto(f"{BASE_URL}/agent", wait_until="networkidle")
        await page.wait_for_timeout(1500)
    
    return "/agent" in page.url

async def open_student_modal(page):
    """Navigate to Étudiants tab and open student form modal"""
    # Click Étudiants tab
    students_tab = page.get_by_role("button", name="Étudiants")
    if not await students_tab.is_visible():
        students_tab = page.locator('[data-testid="agent-tab-students"]')
    await students_tab.click(force=True)
    await page.wait_for_timeout(800)
    
    # Click Ajouter un étudiant
    add_btn = page.get_by_role("button", name="Ajouter un étudiant")
    if not await add_btn.is_visible():
        add_btn = page.locator('[data-testid="add-student-btn"]')
    await add_btn.click(force=True)
    await page.wait_for_timeout(800)
    
    # Verify modal opened
    return await page.is_visible("text=Ajouter un étudiant")

async def get_error_banner(page):
    """Get the error banner text if visible"""
    try:
        banner = page.locator('.bg-red-50.border.border-red-200.rounded-xl')
        if await banner.is_visible():
            return await banner.inner_text()
    except:
        pass
    return None

async def has_red_field(page, selector):
    """Check if a field has red styling (border-red-400 or bg-red-50 in class)"""
    try:
        el = page.locator(selector)
        if not await el.is_visible():
            return False
        class_attr = await el.get_attribute("class") or ""
        return "border-red-400" in class_attr or "bg-red-50" in class_attr
    except:
        return False

async def click_suivant(page):
    """Click the Suivant button"""
    btn = page.get_by_role("button", name="Suivant")
    await btn.click(force=True)
    await page.wait_for_timeout(600)

async def go_to_step(page, target_step, current_step=1):
    """Navigate to a specific step by clicking step tabs directly"""
    steps = ["Identité", "Résidence", "Santé & Chine", "Passeport", "Scolarité", "Travail", "Famille"]
    # Try clicking step tab directly
    step_label = steps[target_step - 1]
    step_btn = page.locator(f'button:has-text("{step_label}")').first
    await step_btn.click(force=True)
    await page.wait_for_timeout(500)

async def test_all_validations(page):
    """Main test function covering all 13 scenarios"""
    
    # === TEST 1: Login ===
    logged_in = await login_agent(page)
    record("Test 1: Agent login (agent@test.com / Test2025!)", logged_in, f"URL: {page.url}")
    if not logged_in:
        record("FATAL", False, "Cannot continue - login failed")
        return

    # === Open StudentFormModal ===
    modal_opened = await open_student_modal(page)
    record("Test 2: Open StudentFormModal via Étudiants tab", modal_opened)
    if not modal_opened:
        record("FATAL", False, "Cannot continue - modal not opened")
        return

    await page.screenshot(path=".screenshots/step1_modal_open.jpg", quality=40, full_page=False)

    # ===================================================================
    # TEST 3: Step 1 - Click Suivant without filling → error banner
    # ===================================================================
    await click_suivant(page)
    
    banner_text = await get_error_banner(page)
    has_banner = banner_text is not None
    record("Test 3: Step 1 - Error banner shown on Suivant (empty)", has_banner, 
           f"Banner: {banner_text[:80] if banner_text else 'NOT FOUND'}")
    
    # Check counter in banner
    if banner_text:
        has_counter = "manquant" in banner_text
        record("Test 3b: Step 1 - Banner contains missing field counter", has_counter, f"Text: {banner_text}")

    # ===================================================================
    # TEST 4: Step 1 - Required fields should be red
    # ===================================================================
    await page.wait_for_timeout(300)
    
    # Check firstName field is red
    firstname_red = await has_red_field(page, 'input[value=""]')
    # More specific: look at first input on step 1
    first_inp = page.locator('input').first
    first_class = await first_inp.get_attribute("class") or ""
    firstname_is_red = "border-red-400" in first_class
    
    # Check if any inputs have red styling
    red_inputs = await page.evaluate("""() => {
        const inputs = Array.from(document.querySelectorAll('input, select'));
        return inputs.filter(el => {
            const cls = el.className || '';
            return cls.includes('border-red-400') || cls.includes('bg-red-50');
        }).length;
    }""")
    
    record("Test 4: Step 1 - Required fields have red styling", red_inputs > 0, 
           f"Red fields count: {red_inputs}")

    # ===================================================================
    # TEST 5: Step 1 - currentEmployer should NOT be red
    # ===================================================================
    # Find currentEmployer input by looking for placeholder "Optionnel"
    employer_red = await page.evaluate("""() => {
        const inputs = Array.from(document.querySelectorAll('input[placeholder="Optionnel"]'));
        if (inputs.length === 0) return null;
        const cls = inputs[0].className || '';
        return cls.includes('border-red-400') || cls.includes('bg-red-50');
    }""")
    
    if employer_red is None:
        record("Test 5: Step 1 - currentEmployer (Optionnel) NOT red", False, "Field not found by placeholder")
    else:
        record("Test 5: Step 1 - currentEmployer (Optionnel) NOT red", employer_red == False, 
               f"Has red styling: {employer_red}")

    # ===================================================================
    # TEST 6: Fill all required fields in Step 1 → Suivant goes to Step 2
    # ===================================================================
    # Fill all required fields
    await page.locator('input').nth(0).fill("Jean")  # firstName
    await page.locator('input').nth(1).fill("Dupont")  # lastName
    await page.locator('input[type="email"]').nth(0).fill("jean.dupont@test.com")  # email
    await page.locator('input').nth(3).fill("+33612345678")  # phone
    
    # sex select
    await page.select_option('select', value="M")  # sex (first select)
    
    # date of birth
    dob_input = page.locator('input[type="date"]').nth(0)
    await dob_input.fill("1995-06-15")
    
    await page.locator('input').nth(5).fill("Français")  # nationality
    await page.locator('input').nth(6).fill("France")  # countryOfBirth
    await page.locator('input').nth(7).fill("Paris")  # placeOfBirth
    await page.locator('input').nth(8).fill("Français")  # nativeLanguage
    await page.locator('input').nth(9).fill("Chrétien")  # religion
    
    # maritalStatus select - second select
    selects = page.locator('select')
    await selects.nth(1).select_option("Célibataire")
    
    # highestEducation select - third select
    await selects.nth(2).select_option("Licence")
    
    await page.locator('input').nth(10).fill("Ingénieur")  # occupation
    # currentEmployer - skip (optional)
    
    # personalEmail
    email_inputs = page.locator('input[type="email"]')
    email_count = await email_inputs.count()
    if email_count > 1:
        await email_inputs.nth(1).fill("perso@test.com")
    
    # majorInChina and hobby - find by searching unfilled text inputs
    all_text_inputs = page.locator('input:not([type="email"]):not([type="date"]):not([type="number"]):not([placeholder="Optionnel"])')
    text_count = await all_text_inputs.count()
    
    # Fill majorInChina and hobby
    await page.locator('input').nth(12).fill("Informatique")  # majorInChina
    await page.locator('input').nth(13).fill("Lecture")  # hobby
    
    await page.wait_for_timeout(300)
    
    # Click Suivant
    await click_suivant(page)
    
    # Check if we moved to step 2
    step2_visible = await page.is_visible("text=Adresse permanente")
    banner_after_fill = await get_error_banner(page)
    
    record("Test 6: Step 1 - Fill all required → Suivant goes to Step 2", step2_visible,
           f"Step 2 visible: {step2_visible}, Banner: {banner_after_fill}")

    await page.screenshot(path=".screenshots/step2_residence.jpg", quality=40, full_page=False)

    # ===================================================================
    # TEST 7: Step 2 (Résidence) - Click Suivant without filling → error
    # ===================================================================
    await click_suivant(page)
    
    banner_step2 = await get_error_banner(page)
    red_count_step2 = await page.evaluate("""() => {
        const inputs = Array.from(document.querySelectorAll('input, select'));
        return inputs.filter(el => {
            const cls = el.className || '';
            return cls.includes('border-red-400') || cls.includes('bg-red-50');
        }).length;
    }""")
    
    record("Test 7: Step 2 - Error on Suivant without filling", 
           banner_step2 is not None and red_count_step2 > 0,
           f"Banner: {banner_step2[:60] if banner_step2 else 'NONE'}, Red fields: {red_count_step2}")

    # Navigate to Step 3 directly by clicking tab
    await go_to_step(page, 3)
    await page.wait_for_timeout(500)

    # ===================================================================
    # TEST 8: Step 3 (Santé) - Click Suivant without bloodGroup/height/weight → error
    # ===================================================================
    step3_visible = await page.is_visible("text=État de santé")
    if not step3_visible:
        step3_visible = await page.is_visible("text=Groupe sanguin")
    
    await click_suivant(page)
    
    banner_step3 = await get_error_banner(page)
    
    # Check bloodGroup, height, weight are red
    blood_group_red = await page.evaluate("""() => {
        const selects = Array.from(document.querySelectorAll('select'));
        const bloodSelect = selects.find(s => {
            return Array.from(s.options).some(o => ['A+','A-','B+','B-'].includes(o.text));
        });
        if (!bloodSelect) return null;
        const cls = bloodSelect.className || '';
        return cls.includes('border-red-400') || cls.includes('bg-red-50');
    }""")
    
    height_red = await page.evaluate("""() => {
        const inputs = Array.from(document.querySelectorAll('input[placeholder="170"]'));
        if (inputs.length === 0) return null;
        const cls = inputs[0].className || '';
        return cls.includes('border-red-400') || cls.includes('bg-red-50');
    }""")
    
    record("Test 8: Step 3 (Santé) - Error on Suivant without bloodGroup/height/weight",
           banner_step3 is not None,
           f"Banner: {banner_step3[:60] if banner_step3 else 'NONE'}, bloodGroup red: {blood_group_red}, height red: {height_red}")

    # Navigate to Step 4
    await go_to_step(page, 4)
    await page.wait_for_timeout(500)

    # ===================================================================
    # TEST 9: Step 4 (Passeport) - Click Suivant without dates → error
    # ===================================================================
    step4_visible = await page.is_visible("text=Passeport actuel")
    await click_suivant(page)
    
    banner_step4 = await get_error_banner(page)
    
    # Check passport date fields are red
    passport_dates_red = await page.evaluate("""() => {
        const inputs = Array.from(document.querySelectorAll('input[type="date"]'));
        return inputs.filter(el => {
            const cls = el.className || '';
            return cls.includes('border-red-400') || cls.includes('bg-red-50');
        }).length;
    }""")
    
    record("Test 9: Step 4 (Passeport) - Error on Suivant without dates",
           banner_step4 is not None,
           f"Banner: {banner_step4[:60] if banner_step4 else 'NONE'}, Red date fields: {passport_dates_red}")

    # Navigate to Step 5
    await go_to_step(page, 5)
    await page.wait_for_timeout(500)

    # ===================================================================
    # TEST 10: Step 5 (Scolarité) - Click Suivant without 3 schools → error with counter
    # ===================================================================
    step5_visible = await page.is_visible("text=École 1")
    await click_suivant(page)
    
    banner_step5 = await get_error_banner(page)
    has_counter_step5 = banner_step5 is not None and "manquant" in banner_step5
    
    # Check edu fields are red (check for edu_ keys)
    edu_red_count = await page.evaluate("""() => {
        const inputs = Array.from(document.querySelectorAll('input, select'));
        return inputs.filter(el => {
            const cls = el.className || '';
            return cls.includes('border-red-400') || cls.includes('bg-red-50');
        }).length;
    }""")
    
    record("Test 10: Step 5 (Scolarité) - Error on Suivant without 3 schools",
           banner_step5 is not None and edu_red_count > 0,
           f"Banner: {banner_step5[:70] if banner_step5 else 'NONE'}, Counter: {has_counter_step5}, Red fields: {edu_red_count}")

    # Navigate to Step 6
    await go_to_step(page, 6)
    await page.wait_for_timeout(500)

    # ===================================================================
    # TEST 11: Step 6 (Travail) - optional section, Suivant without filling → NO error
    # ===================================================================
    step6_visible = await page.is_visible("text=Expérience 1")
    await click_suivant(page)
    await page.wait_for_timeout(500)
    
    banner_step6 = await get_error_banner(page)
    
    # Check if we moved to step 7
    step7_visible = await page.is_visible("text=Famille")
    # Also check if Famille tab is active
    step7_content_visible = await page.is_visible("text=Père") or await page.is_visible("text=Contact d'urgence")
    
    record("Test 11: Step 6 (Travail) - No error on Suivant (optional section)",
           banner_step6 is None and (step7_visible or step7_content_visible),
           f"Banner: {banner_step6}, Step 7 visible: {step7_visible}, Step 7 content: {step7_content_visible}")

    await page.screenshot(path=".screenshots/step7_famille.jpg", quality=40, full_page=False)

    # ===================================================================
    # TEST 12: Step 7 (Famille) - Click Enregistrer without Père → error with red fields
    # ===================================================================
    # Make sure we're on step 7
    if not step7_content_visible:
        await go_to_step(page, 7)
        await page.wait_for_timeout(500)
    
    # Click Enregistrer (submit button)
    submit_btn = page.locator('[data-testid="student-submit-btn"]')
    if not await submit_btn.is_visible():
        submit_btn = page.get_by_role("button", name="Enregistrer")
    await submit_btn.click(force=True)
    await page.wait_for_timeout(600)
    
    banner_step7 = await get_error_banner(page)
    
    # Check fatherInfo fields are red
    father_red_count = await page.evaluate("""() => {
        const inputs = Array.from(document.querySelectorAll('input, select'));
        return inputs.filter(el => {
            const cls = el.className || '';
            return cls.includes('border-red-400') || cls.includes('bg-red-50');
        }).length;
    }""")
    
    record("Test 12: Step 7 - Enregistrer without Père → error with red fields",
           banner_step7 is not None and father_red_count > 0,
           f"Banner: {banner_step7[:70] if banner_step7 else 'NONE'}, Red fields: {father_red_count}")

    # ===================================================================
    # TEST 13: Step 7 - Conjoint(e) section is marked (optionnel) and NOT red
    # ===================================================================
    conjoint_optional_text = await page.evaluate("""() => {
        const all = Array.from(document.querySelectorAll('p, span'));
        return all.some(el => el.textContent.includes('Conjoint') && el.textContent.includes('optionnel'));
    }""")
    
    # Check conjoint inputs are NOT red
    conjoint_not_red = await page.evaluate("""() => {
        // Find the Conjoint(e) section - it has (optionnel) text
        const sections = Array.from(document.querySelectorAll('.border.border-gray-100.rounded-xl'));
        let conjointSection = null;
        for (const section of sections) {
            const text = section.textContent || '';
            if (text.includes('Conjoint') && text.includes('optionnel')) {
                conjointSection = section;
                break;
            }
        }
        if (!conjointSection) return null;
        const inputs = Array.from(conjointSection.querySelectorAll('input, select'));
        const redInputs = inputs.filter(el => {
            const cls = el.className || '';
            return cls.includes('border-red-400') || cls.includes('bg-red-50');
        });
        return redInputs.length === 0;  // true if none are red
    }""")
    
    record("Test 13: Step 7 - Conjoint(e) marked (optionnel) in UI", 
           conjoint_optional_text,
           f"Has (optionnel) text: {conjoint_optional_text}")
    
    record("Test 13b: Step 7 - Conjoint(e) fields NOT red when empty",
           conjoint_not_red == True,
           f"Conjoint section not red: {conjoint_not_red}")

    # ===================================================================
    # TEST 14: Step 7 - Contact d'urgence is marked * and fields are red
    # ===================================================================
    emergency_asterisk = await page.evaluate("""() => {
        const all = Array.from(document.querySelectorAll('p, span'));
        return all.some(el => el.textContent.includes("Contact d'urgence") && el.textContent.includes('*'));
    }""")
    
    # Check emergency fields are red
    emergency_red = await page.evaluate("""() => {
        const section = document.querySelector('.border.border-red-100.rounded-xl');
        if (!section) return null;
        const inputs = Array.from(section.querySelectorAll('input'));
        const redInputs = inputs.filter(el => {
            const cls = el.className || '';
            return cls.includes('border-red-400') || cls.includes('bg-red-50');
        });
        return redInputs.length;
    }""")
    
    record("Test 14: Step 7 - Contact d'urgence has * marker", 
           emergency_asterisk,
           f"Has * marker: {emergency_asterisk}")
    
    record("Test 14b: Step 7 - Contact d'urgence fields are red (required, empty)",
           emergency_red is not None and emergency_red > 0,
           f"Red emergency fields: {emergency_red}")

    await page.screenshot(path=".screenshots/step7_family_validation.jpg", quality=40, full_page=False)

    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    passed = sum(1 for r in results if r["passed"])
    total = len(results)
    print(f"Passed: {passed}/{total}")
    for r in results:
        status = "✓" if r["passed"] else "✗"
        print(f"  {status} {r['name']}")
    
    return results

# Run the tests
page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type in ["error", "warning"] else None)
await page.set_viewport_size({"width": 1920, "height": 1080})

try:
    test_results = await test_all_validations(page)
except Exception as e:
    print(f"FATAL ERROR: {e}")
    import traceback
    traceback.print_exc()

print("Testing completed.")
