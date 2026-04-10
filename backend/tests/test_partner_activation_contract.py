"""
Tests for Partner Activation Code Gate and Contract features.
Tests: verify-login-code, partner/contract, admin/partners/login-code, admin/partners/contract
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
PARTNER_EMAIL = "partner@test.com"
PARTNER_PASSWORD = "Partner2025!"
PARTNER_ACTIVATION_CODE = "PA-MSSCGLU8"
PARTNER_ID = "3867160f-df86-4df3-80bb-ad102becc664"
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"


@pytest.fixture(scope="module")
def partner_token():
    """Authenticate as partner and return token"""
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": PARTNER_EMAIL,
        "password": PARTNER_PASSWORD
    })
    assert resp.status_code == 200, f"Partner login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture(scope="module")
def admin_token():
    """Authenticate as admin and return token"""
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture(scope="module")
def partner_headers(partner_token):
    return {"Authorization": f"Bearer {partner_token}"}


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ── 1. Verify Login Code (POST /api/partner/verify-login-code) ─────────────

class TestVerifyLoginCode:
    """Partner login code verification endpoint"""

    def test_verify_login_code_correct(self, partner_headers):
        """POST with correct code should return {success: true}"""
        resp = requests.post(
            f"{BASE_URL}/api/partner/verify-login-code",
            json={"code": PARTNER_ACTIVATION_CODE},
            headers=partner_headers
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data.get("success") is True, f"Expected success=true, got: {data}"
        print(f"PASS: verify-login-code correct → {data}")

    def test_verify_login_code_wrong(self, partner_headers):
        """POST with wrong code should return 400 error"""
        resp = requests.post(
            f"{BASE_URL}/api/partner/verify-login-code",
            json={"code": "PA-WRONGCOD"},
            headers=partner_headers
        )
        assert resp.status_code == 400, f"Expected 400, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert "detail" in data, f"Expected 'detail' key in error response, got: {data}"
        print(f"PASS: verify-login-code wrong code → {resp.status_code}: {data}")

    def test_verify_login_code_empty(self, partner_headers):
        """POST with empty code should return 400 error"""
        resp = requests.post(
            f"{BASE_URL}/api/partner/verify-login-code",
            json={"code": ""},
            headers=partner_headers
        )
        assert resp.status_code == 400, f"Expected 400, got {resp.status_code}: {resp.text}"
        print(f"PASS: verify-login-code empty → {resp.status_code}")

    def test_verify_login_code_unauthenticated(self):
        """POST without auth token should return 403/401"""
        resp = requests.post(
            f"{BASE_URL}/api/partner/verify-login-code",
            json={"code": PARTNER_ACTIVATION_CODE}
        )
        assert resp.status_code in [401, 403], f"Expected 401/403, got {resp.status_code}: {resp.text}"
        print(f"PASS: verify-login-code unauthenticated → {resp.status_code}")

    def test_verify_login_code_lowercase_normalized(self, partner_headers):
        """POST with lowercase code should work (normalized to uppercase)"""
        resp = requests.post(
            f"{BASE_URL}/api/partner/verify-login-code",
            json={"code": PARTNER_ACTIVATION_CODE.lower()},
            headers=partner_headers
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data.get("success") is True
        print(f"PASS: verify-login-code lowercase → normalized and accepted")


# ── 2. Partner Contract (GET /api/partner/contract) ────────────────────────

class TestPartnerContract:
    """Partner contract retrieval endpoint"""

    def test_get_partner_contract(self, partner_headers):
        """GET /api/partner/contract should return contract data"""
        resp = requests.get(
            f"{BASE_URL}/api/partner/contract",
            headers=partner_headers
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert "contractUrl" in data, f"Expected 'contractUrl' key, got: {data}"
        assert "contractName" in data, f"Expected 'contractName' key, got: {data}"
        assert "contractUploadedAt" in data, f"Expected 'contractUploadedAt' key, got: {data}"
        print(f"PASS: GET /api/partner/contract → contractUrl={data.get('contractUrl')}, contractName={data.get('contractName')}")

    def test_get_partner_contract_unauthenticated(self):
        """GET /api/partner/contract without token should return 401/403"""
        resp = requests.get(f"{BASE_URL}/api/partner/contract")
        assert resp.status_code in [401, 403], f"Expected 401/403, got {resp.status_code}"
        print(f"PASS: GET /api/partner/contract unauthenticated → {resp.status_code}")


# ── 3. Admin: Update Partner Login Code ────────────────────────────────────

class TestAdminUpdateLoginCode:
    """Admin: update partner login code"""

    def test_admin_update_login_code(self, admin_headers):
        """PUT /api/admin/partners/{id}/login-code should update code"""
        # Set code back to the original value to not break other tests
        resp = requests.put(
            f"{BASE_URL}/api/admin/partners/{PARTNER_ID}/login-code",
            json={"partnerCode": PARTNER_ACTIVATION_CODE},
            headers=admin_headers
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data.get("success") is True, f"Expected success=true, got: {data}"
        assert data.get("partnerCode") == PARTNER_ACTIVATION_CODE, f"Expected partnerCode={PARTNER_ACTIVATION_CODE}, got: {data}"
        print(f"PASS: PUT /api/admin/partners/{PARTNER_ID}/login-code → {data}")

    def test_admin_update_login_code_new_value(self, admin_headers):
        """PUT /api/admin/partners/{id}/login-code with new code then restore"""
        # Set to new code
        new_code = "PA-TEST1234"
        resp = requests.put(
            f"{BASE_URL}/api/admin/partners/{PARTNER_ID}/login-code",
            json={"partnerCode": new_code},
            headers=admin_headers
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data.get("partnerCode") == new_code, f"Expected {new_code}, got: {data.get('partnerCode')}"

        # Restore original code
        restore = requests.put(
            f"{BASE_URL}/api/admin/partners/{PARTNER_ID}/login-code",
            json={"partnerCode": PARTNER_ACTIVATION_CODE},
            headers=admin_headers
        )
        assert restore.status_code == 200, "Failed to restore original code"
        print(f"PASS: update code to {new_code}, then restored to {PARTNER_ACTIVATION_CODE}")

    def test_admin_update_login_code_empty(self, admin_headers):
        """PUT with empty code should return 400"""
        resp = requests.put(
            f"{BASE_URL}/api/admin/partners/{PARTNER_ID}/login-code",
            json={"partnerCode": ""},
            headers=admin_headers
        )
        assert resp.status_code == 400, f"Expected 400, got {resp.status_code}: {resp.text}"
        print(f"PASS: PUT login-code empty → {resp.status_code}")

    def test_admin_update_login_code_invalid_partner(self, admin_headers):
        """PUT with invalid partner ID should return 404"""
        resp = requests.put(
            f"{BASE_URL}/api/admin/partners/invalid-nonexistent-id/login-code",
            json={"partnerCode": "PA-SOMECODE"},
            headers=admin_headers
        )
        assert resp.status_code == 404, f"Expected 404, got {resp.status_code}: {resp.text}"
        print(f"PASS: PUT login-code invalid partner → {resp.status_code}")

    def test_admin_update_login_code_unauthorized(self, partner_headers):
        """Non-admin should not be able to update partner code"""
        resp = requests.put(
            f"{BASE_URL}/api/admin/partners/{PARTNER_ID}/login-code",
            json={"partnerCode": "PA-HACK1234"},
            headers=partner_headers
        )
        assert resp.status_code in [401, 403], f"Expected 401/403, got {resp.status_code}: {resp.text}"
        print(f"PASS: PUT login-code by non-admin → {resp.status_code}")


# ── 4. Admin: Upload Partner Contract ─────────────────────────────────────

class TestAdminUploadContract:
    """Admin: upload partner contract"""

    def test_admin_upload_contract(self, admin_headers):
        """PUT /api/admin/partners/{id}/contract should update contract"""
        test_url = "https://example.com/test.pdf"
        test_name = "Contrat Test Partenaire"
        resp = requests.put(
            f"{BASE_URL}/api/admin/partners/{PARTNER_ID}/contract",
            json={"contractUrl": test_url, "contractName": test_name},
            headers=admin_headers
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data.get("success") is True, f"Expected success=true, got: {data}"
        print(f"PASS: PUT /api/admin/partners/{PARTNER_ID}/contract → {data}")

    def test_admin_upload_contract_persisted(self, admin_headers):
        """Verify contract update is persisted in the database"""
        test_url = "https://example.com/test.pdf"
        test_name = "Contrat Test Partenaire"

        # Upload
        put_resp = requests.put(
            f"{BASE_URL}/api/admin/partners/{PARTNER_ID}/contract",
            json={"contractUrl": test_url, "contractName": test_name},
            headers=admin_headers
        )
        assert put_resp.status_code == 200

        # Verify by listing partners
        list_resp = requests.get(f"{BASE_URL}/api/admin/partners", headers=admin_headers)
        assert list_resp.status_code == 200
        partners = list_resp.json()
        partner = next((p for p in partners if p["id"] == PARTNER_ID), None)
        assert partner is not None, "Partner not found in list"
        assert partner.get("contractUrl") == test_url, f"contractUrl not persisted: {partner.get('contractUrl')}"
        print(f"PASS: Contract persisted → contractUrl={partner.get('contractUrl')}")

    def test_admin_upload_contract_unauthorized(self, partner_headers):
        """Non-admin should not be able to upload contract"""
        resp = requests.put(
            f"{BASE_URL}/api/admin/partners/{PARTNER_ID}/contract",
            json={"contractUrl": "https://example.com/hack.pdf"},
            headers=partner_headers
        )
        assert resp.status_code in [401, 403], f"Expected 401/403, got {resp.status_code}: {resp.text}"
        print(f"PASS: PUT contract by non-admin → {resp.status_code}")

    def test_admin_upload_contract_invalid_partner(self, admin_headers):
        """PUT with invalid partner ID should return 404"""
        resp = requests.put(
            f"{BASE_URL}/api/admin/partners/invalid-nonexistent-id/contract",
            json={"contractUrl": "https://example.com/test.pdf"},
            headers=admin_headers
        )
        assert resp.status_code == 404, f"Expected 404, got {resp.status_code}: {resp.text}"
        print(f"PASS: PUT contract invalid partner → {resp.status_code}")


# ── 5. Admin Partners list includes partnerCode and contractUrl ─────────────

class TestAdminPartnersListFields:
    """Admin partners list should include partnerCode and contractUrl"""

    def test_admin_partners_list_includes_partnerCode(self, admin_headers):
        """GET /api/admin/partners should return partners with partnerCode field"""
        resp = requests.get(f"{BASE_URL}/api/admin/partners", headers=admin_headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        partners = resp.json()
        assert isinstance(partners, list), "Expected list of partners"
        assert len(partners) > 0, "Expected at least one partner"
        # Find the test partner
        partner = next((p for p in partners if p["id"] == PARTNER_ID), None)
        assert partner is not None, f"Test partner {PARTNER_ID} not found in list"
        assert "partnerCode" in partner, f"partnerCode not in partner object: {partner.keys()}"
        assert partner["partnerCode"] == PARTNER_ACTIVATION_CODE, f"Expected {PARTNER_ACTIVATION_CODE}, got {partner.get('partnerCode')}"
        print(f"PASS: GET /api/admin/partners includes partnerCode={partner.get('partnerCode')}")

    def test_admin_partners_list_excludes_password(self, admin_headers):
        """GET /api/admin/partners should NOT include password field"""
        resp = requests.get(f"{BASE_URL}/api/admin/partners", headers=admin_headers)
        assert resp.status_code == 200
        partners = resp.json()
        for p in partners:
            assert "password" not in p, f"Password field exposed for partner {p.get('id')}"
        print("PASS: passwords not exposed in partner list")
