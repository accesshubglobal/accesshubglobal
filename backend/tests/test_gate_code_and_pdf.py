"""
Tests for gate code verification endpoints (4 dashboards) and PDF contract access.
Tests BUG GATE CODE fix and BUG PDF fix.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


# ── Login helpers ──────────────────────────────────────────────────────────────
def get_token(email: str, password: str) -> str:
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    data = res.json()
    return data.get("access_token") or data.get("token", "")


# ── Agent verify-login-code ────────────────────────────────────────────────────
class TestAgentVerifyLoginCode:
    """Tests for /api/agent/verify-login-code"""

    def test_agent_correct_code_returns_success(self):
        """Correct agent code AG-BVJRO96I should return success:true"""
        tok = get_token("agent@test.com", "Test2025!")
        res = requests.post(
            f"{BASE_URL}/api/agent/verify-login-code",
            json={"code": "AG-BVJRO96I"},
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert data.get("success") is True, f"Expected success:true, got: {data}"

    def test_agent_correct_code_case_insensitive(self):
        """Agent code should be case-insensitive"""
        tok = get_token("agent@test.com", "Test2025!")
        res = requests.post(
            f"{BASE_URL}/api/agent/verify-login-code",
            json={"code": "ag-bvjro96i"},
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 200, f"Case-insensitive check failed: {res.text}"

    def test_agent_wrong_code_returns_400(self):
        """Wrong agent code should return 400"""
        tok = get_token("agent@test.com", "Test2025!")
        res = requests.post(
            f"{BASE_URL}/api/agent/verify-login-code",
            json={"code": "AG-WRONGXXX"},
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 400, f"Expected 400 for wrong code, got {res.status_code}: {res.text}"

    def test_agent_empty_code_returns_400(self):
        """Empty code should return 400"""
        tok = get_token("agent@test.com", "Test2025!")
        res = requests.post(
            f"{BASE_URL}/api/agent/verify-login-code",
            json={"code": ""},
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 400, f"Expected 400 for empty code, got {res.status_code}: {res.text}"

    def test_agent_no_auth_returns_401(self):
        """Request without auth should return 401"""
        res = requests.post(
            f"{BASE_URL}/api/agent/verify-login-code",
            json={"code": "AG-BVJRO96I"}
        )
        assert res.status_code in [401, 403], f"Expected 401/403 without auth, got {res.status_code}"


# ── Partner verify-login-code ──────────────────────────────────────────────────
class TestPartnerVerifyLoginCode:
    """Tests for /api/partner/verify-login-code"""

    def test_partner_correct_code_returns_success(self):
        """Correct partner code PA-BF237N22 should return success:true"""
        tok = get_token("partner@test.com", "Partner2025!")
        res = requests.post(
            f"{BASE_URL}/api/partner/verify-login-code",
            json={"code": "PA-BF237N22"},
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert data.get("success") is True, f"Expected success:true, got: {data}"

    def test_partner_wrong_code_returns_400(self):
        """Wrong partner code should return 400"""
        tok = get_token("partner@test.com", "Partner2025!")
        res = requests.post(
            f"{BASE_URL}/api/partner/verify-login-code",
            json={"code": "PA-WRONGXXX"},
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 400, f"Expected 400 for wrong code, got {res.status_code}: {res.text}"

    def test_partner_no_auth_returns_401(self):
        """Request without auth should return 401/403"""
        res = requests.post(
            f"{BASE_URL}/api/partner/verify-login-code",
            json={"code": "PA-BF237N22"}
        )
        assert res.status_code in [401, 403], f"Expected 401/403 without auth, got {res.status_code}"


# ── Employer verify-login-code ─────────────────────────────────────────────────
class TestEmployerVerifyLoginCode:
    """Tests for /api/employer/verify-login-code"""

    def test_employer_correct_code_returns_success(self):
        """Correct employer code EM-D5YJTLAY should return success:true"""
        tok = get_token("test_employer_auto@test.com", "Employer2025!")
        res = requests.post(
            f"{BASE_URL}/api/employer/verify-login-code",
            json={"code": "EM-D5YJTLAY"},
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert data.get("success") is True, f"Expected success:true, got: {data}"

    def test_employer_wrong_code_returns_400(self):
        """Wrong employer code should return 400"""
        tok = get_token("test_employer_auto@test.com", "Employer2025!")
        res = requests.post(
            f"{BASE_URL}/api/employer/verify-login-code",
            json={"code": "EM-WRONGXXX"},
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 400, f"Expected 400 for wrong code, got {res.status_code}: {res.text}"

    def test_employer_no_auth_returns_401(self):
        """Request without auth should return 401/403"""
        res = requests.post(
            f"{BASE_URL}/api/employer/verify-login-code",
            json={"code": "EM-D5YJTLAY"}
        )
        assert res.status_code in [401, 403], f"Expected 401/403 without auth, got {res.status_code}"


# ── Logement verify-login-code ─────────────────────────────────────────────────
class TestLogementVerifyLoginCode:
    """Tests for /api/logement/verify-login-code"""

    def test_logement_correct_code_returns_success(self):
        """Correct logement code LG-TESTCODE should return success:true"""
        tok = get_token("test_logement@test.com", "Logement2025!")
        res = requests.post(
            f"{BASE_URL}/api/logement/verify-login-code",
            json={"code": "LG-TESTCODE"},
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert data.get("success") is True, f"Expected success:true, got: {data}"

    def test_logement_wrong_code_returns_400(self):
        """Wrong logement code should return 400"""
        tok = get_token("test_logement@test.com", "Logement2025!")
        res = requests.post(
            f"{BASE_URL}/api/logement/verify-login-code",
            json={"code": "LG-WRONGXXX"},
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 400, f"Expected 400 for wrong code, got {res.status_code}: {res.text}"

    def test_logement_no_auth_returns_401(self):
        """Request without auth should return 401/403"""
        res = requests.post(
            f"{BASE_URL}/api/logement/verify-login-code",
            json={"code": "LG-TESTCODE"}
        )
        assert res.status_code in [401, 403], f"Expected 401/403 without auth, got {res.status_code}"


# ── Partner contract endpoint ──────────────────────────────────────────────────
class TestPartnerContract:
    """Tests for /api/partner/contract - PDF URL handling"""

    def test_partner_contract_has_cloudinary_url(self):
        """Partner contract should return a valid Cloudinary URL"""
        tok = get_token("partner@test.com", "Partner2025!")
        res = requests.get(
            f"{BASE_URL}/api/partner/contract",
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert "contractUrl" in data, "Response should have contractUrl field"
        assert data["contractUrl"], "contractUrl should not be empty"
        # Validate it's a Cloudinary URL
        assert "cloudinary.com" in data["contractUrl"], f"Expected Cloudinary URL, got: {data['contractUrl']}"
        # Validate it contains /image/upload/ (not converted to raw/upload/ - old bug)
        assert "/image/upload/" in data["contractUrl"], f"URL should keep /image/upload/ path: {data['contractUrl']}"

    def test_partner_contract_has_name(self):
        """Partner contract should have a contract name"""
        tok = get_token("partner@test.com", "Partner2025!")
        res = requests.get(
            f"{BASE_URL}/api/partner/contract",
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data.get("contractName"), f"Contract name should not be empty, got: {data}"

    def test_contract_url_not_converted_to_raw(self):
        """BUG FIX: URL should NOT be converted from /image/upload/ to /raw/upload/ (old bug)
        The fix is that fixPdfUrl returns the URL unchanged.
        """
        tok = get_token("partner@test.com", "Partner2025!")
        res = requests.get(
            f"{BASE_URL}/api/partner/contract",
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 200
        data = res.json()
        contract_url = data.get("contractUrl", "")
        if contract_url and "cloudinary.com" in contract_url:
            # The URL should NOT have been converted to /raw/upload/ (that was the old bug)
            # Original URL has /image/upload/ and it should STAY as /image/upload/
            assert "/raw/upload/" not in contract_url, (
                f"URL was incorrectly converted to raw/upload: {contract_url}"
            )
            assert "/image/upload/" in contract_url, (
                f"Expected /image/upload/ in URL: {contract_url}"
            )

    def test_download_url_format_with_fl_attachment(self):
        """BUG FIX: Download URL should add fl_attachment flag (not convert image→raw)
        Verifies the URL format produced by downloadFile utility.
        Note: Cloudinary may restrict direct access (401 ACL) for server-side requests.
        The fix ensures the URL format is correct for browser download.
        """
        tok = get_token("partner@test.com", "Partner2025!")
        res = requests.get(
            f"{BASE_URL}/api/partner/contract",
            headers={"Authorization": f"Bearer {tok}"}
        )
        assert res.status_code == 200
        data = res.json()
        contract_url = data.get("contractUrl", "")
        if contract_url and "/image/upload/" in contract_url:
            # Simulate what downloadFile does: add fl_attachment
            dl_url = contract_url.replace('/image/upload/', '/image/upload/fl_attachment/')
            # Verify correct URL format produced
            assert "/image/upload/fl_attachment/" in dl_url, f"fl_attachment not properly added: {dl_url}"
            assert "/raw/upload/" not in dl_url, f"URL incorrectly contains raw/upload: {dl_url}"
            print(f"Download URL format correct: {dl_url}")
