"""
Backend tests for AccessHub Global - Logement flows + core auth
Tests: logement API, companies-showcase, auth for all roles
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ─── Credentials ─────────────────────────────────────────────────────────────
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASS = "Admin2025!"
LOGEMENT_EMAIL = "test_logement@test.com"
LOGEMENT_PASS = "Logement2025!"
EMPLOYER_EMAIL = "test_employer_auto@test.com"
EMPLOYER_PASS = "Employer2025!"
AGENT_EMAIL = "agent@test.com"
AGENT_PASS = "Test2025!"
PARTNER_EMAIL = "partner@test.com"
PARTNER_PASS = "Partner2025!"


def login(email, password):
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": email, "password": password},
                      timeout=10)
    return r


def auth_header(email, password):
    r = login(email, password)
    if r.status_code == 200:
        data = r.json()
        token = data.get("access_token") or data.get("token")
        if token:
            return {"Authorization": f"Bearer {token}"}
    return {}


# ─── Health Check ────────────────────────────────────────────────────────────
class TestHealthAndPublic:
    """Public endpoints must return 200"""

    def test_companies_showcase_public(self):
        r = requests.get(f"{BASE_URL}/api/companies-showcase", timeout=10)
        assert r.status_code == 200
        data = r.json()
        # Should have main, others, employers keys
        assert "employers" in data or "main" in data, f"Unexpected shape: {data}"

    def test_job_offers_public(self):
        r = requests.get(f"{BASE_URL}/api/job-offers", timeout=10)
        assert r.status_code == 200

    def test_offers_public(self):
        r = requests.get(f"{BASE_URL}/api/offers", timeout=10)
        assert r.status_code == 200


# ─── Auth / Login flows ───────────────────────────────────────────────────────
class TestAuthFlows:
    """Login must succeed for all roles"""

    def test_admin_login(self):
        r = login(ADMIN_EMAIL, ADMIN_PASS)
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data or "token" in data
        assert data.get("user", {}).get("role") in ("admin", "admin_principal")

    def test_logement_login(self):
        r = login(LOGEMENT_EMAIL, LOGEMENT_PASS)
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data or "token" in data
        assert data.get("user", {}).get("role") == "partenaire_logement"

    def test_employer_login(self):
        r = login(EMPLOYER_EMAIL, EMPLOYER_PASS)
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data or "token" in data
        assert data.get("user", {}).get("role") == "employeur"

    def test_agent_login(self):
        r = login(AGENT_EMAIL, AGENT_PASS)
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data or "token" in data
        assert data.get("user", {}).get("role") == "agent"

    def test_partner_login(self):
        r = login(PARTNER_EMAIL, PARTNER_PASS)
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data or "token" in data
        # partenaire or similar
        role = data.get("user", {}).get("role", "")
        assert "partenaire" in role or role == "partner"

    def test_invalid_login_returns_401(self):
        r = login("nobody@test.com", "wrongpass")
        assert r.status_code == 401


# ─── Logement Partner APIs ────────────────────────────────────────────────────
class TestLogementAPIs:
    """Logement partner: stats, properties CRUD"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = auth_header(LOGEMENT_EMAIL, LOGEMENT_PASS)
        if not self.headers:
            pytest.skip("Could not authenticate as logement partner")

    def test_logement_stats(self):
        r = requests.get(f"{BASE_URL}/api/logement/stats", headers=self.headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "total" in data
        assert "approved" in data
        assert "pending" in data
        assert "available" in data

    def test_logement_properties_list(self):
        r = requests.get(f"{BASE_URL}/api/logement/properties", headers=self.headers, timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_logement_property_create_and_delete(self):
        """Create a property then delete it"""
        payload = {
            "title": "TEST_Studio Paris Centre",
            "description": "Test property",
            "propertyType": "Studio",
            "city": "Paris",
            "country": "France",
            "address": "10 Rue de Rivoli",
            "price": 750.0,
            "pricePeriod": "mois",
            "surface": 20,
            "rooms": 1,
            "amenities": ["WiFi"],
            "images": [],
            "availableFrom": "2026-06-01",
            "isAvailable": True,
        }
        r = requests.post(f"{BASE_URL}/api/logement/properties",
                          json=payload, headers=self.headers, timeout=10)
        assert r.status_code == 200
        created = r.json()
        assert "id" in created
        assert created["title"] == "TEST_Studio Paris Centre"

        # Verify it appears in list
        list_r = requests.get(f"{BASE_URL}/api/logement/properties",
                               headers=self.headers, timeout=10)
        ids = [p["id"] for p in list_r.json()]
        assert created["id"] in ids

        # Delete
        del_r = requests.delete(f"{BASE_URL}/api/logement/properties/{created['id']}",
                                headers=self.headers, timeout=10)
        assert del_r.status_code == 200

        # Confirm deleted
        list_r2 = requests.get(f"{BASE_URL}/api/logement/properties",
                                headers=self.headers, timeout=10)
        ids2 = [p["id"] for p in list_r2.json()]
        assert created["id"] not in ids2

    def test_logement_stats_unauthenticated(self):
        """Stats should require auth"""
        r = requests.get(f"{BASE_URL}/api/logement/stats", timeout=10)
        assert r.status_code in (401, 403)


# ─── Admin Logement APIs ──────────────────────────────────────────────────────
class TestAdminLogementAPIs:
    """Admin: manage logement partners and properties"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = auth_header(ADMIN_EMAIL, ADMIN_PASS)
        if not self.headers:
            pytest.skip("Could not authenticate as admin")

    def test_admin_list_logement_partners(self):
        r = requests.get(f"{BASE_URL}/api/admin/logement-partners",
                         headers=self.headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # test_logement@test.com should be there
        emails = [p.get("email") for p in data]
        assert LOGEMENT_EMAIL in emails, f"test_logement@test.com not found in {emails}"

    def test_admin_list_logement_properties(self):
        r = requests.get(f"{BASE_URL}/api/admin/logement-properties",
                         headers=self.headers, timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_logement_protected_from_partner(self):
        """Regular logement user cannot access admin logement endpoints"""
        logement_headers = auth_header(LOGEMENT_EMAIL, LOGEMENT_PASS)
        r = requests.get(f"{BASE_URL}/api/admin/logement-partners",
                         headers=logement_headers, timeout=10)
        assert r.status_code in (401, 403)


# ─── Employer APIs ────────────────────────────────────────────────────────────
class TestEmployerAPIs:
    """Employer stats endpoint"""

    def test_employer_stats(self):
        headers = auth_header(EMPLOYER_EMAIL, EMPLOYER_PASS)
        if not headers:
            pytest.skip("Cannot authenticate employer")
        r = requests.get(f"{BASE_URL}/api/employer/stats",
                         headers=headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        # Expect some stats keys
        assert isinstance(data, dict)


# ─── Public Housing ───────────────────────────────────────────────────────────
class TestPublicHousing:
    def test_housing_partner_public(self):
        r = requests.get(f"{BASE_URL}/api/housing-partner", timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
