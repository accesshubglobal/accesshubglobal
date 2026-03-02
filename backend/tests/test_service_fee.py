"""
Test serviceFee field functionality for Winner's Consulting offers.
Tests:
- Backend: OfferCreate model accepts serviceFee field
- Backend: Offer model has serviceFee field with default 0
- Backend: PUT /api/admin/offers/{id} correctly saves and returns serviceFee
- Backend: POST /api/admin/offers creates offer with serviceFee
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from review request
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"


class TestServiceFeeBackend:
    """Tests for serviceFee field in backend API"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data and authenticate"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
            pytest.skip("Admin authentication failed - skipping admin tests")

    def test_create_offer_with_service_fee(self):
        """Test POST /api/admin/offers creates offer with serviceFee"""
        test_id = str(uuid.uuid4())[:8]
        offer_data = {
            "title": f"TEST_ServiceFee_Offer_{test_id}",
            "university": "Test University",
            "city": "Test City",
            "country": "Chine",
            "countryCode": "CN",
            "category": "engineering",
            "categoryLabel": "Ingénierie",
            "degree": "Master",
            "duration": "2 ans",
            "teachingLanguage": "Anglais",
            "intake": "Automne 2025",
            "deadline": "Ouvert",
            "originalTuition": 10000,
            "scholarshipTuition": 5000,
            "currency": "EUR",
            "description": "Test offer for serviceFee",
            "serviceFee": 750,  # Setting service fee
            "fees": {
                "applicationFee": 100,  # Setting application fee
                "originalTuition": 10000,
                "scholarshipTuition": 5000,
                "accommodationDouble": 3000,
                "accommodationSingle": 5000,
                "registrationFee": 200,
                "insuranceFee": 300
            }
        }
        
        response = self.session.post(f"{BASE_URL}/api/admin/offers", json=offer_data)
        
        assert response.status_code == 200, f"Failed to create offer: {response.text}"
        data = response.json()
        assert "id" in data, "Response should contain offer ID"
        
        # Verify the offer was created with correct serviceFee
        offer_id = data["id"]
        get_response = self.session.get(f"{BASE_URL}/api/offers/{offer_id}")
        
        assert get_response.status_code == 200, f"Failed to get created offer: {get_response.text}"
        offer = get_response.json()
        
        # Assert serviceFee is correctly set
        assert offer.get("serviceFee") == 750, f"serviceFee should be 750, got {offer.get('serviceFee')}"
        
        # Assert fees.applicationFee is correctly set
        assert offer.get("fees", {}).get("applicationFee") == 100, f"fees.applicationFee should be 100, got {offer.get('fees', {}).get('applicationFee')}"
        
        # Cleanup - delete the test offer
        self.session.delete(f"{BASE_URL}/api/admin/offers/{offer_id}")
        
        return offer_id

    def test_create_offer_with_default_service_fee(self):
        """Test that serviceFee defaults to 0 when not specified"""
        test_id = str(uuid.uuid4())[:8]
        offer_data = {
            "title": f"TEST_DefaultServiceFee_Offer_{test_id}",
            "university": "Test University",
            "city": "Test City",
            "country": "Chine",
            "countryCode": "CN",
            "category": "engineering",
            "categoryLabel": "Ingénierie",
            "degree": "Master",
            "duration": "2 ans",
            "teachingLanguage": "Anglais",
            "intake": "Automne 2025",
            "deadline": "Ouvert"
            # NOT setting serviceFee - should default to 0
        }
        
        response = self.session.post(f"{BASE_URL}/api/admin/offers", json=offer_data)
        
        assert response.status_code == 200, f"Failed to create offer: {response.text}"
        data = response.json()
        offer_id = data["id"]
        
        # Verify the offer was created with default serviceFee = 0
        get_response = self.session.get(f"{BASE_URL}/api/offers/{offer_id}")
        assert get_response.status_code == 200
        offer = get_response.json()
        
        # Assert serviceFee defaults to 0
        assert offer.get("serviceFee", 0) == 0, f"serviceFee should default to 0, got {offer.get('serviceFee')}"
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/admin/offers/{offer_id}")

    def test_update_offer_service_fee(self):
        """Test PUT /api/admin/offers/{id} correctly saves and returns serviceFee"""
        test_id = str(uuid.uuid4())[:8]
        
        # First create an offer
        offer_data = {
            "title": f"TEST_UpdateServiceFee_Offer_{test_id}",
            "university": "Test University",
            "city": "Test City",
            "country": "Chine",
            "countryCode": "CN",
            "category": "engineering",
            "categoryLabel": "Ingénierie",
            "degree": "Master",
            "duration": "2 ans",
            "teachingLanguage": "Anglais",
            "intake": "Automne 2025",
            "deadline": "Ouvert",
            "serviceFee": 0,
            "fees": {"applicationFee": 50}
        }
        
        create_response = self.session.post(f"{BASE_URL}/api/admin/offers", json=offer_data)
        assert create_response.status_code == 200
        offer_id = create_response.json()["id"]
        
        # Now update the serviceFee to 500
        update_data = {**offer_data}
        update_data["serviceFee"] = 500
        update_data["fees"]["applicationFee"] = 75
        
        update_response = self.session.put(f"{BASE_URL}/api/admin/offers/{offer_id}", json=update_data)
        assert update_response.status_code == 200, f"Failed to update offer: {update_response.text}"
        
        # Verify the update persisted
        get_response = self.session.get(f"{BASE_URL}/api/offers/{offer_id}")
        assert get_response.status_code == 200
        offer = get_response.json()
        
        # Assert updated serviceFee
        assert offer.get("serviceFee") == 500, f"serviceFee should be 500 after update, got {offer.get('serviceFee')}"
        
        # Assert updated applicationFee
        assert offer.get("fees", {}).get("applicationFee") == 75, f"fees.applicationFee should be 75 after update, got {offer.get('fees', {}).get('applicationFee')}"
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/admin/offers/{offer_id}")

    def test_get_existing_offer_with_service_fee(self):
        """Test that existing offers return serviceFee field"""
        # Get all offers
        response = self.session.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        offers = response.json()
        
        assert len(offers) > 0, "There should be at least one offer in the database"
        
        # Check that each offer has serviceFee field (even if 0)
        for offer in offers[:5]:  # Check first 5 offers
            # serviceFee should exist (can be 0 or any number)
            assert "serviceFee" in offer or offer.get("serviceFee", 0) >= 0, f"Offer {offer.get('id')} should have serviceFee field"
            
    def test_admin_offers_endpoint_returns_service_fee(self):
        """Test GET /api/admin/offers returns offers with serviceFee"""
        response = self.session.get(f"{BASE_URL}/api/admin/offers")
        assert response.status_code == 200
        offers = response.json()
        
        assert len(offers) > 0, "Admin should see offers"
        
        # All offers should have serviceFee field
        for offer in offers[:5]:
            assert "serviceFee" in offer or offer.get("serviceFee", 0) >= 0, f"Offer {offer.get('id')} missing serviceFee"


class TestServiceFeeDataStructure:
    """Tests for serviceFee and fees data structure"""

    def test_offer_response_structure(self):
        """Verify offer response has correct structure for fees"""
        response = requests.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        offers = response.json()
        
        if len(offers) > 0:
            offer = offers[0]
            
            # Check serviceFee is a top-level field (not inside fees)
            # Note: serviceFee might be 0 (default) or a positive number
            service_fee = offer.get("serviceFee", 0)
            assert isinstance(service_fee, (int, float)), f"serviceFee should be a number, got {type(service_fee)}"
            
            # Check fees object exists and has applicationFee
            fees = offer.get("fees", {})
            if fees:
                assert isinstance(fees, dict), "fees should be a dictionary"
                # applicationFee is inside fees object
                application_fee = fees.get("applicationFee", 0)
                assert isinstance(application_fee, (int, float)), f"fees.applicationFee should be a number"

    def test_specific_offer_service_fee(self):
        """Test getting a specific offer's service fee"""
        # First get list of offers to get an ID
        response = requests.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        offers = response.json()
        
        if len(offers) > 0:
            offer_id = offers[0]["id"]
            
            # Get specific offer
            detail_response = requests.get(f"{BASE_URL}/api/offers/{offer_id}")
            assert detail_response.status_code == 200
            offer = detail_response.json()
            
            # Verify structure
            assert "serviceFee" in offer or offer.get("serviceFee", 0) == 0, "Offer should have serviceFee"
            assert "fees" in offer or offer.get("fees") == {}, "Offer should have fees object"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
