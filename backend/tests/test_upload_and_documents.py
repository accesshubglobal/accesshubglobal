"""
Test suite for upload signature endpoint and offer documents
Tests the bug fixes for:
1. Documents list not showing in ApplicationModal Step 2
2. File upload via Cloudinary signature endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://dashboard-live-6.preview.emergentagent.com')

# Test credentials
TEST_USER_EMAIL = "etudiant@test.com"
TEST_USER_PASSWORD = "Test1234!"


class TestUploadSignatureEndpoint:
    """Tests for GET /api/upload/signature endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for test user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_upload_signature_returns_required_fields(self, auth_token):
        """Test that /api/upload/signature returns all required Cloudinary fields"""
        response = requests.get(
            f"{BASE_URL}/api/upload/signature",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions - validate response structure
        data = response.json()
        
        # Required fields for Cloudinary signed upload
        assert "signature" in data, "Missing 'signature' field"
        assert "timestamp" in data, "Missing 'timestamp' field"
        assert "cloud_name" in data, "Missing 'cloud_name' field"
        assert "api_key" in data, "Missing 'api_key' field"
        assert "folder" in data, "Missing 'folder' field"
        
        # Validate field types
        assert isinstance(data["signature"], str), "signature should be a string"
        assert isinstance(data["timestamp"], int), "timestamp should be an integer"
        assert isinstance(data["cloud_name"], str), "cloud_name should be a string"
        assert isinstance(data["api_key"], str), "api_key should be a string"
        assert isinstance(data["folder"], str), "folder should be a string"
        
        # Validate non-empty values
        assert len(data["signature"]) > 0, "signature should not be empty"
        assert data["timestamp"] > 0, "timestamp should be positive"
        assert len(data["cloud_name"]) > 0, "cloud_name should not be empty"
        assert len(data["api_key"]) > 0, "api_key should not be empty"
        
        print(f"SUCCESS: Upload signature endpoint returned all required fields")
        print(f"  - cloud_name: {data['cloud_name']}")
        print(f"  - folder: {data['folder']}")
    
    def test_upload_signature_requires_auth(self):
        """Test that /api/upload/signature requires authentication"""
        response = requests.get(f"{BASE_URL}/api/upload/signature")
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("SUCCESS: Upload signature endpoint requires authentication")


class TestOfferDocuments:
    """Tests for offer documents field - verifies bug fix for documents list"""
    
    def test_cours_langue_chinoise_has_documents(self):
        """Test that 'Cours de Langue Chinoise' offer has documents field"""
        response = requests.get(f"{BASE_URL}/api/offers")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        offers = response.json()
        
        # Find the specific offer
        cours_chinois = None
        for offer in offers:
            if offer.get("title") == "Cours de Langue Chinoise":
                cours_chinois = offer
                break
        
        assert cours_chinois is not None, "Cours de Langue Chinoise offer not found"
        
        # Verify documents field exists and has expected values
        documents = cours_chinois.get("documents", [])
        assert len(documents) > 0, "documents field should not be empty"
        
        # Expected documents for this offer
        expected_docs = ["Passeport", "Diplôme le plus élevé", "Certificat médical"]
        
        for doc in expected_docs:
            assert doc in documents, f"Expected document '{doc}' not found in documents list"
        
        print(f"SUCCESS: Cours de Langue Chinoise has correct documents: {documents}")
    
    def test_offer_detail_includes_documents(self):
        """Test that individual offer detail includes documents field"""
        # First get the offer ID
        response = requests.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        
        offers = response.json()
        cours_chinois = next((o for o in offers if o.get("title") == "Cours de Langue Chinoise"), None)
        assert cours_chinois is not None
        
        offer_id = cours_chinois.get("id")
        
        # Get individual offer detail
        detail_response = requests.get(f"{BASE_URL}/api/offers/{offer_id}")
        assert detail_response.status_code == 200
        
        offer_detail = detail_response.json()
        
        # Verify documents field in detail view
        documents = offer_detail.get("documents", [])
        assert len(documents) > 0, "documents field should not be empty in offer detail"
        assert "Passeport" in documents, "Passeport should be in documents"
        
        print(f"SUCCESS: Offer detail includes documents: {documents}")


class TestBackendUploadEndpoint:
    """Tests for POST /api/upload endpoint (fallback upload)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for test user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_upload_endpoint_requires_auth(self):
        """Test that /api/upload requires authentication"""
        # Create a simple test file
        files = {"file": ("test.txt", b"test content", "text/plain")}
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("SUCCESS: Upload endpoint requires authentication")
    
    def test_upload_endpoint_accepts_file(self, auth_token):
        """Test that /api/upload accepts file upload with auth"""
        files = {"file": ("test_document.txt", b"Test document content for upload", "text/plain")}
        response = requests.post(
            f"{BASE_URL}/api/upload",
            files=files,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Should return 200 with URL
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "url" in data, "Response should contain 'url' field"
        assert len(data["url"]) > 0, "URL should not be empty"
        
        print(f"SUCCESS: File uploaded successfully, URL: {data['url'][:50]}...")


class TestPaymentSettings:
    """Tests for payment settings endpoint"""
    
    def test_payment_settings_public_endpoint(self):
        """Test that /api/payment-settings is accessible without auth"""
        response = requests.get(f"{BASE_URL}/api/payment-settings")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify required fields for payment
        assert "applicationFee" in data, "Missing applicationFee"
        assert "currency" in data, "Missing currency"
        
        print(f"SUCCESS: Payment settings accessible - Fee: {data['applicationFee']} {data['currency']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
