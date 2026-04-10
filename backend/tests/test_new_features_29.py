"""
Test file for new features (iteration 29):
1. Duplicate APIs: offers, universities, housing
2. Pre-approval review: employer details, partner details
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ── Admin credentials ──
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"

# ── Test employer & partner ──
EMPLOYER_EMAIL = "test_employer_auto@test.com"
EMPLOYER_PASSWORD = "Employer2025!"
PARTNER_EMAIL = "partner@test.com"
PARTNER_PASSWORD = "Partner2025!"


@pytest.fixture(scope="module")
def admin_token():
    """Login as admin and return token"""
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    data = resp.json()
    token = data.get("token") or data.get("access_token")
    assert token, "No token in response"
    return token


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ─────────────────────────────────────────────────────────────────────
# Section 1: Duplicate - Offers
# ─────────────────────────────────────────────────────────────────────

class TestDuplicateOffer:
    """Test POST /api/admin/offers/{id}/duplicate"""

    def test_get_existing_offers(self, admin_headers):
        """Check that at least 1 offer exists for testing"""
        resp = requests.get(f"{BASE_URL}/api/admin/offers", headers=admin_headers)
        assert resp.status_code == 200
        offers = resp.json()
        assert isinstance(offers, list)
        print(f"Found {len(offers)} offers")
        assert len(offers) > 0, "Need at least 1 offer to test duplication"

    def test_duplicate_offer_returns_200(self, admin_headers):
        """POST /api/admin/offers/{id}/duplicate should return 200 with id and message"""
        # Get an existing offer
        resp = requests.get(f"{BASE_URL}/api/admin/offers", headers=admin_headers)
        assert resp.status_code == 200
        offers = resp.json()
        assert len(offers) > 0, "No offers available"
        offer_id = offers[0]["id"]

        # Duplicate
        dup_resp = requests.post(f"{BASE_URL}/api/admin/offers/{offer_id}/duplicate", headers=admin_headers)
        assert dup_resp.status_code == 200, f"Expected 200, got {dup_resp.status_code}: {dup_resp.text}"
        data = dup_resp.json()
        assert "id" in data, f"Response should contain 'id': {data}"
        assert "message" in data, f"Response should contain 'message': {data}"
        print(f"Duplicate offer created: id={data['id']}, message={data['message']}")

    def test_duplicate_offer_creates_copy_with_title(self, admin_headers):
        """Duplicated offer title should contain '(copie)'"""
        # Get original offer
        resp = requests.get(f"{BASE_URL}/api/admin/offers", headers=admin_headers)
        offers = resp.json()
        original = offers[0]
        original_id = original["id"]
        original_title = original["title"]

        # Duplicate
        dup_resp = requests.post(f"{BASE_URL}/api/admin/offers/{original_id}/duplicate", headers=admin_headers)
        assert dup_resp.status_code == 200
        new_id = dup_resp.json()["id"]

        # Verify the new offer exists and has (copie) in title
        all_offers = requests.get(f"{BASE_URL}/api/admin/offers", headers=admin_headers).json()
        new_offer = next((o for o in all_offers if o["id"] == new_id), None)
        assert new_offer is not None, "Duplicated offer not found in list"
        expected_title = f"{original_title} (copie)"
        assert "(copie)" in new_offer["title"], f"Title should contain '(copie)', got: {new_offer['title']}"
        assert new_offer["views"] == 0, "Duplicated offer should start with 0 views"
        print(f"Duplicated offer title: '{new_offer['title']}'")

    def test_duplicate_offer_404_for_invalid_id(self, admin_headers):
        """POST /api/admin/offers/invalid-id/duplicate should return 404"""
        resp = requests.post(f"{BASE_URL}/api/admin/offers/invalid-nonexistent-id/duplicate", headers=admin_headers)
        assert resp.status_code == 404, f"Expected 404, got {resp.status_code}"


# ─────────────────────────────────────────────────────────────────────
# Section 2: Duplicate - Universities
# ─────────────────────────────────────────────────────────────────────

class TestDuplicateUniversity:
    """Test POST /api/admin/universities/{id}/duplicate"""

    def test_duplicate_university_returns_200(self, admin_headers):
        """POST /api/admin/universities/{id}/duplicate should return 200 with id"""
        # Get an existing university
        resp = requests.get(f"{BASE_URL}/api/admin/universities", headers=admin_headers)
        assert resp.status_code == 200
        unis = resp.json()
        if len(unis) == 0:
            pytest.skip("No universities available for duplication test")
        uni_id = unis[0]["id"]
        original_name = unis[0]["name"]

        # Duplicate
        dup_resp = requests.post(f"{BASE_URL}/api/admin/universities/{uni_id}/duplicate", headers=admin_headers)
        assert dup_resp.status_code == 200, f"Expected 200, got {dup_resp.status_code}: {dup_resp.text}"
        data = dup_resp.json()
        assert "id" in data, f"Should contain 'id': {data}"
        assert "message" in data, f"Should contain 'message': {data}"
        print(f"Duplicate university: id={data['id']}, message={data['message']}")

    def test_duplicate_university_title_has_copie(self, admin_headers):
        """Duplicated university name should contain '(copie)'"""
        resp = requests.get(f"{BASE_URL}/api/admin/universities", headers=admin_headers)
        unis = resp.json()
        if len(unis) == 0:
            pytest.skip("No universities available")
        original = unis[0]
        original_id = original["id"]
        original_name = original["name"]

        dup_resp = requests.post(f"{BASE_URL}/api/admin/universities/{original_id}/duplicate", headers=admin_headers)
        assert dup_resp.status_code == 200
        new_id = dup_resp.json()["id"]

        # Verify name
        all_unis = requests.get(f"{BASE_URL}/api/admin/universities", headers=admin_headers).json()
        new_uni = next((u for u in all_unis if u["id"] == new_id), None)
        assert new_uni is not None, "Duplicated university not found"
        assert "(copie)" in new_uni["name"], f"Name should contain '(copie)', got: {new_uni['name']}"
        print(f"Duplicated university name: '{new_uni['name']}'")

    def test_duplicate_university_404_for_invalid_id(self, admin_headers):
        resp = requests.post(f"{BASE_URL}/api/admin/universities/invalid-nonexistent-id/duplicate", headers=admin_headers)
        assert resp.status_code == 404


# ─────────────────────────────────────────────────────────────────────
# Section 3: Duplicate - Housing
# ─────────────────────────────────────────────────────────────────────

class TestDuplicateHousing:
    """Test POST /api/admin/housing/{id}/duplicate"""

    def test_duplicate_housing_returns_200(self, admin_headers):
        """POST /api/admin/housing/{id}/duplicate should return 200"""
        resp = requests.get(f"{BASE_URL}/api/admin/housing", headers=admin_headers)
        assert resp.status_code == 200
        housing = resp.json()
        if len(housing) == 0:
            pytest.skip("No housing available for duplication test")
        housing_id = housing[0]["id"]

        dup_resp = requests.post(f"{BASE_URL}/api/admin/housing/{housing_id}/duplicate", headers=admin_headers)
        assert dup_resp.status_code == 200, f"Expected 200, got {dup_resp.status_code}: {dup_resp.text}"
        data = dup_resp.json()
        assert "id" in data, f"Should contain 'id': {data}"
        assert "message" in data, f"Should contain 'message': {data}"
        print(f"Duplicate housing: id={data['id']}")

    def test_duplicate_housing_404_for_invalid_id(self, admin_headers):
        resp = requests.post(f"{BASE_URL}/api/admin/housing/invalid-nonexistent-id/duplicate", headers=admin_headers)
        assert resp.status_code == 404


# ─────────────────────────────────────────────────────────────────────
# Section 4: Employer Details
# ─────────────────────────────────────────────────────────────────────

class TestEmployerDetails:
    """Test GET /api/admin/employers/{id}/details"""

    def test_get_employer_list(self, admin_headers):
        """GET /api/admin/employers should return employer list"""
        resp = requests.get(f"{BASE_URL}/api/admin/employers", headers=admin_headers)
        assert resp.status_code == 200
        employers = resp.json()
        assert isinstance(employers, list)
        print(f"Found {len(employers)} employers")
        assert len(employers) > 0, "Need at least one employer"

    def test_get_employer_details_returns_200(self, admin_headers):
        """GET /api/admin/employers/{id}/details should return full employer info"""
        # Get the list first
        list_resp = requests.get(f"{BASE_URL}/api/admin/employers", headers=admin_headers)
        assert list_resp.status_code == 200
        employers = list_resp.json()
        assert len(employers) > 0, "No employers available"
        emp_id = employers[0]["id"]

        # Get details
        det_resp = requests.get(f"{BASE_URL}/api/admin/employers/{emp_id}/details", headers=admin_headers)
        assert det_resp.status_code == 200, f"Expected 200, got {det_resp.status_code}: {det_resp.text}"
        data = det_resp.json()
        assert "email" in data, f"Should have email: {data.keys()}"
        assert "firstName" in data, f"Should have firstName: {data.keys()}"
        assert "lastName" in data, f"Should have lastName: {data.keys()}"
        assert "password" not in data, "Password should not be returned!"
        print(f"Employer details keys: {list(data.keys())}")

    def test_employer_details_returns_company_info(self, admin_headers):
        """Employer details should include 'company' field"""
        list_resp = requests.get(f"{BASE_URL}/api/admin/employers", headers=admin_headers)
        employers = list_resp.json()
        # Find an employer with company info
        emp_with_company = next((e for e in employers if e.get("hasCompanyInfo")), None)
        if not emp_with_company:
            # Try any employer
            emp_with_company = employers[0] if employers else None
        if not emp_with_company:
            pytest.skip("No employer with company info available")

        emp_id = emp_with_company["id"]
        det_resp = requests.get(f"{BASE_URL}/api/admin/employers/{emp_id}/details", headers=admin_headers)
        assert det_resp.status_code == 200
        data = det_resp.json()
        assert "company" in data, f"Should have 'company' field: {data.keys()}"
        print(f"Company info: {data.get('company', {})}")

    def test_employer_details_404_for_invalid_id(self, admin_headers):
        """GET /api/admin/employers/invalid-id/details should return 404"""
        resp = requests.get(f"{BASE_URL}/api/admin/employers/invalid-nonexistent-id/details", headers=admin_headers)
        assert resp.status_code == 404


# ─────────────────────────────────────────────────────────────────────
# Section 5: Partner Details
# ─────────────────────────────────────────────────────────────────────

class TestPartnerDetails:
    """Test GET /api/admin/partners/{id}/details"""

    def test_get_partner_list(self, admin_headers):
        """GET /api/admin/partners should return partner list"""
        resp = requests.get(f"{BASE_URL}/api/admin/partners", headers=admin_headers)
        assert resp.status_code == 200
        partners = resp.json()
        assert isinstance(partners, list)
        print(f"Found {len(partners)} partners")

    def test_get_partner_details_returns_200(self, admin_headers):
        """GET /api/admin/partners/{id}/details should return full partner info"""
        list_resp = requests.get(f"{BASE_URL}/api/admin/partners", headers=admin_headers)
        assert list_resp.status_code == 200
        partners = list_resp.json()
        if len(partners) == 0:
            pytest.skip("No partners available")
        partner_id = partners[0]["id"]

        det_resp = requests.get(f"{BASE_URL}/api/admin/partners/{partner_id}/details", headers=admin_headers)
        assert det_resp.status_code == 200, f"Expected 200, got {det_resp.status_code}: {det_resp.text}"
        data = det_resp.json()
        assert "email" in data, f"Should have email: {data.keys()}"
        assert "firstName" in data, f"Should have firstName: {data.keys()}"
        assert "password" not in data, "Password should not be returned!"
        print(f"Partner details keys: {list(data.keys())}")

    def test_partner_details_404_for_invalid_id(self, admin_headers):
        """GET /api/admin/partners/invalid-id/details should return 404"""
        resp = requests.get(f"{BASE_URL}/api/admin/partners/invalid-nonexistent-id/details", headers=admin_headers)
        assert resp.status_code == 404

    def test_partner_details_contains_partner_code(self, admin_headers):
        """Partner details should contain partnerCode for display"""
        list_resp = requests.get(f"{BASE_URL}/api/admin/partners", headers=admin_headers)
        partners = list_resp.json()
        if not partners:
            pytest.skip("No partners available")
        # Try the test partner specifically
        partner = next((p for p in partners if "partner@test.com" in p.get("email", "")), None)
        if not partner:
            partner = partners[0]

        det_resp = requests.get(f"{BASE_URL}/api/admin/partners/{partner['id']}/details", headers=admin_headers)
        assert det_resp.status_code == 200
        data = det_resp.json()
        # Should have partnerCode
        print(f"Partner details: partnerCode={data.get('partnerCode')}, email={data.get('email')}")

