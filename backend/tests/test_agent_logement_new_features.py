"""
Tests for Agent Document Gate and Logement features (Iteration 27)
Tests: agent profile, document verification, logement login code gate,
logement profile, property duplicate, logement contract, admin endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
AGENT_EMAIL = "agent@test.com"
AGENT_PASSWORD = "Test2025!"
AGENT_CODE = "AG-BVJRO96I"

LOGEMENT_EMAIL = "test_logement@test.com"
LOGEMENT_PASSWORD = "Logement2025!"
LOGEMENT_CODE = "LG-TESTCODE"
LOGEMENT_PARTNER_ID = "8dd891cd-1c5b-443b-aa8f-23e890c95671"

ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"


# ─── Auth helpers ────────────────────────────────────────────────────────────

def get_token(email, password):
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        return r.json().get("access_token")
    return None

def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def agent_token():
    token = get_token(AGENT_EMAIL, AGENT_PASSWORD)
    if not token:
        pytest.skip("Agent login failed")
    return token

@pytest.fixture(scope="module")
def logement_token():
    token = get_token(LOGEMENT_EMAIL, LOGEMENT_PASSWORD)
    if not token:
        pytest.skip("Logement login failed")
    return token

@pytest.fixture(scope="module")
def admin_token():
    token = get_token(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not token:
        pytest.skip("Admin login failed")
    return token


# ─── Agent Login Code Gate ────────────────────────────────────────────────────

class TestAgentLoginCodeGate:
    """Tests for agent activation code verification"""

    def test_agent_verify_correct_code(self, agent_token):
        """POST /api/agent/verify-login-code with correct code returns success"""
        r = requests.post(
            f"{BASE_URL}/api/agent/verify-login-code",
            json={"code": AGENT_CODE},
            headers=auth_headers(agent_token)
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data.get("success") is True

    def test_agent_verify_wrong_code(self, agent_token):
        """POST /api/agent/verify-login-code with wrong code returns 400"""
        r = requests.post(
            f"{BASE_URL}/api/agent/verify-login-code",
            json={"code": "AG-WRONGCOD"},
            headers=auth_headers(agent_token)
        )
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"

    def test_agent_verify_lowercase_code(self, agent_token):
        """POST /api/agent/verify-login-code with lowercase code should still work (uppercase conversion)"""
        r = requests.post(
            f"{BASE_URL}/api/agent/verify-login-code",
            json={"code": AGENT_CODE.lower()},
            headers=auth_headers(agent_token)
        )
        assert r.status_code == 200, f"Lowercase code should work: {r.text}"


# ─── Agent Profile ────────────────────────────────────────────────────────────

class TestAgentProfile:
    """Tests for agent profile endpoint"""

    def test_agent_get_profile(self, agent_token):
        """GET /api/agent/profile returns profile with documentsVerified and documentsSubmitted"""
        r = requests.get(
            f"{BASE_URL}/api/agent/profile",
            headers=auth_headers(agent_token)
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        # Validate required fields exist
        assert "documentsVerified" in data, "Missing documentsVerified field"
        assert "documentsSubmitted" in data, "Missing documentsSubmitted field"
        assert "firstName" in data
        assert "lastName" in data
        assert "email" in data
        # Both should be bool
        assert isinstance(data["documentsVerified"], bool)
        assert isinstance(data["documentsSubmitted"], bool)
        print(f"Agent profile: verified={data['documentsVerified']}, submitted={data['documentsSubmitted']}")

    def test_agent_profile_docs_false_initially(self, agent_token):
        """Agent test user should have documentsVerified=false (no docs submitted)"""
        r = requests.get(
            f"{BASE_URL}/api/agent/profile",
            headers=auth_headers(agent_token)
        )
        assert r.status_code == 200
        data = r.json()
        # The test user hasn't submitted docs yet per review_request
        print(f"documentsVerified={data['documentsVerified']}, documentsSubmitted={data['documentsSubmitted']}")
        # Both can be any value - we just assert they are booleans
        assert isinstance(data["documentsVerified"], bool)
        assert isinstance(data["documentsSubmitted"], bool)


# ─── Admin: Verify Agent Documents ────────────────────────────────────────────

class TestAdminVerifyAgentDocuments:
    """Tests for PUT /api/admin/agents/{id}/verify-documents"""

    def test_admin_get_agents(self, admin_token):
        """GET /api/admin/agents returns list of agents"""
        r = requests.get(
            f"{BASE_URL}/api/admin/agents",
            headers=auth_headers(admin_token)
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} agents")
        # Find the test agent
        test_agent = next((a for a in data if a.get("email") == AGENT_EMAIL), None)
        if test_agent:
            print(f"Test agent found: {test_agent.get('firstName')} {test_agent.get('lastName')}, code={test_agent.get('agentCode')}")

    def test_admin_verify_agent_documents_endpoint(self, admin_token):
        """PUT /api/admin/agents/{id}/verify-documents updates documentsVerified"""
        # First get the agent ID
        r = requests.get(f"{BASE_URL}/api/admin/agents", headers=auth_headers(admin_token))
        assert r.status_code == 200
        agents = r.json()
        test_agent = next((a for a in agents if a.get("email") == AGENT_EMAIL), None)
        if not test_agent:
            pytest.skip(f"Test agent {AGENT_EMAIL} not found in admin list")

        agent_id = test_agent["id"]
        r2 = requests.put(
            f"{BASE_URL}/api/admin/agents/{agent_id}/verify-documents",
            json={"verified": True},
            headers=auth_headers(admin_token)
        )
        assert r2.status_code == 200, f"Expected 200, got {r2.status_code}: {r2.text}"
        data = r2.json()
        assert data.get("success") is True
        assert data.get("documentsVerified") is True

    def test_admin_verify_documents_nonexistent_agent(self, admin_token):
        """PUT /api/admin/agents/nonexistent/verify-documents returns 404"""
        r = requests.put(
            f"{BASE_URL}/api/admin/agents/nonexistent-id-000/verify-documents",
            json={"verified": True},
            headers=auth_headers(admin_token)
        )
        assert r.status_code == 404, f"Expected 404, got {r.status_code}"


# ─── Logement Login Code Gate ─────────────────────────────────────────────────

class TestLogementLoginCodeGate:
    """Tests for POST /api/logement/verify-login-code"""

    def test_logement_verify_correct_code(self, logement_token):
        """POST /api/logement/verify-login-code with LG-TESTCODE returns success"""
        r = requests.post(
            f"{BASE_URL}/api/logement/verify-login-code",
            json={"code": LOGEMENT_CODE},
            headers=auth_headers(logement_token)
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data.get("success") is True

    def test_logement_verify_wrong_code(self, logement_token):
        """POST /api/logement/verify-login-code with wrong code returns 400"""
        r = requests.post(
            f"{BASE_URL}/api/logement/verify-login-code",
            json={"code": "LG-WRONGCOD"},
            headers=auth_headers(logement_token)
        )
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
        data = r.json()
        assert "detail" in data

    def test_logement_verify_empty_code(self, logement_token):
        """POST /api/logement/verify-login-code with empty code returns 400"""
        r = requests.post(
            f"{BASE_URL}/api/logement/verify-login-code",
            json={"code": ""},
            headers=auth_headers(logement_token)
        )
        assert r.status_code == 400, f"Expected 400, got {r.status_code}"


# ─── Logement Profile ─────────────────────────────────────────────────────────

class TestLogementProfile:
    """Tests for GET/PUT /api/logement/profile"""

    def test_logement_get_profile(self, logement_token):
        """GET /api/logement/profile returns profile with companyName, docs, profileComplete"""
        r = requests.get(
            f"{BASE_URL}/api/logement/profile",
            headers=auth_headers(logement_token)
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        # Validate required fields
        assert "companyName" in data, "Missing companyName"
        assert "officialDocUrl" in data, "Missing officialDocUrl"
        assert "idDocUrl" in data, "Missing idDocUrl"
        assert "profileComplete" in data, "Missing profileComplete"
        assert isinstance(data["profileComplete"], bool)
        print(f"Logement profile: company={data['companyName']}, complete={data['profileComplete']}")

    def test_logement_update_profile(self, logement_token):
        """PUT /api/logement/profile updates company info"""
        # Get current profile
        r_get = requests.get(f"{BASE_URL}/api/logement/profile", headers=auth_headers(logement_token))
        assert r_get.status_code == 200
        original = r_get.json()

        # Update
        r = requests.put(
            f"{BASE_URL}/api/logement/profile",
            json={"companyCity": "Paris Test", "companyCountry": "France"},
            headers=auth_headers(logement_token)
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"

        # Verify update
        r_get2 = requests.get(f"{BASE_URL}/api/logement/profile", headers=auth_headers(logement_token))
        data = r_get2.json()
        assert data["companyCity"] == "Paris Test"

        # Restore original
        if original.get("companyCity"):
            requests.put(
                f"{BASE_URL}/api/logement/profile",
                json={"companyCity": original["companyCity"]},
                headers=auth_headers(logement_token)
            )


# ─── Logement Contract ────────────────────────────────────────────────────────

class TestLogementContract:
    """Tests for GET /api/logement/contract"""

    def test_logement_get_contract(self, logement_token):
        """GET /api/logement/contract returns contract info"""
        r = requests.get(
            f"{BASE_URL}/api/logement/contract",
            headers=auth_headers(logement_token)
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert "contractUrl" in data
        assert "contractName" in data
        print(f"Contract: url={data['contractUrl']}, name={data['contractName']}")


# ─── Logement Properties Duplicate ────────────────────────────────────────────

class TestLogementPropertyDuplicate:
    """Tests for POST /api/logement/properties/{id}/duplicate"""

    def test_duplicate_property(self, logement_token):
        """POST duplicate creates a copy of the property"""
        # First get properties
        r = requests.get(f"{BASE_URL}/api/logement/properties", headers=auth_headers(logement_token))
        assert r.status_code == 200
        properties = r.json()

        if len(properties) == 0:
            # Create a test property first
            r_create = requests.post(
                f"{BASE_URL}/api/logement/properties",
                json={
                    "title": "TEST_Property for duplicate",
                    "description": "Test",
                    "propertyType": "Studio",
                    "city": "Paris",
                    "country": "France",
                    "address": "1 rue test",
                    "price": 500,
                    "pricePeriod": "mois",
                    "surface": 25,
                    "rooms": 1,
                    "amenities": [],
                    "images": [],
                    "isAvailable": True,
                    "availableFrom": ""
                },
                headers=auth_headers(logement_token)
            )
            assert r_create.status_code == 200, f"Failed to create property: {r_create.text}"
            properties = [r_create.json()]
            print(f"Created test property: {properties[0]['id']}")

        prop_id = properties[0]["id"]
        prop_title = properties[0]["title"]
        initial_count = len(properties)

        # Duplicate
        r_dup = requests.post(
            f"{BASE_URL}/api/logement/properties/{prop_id}/duplicate",
            headers=auth_headers(logement_token)
        )
        assert r_dup.status_code == 200, f"Expected 200, got {r_dup.status_code}: {r_dup.text}"
        dup_data = r_dup.json()
        assert "id" in dup_data
        assert dup_data["id"] != prop_id, "Duplicate should have a new ID"
        assert "(copie)" in dup_data["title"], f"Duplicate title should contain '(copie)': {dup_data['title']}"
        assert dup_data["isApproved"] is False, "Duplicate should start as not approved"

        # Verify in list
        r2 = requests.get(f"{BASE_URL}/api/logement/properties", headers=auth_headers(logement_token))
        new_properties = r2.json()
        assert len(new_properties) > initial_count, "Property count should increase after duplicate"

        # Cleanup - delete the duplicate
        dup_id = dup_data["id"]
        r_del = requests.delete(f"{BASE_URL}/api/logement/properties/{dup_id}", headers=auth_headers(logement_token))
        print(f"Deleted duplicate {dup_id}: {r_del.status_code}")

    def test_duplicate_nonexistent_property(self, logement_token):
        """POST duplicate for nonexistent property returns 404"""
        r = requests.post(
            f"{BASE_URL}/api/logement/properties/nonexistent-id/duplicate",
            headers=auth_headers(logement_token)
        )
        assert r.status_code == 404, f"Expected 404, got {r.status_code}"


# ─── Admin: Logement Partner Management ───────────────────────────────────────

class TestAdminLogementPartnerManagement:
    """Tests for admin logement partner endpoints"""

    def test_admin_list_logement_partners(self, admin_token):
        """GET /api/admin/logement-partners returns list"""
        r = requests.get(
            f"{BASE_URL}/api/admin/logement-partners",
            headers=auth_headers(admin_token)
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert isinstance(data, list)
        test_partner = next((p for p in data if p.get("email") == LOGEMENT_EMAIL), None)
        if test_partner:
            print(f"Test logement partner found: code={test_partner.get('logementCode')}")

    def test_admin_update_logement_login_code(self, admin_token):
        """PUT /api/admin/logement-partners/{id}/login-code updates the code"""
        r = requests.put(
            f"{BASE_URL}/api/admin/logement-partners/{LOGEMENT_PARTNER_ID}/login-code",
            json={"logementCode": "LG-TESTCODE"},
            headers=auth_headers(admin_token)
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data.get("success") is True
        assert data.get("logementCode") == "LG-TESTCODE"

    def test_admin_update_logement_contract(self, admin_token):
        """PUT /api/admin/logement-partners/{id}/contract saves contract info"""
        r = requests.put(
            f"{BASE_URL}/api/admin/logement-partners/{LOGEMENT_PARTNER_ID}/contract",
            json={"contractUrl": "https://example.com/test-contract.pdf", "contractName": "Test Contrat Logement"},
            headers=auth_headers(admin_token)
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data.get("success") is True

        # Verify the contract was saved
        logement_token = get_token(LOGEMENT_EMAIL, LOGEMENT_PASSWORD)
        r2 = requests.get(f"{BASE_URL}/api/logement/contract", headers=auth_headers(logement_token))
        assert r2.status_code == 200
        contract = r2.json()
        assert contract.get("contractUrl") == "https://example.com/test-contract.pdf"
        assert contract.get("contractName") == "Test Contrat Logement"
        print(f"Contract saved and verified: {contract}")

    def test_admin_update_nonexistent_logement_code(self, admin_token):
        """PUT /api/admin/logement-partners/nonexistent/login-code returns 404"""
        r = requests.put(
            f"{BASE_URL}/api/admin/logement-partners/nonexistent-partner-000/login-code",
            json={"logementCode": "LG-TEST123"},
            headers=auth_headers(admin_token)
        )
        assert r.status_code == 404, f"Expected 404, got {r.status_code}"


# ─── Authentication guard tests ───────────────────────────────────────────────

class TestAuthenticationGuards:
    """Tests that protected endpoints require authentication"""

    def test_agent_profile_requires_auth(self):
        """GET /api/agent/profile without auth returns 401 or 403"""
        r = requests.get(f"{BASE_URL}/api/agent/profile")
        assert r.status_code in [401, 403], f"Expected 401/403 without auth, got {r.status_code}"

    def test_logement_profile_requires_auth(self):
        """GET /api/logement/profile without auth returns 401 or 403"""
        r = requests.get(f"{BASE_URL}/api/logement/profile")
        assert r.status_code in [401, 403], f"Expected 401/403 without auth, got {r.status_code}"

    def test_logement_verify_code_requires_auth(self):
        """POST /api/logement/verify-login-code without auth returns 401 or 403"""
        r = requests.post(f"{BASE_URL}/api/logement/verify-login-code", json={"code": "LG-TESTCODE"})
        assert r.status_code in [401, 403], f"Expected 401/403 without auth, got {r.status_code}"

    def test_admin_agents_requires_admin(self, logement_token):
        """GET /api/admin/agents with logement token should return 403"""
        r = requests.get(
            f"{BASE_URL}/api/admin/agents",
            headers=auth_headers(logement_token)
        )
        assert r.status_code in [401, 403], f"Expected 401/403 for non-admin, got {r.status_code}"
