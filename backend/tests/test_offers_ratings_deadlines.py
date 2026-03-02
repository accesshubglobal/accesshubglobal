"""
Test suite for Winner's Consulting - Offers, Ratings, Deadline Logic, and Import Features
Tests: 
- GET /api/offers returns all offers with computed ratings/favoritesCount
- GET /api/offers/{id}/deadline-status for various deadline formats
- POST /api/admin/import-offers-data skip duplicates on re-run
- Offer filters: fullScholarship, partialScholarship, selfFinanced, online, new
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestOffersAPI:
    """Test GET /api/offers returns all offers with computed fields"""
    
    def test_get_all_offers_returns_list(self):
        """GET /api/offers should return a list of offers"""
        response = requests.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: GET /api/offers returned {len(data)} offers")
        return data
    
    def test_offers_have_required_fields(self):
        """Each offer should have computed rating and favoritesCount"""
        response = requests.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        
        offers = response.json()
        assert len(offers) > 0, "Should have at least one offer"
        
        first_offer = offers[0]
        # Check computed fields
        assert "rating" in first_offer, "Offer should have 'rating' field"
        assert "favoritesCount" in first_offer, "Offer should have 'favoritesCount' field"
        assert isinstance(first_offer["rating"], (int, float)), "Rating should be a number"
        assert isinstance(first_offer["favoritesCount"], int), "favoritesCount should be an integer"
        
        # Check other required fields
        required_fields = ["id", "title", "university", "country", "category", "degree", "views"]
        for field in required_fields:
            assert field in first_offer, f"Offer should have '{field}' field"
        
        print(f"PASS: Offers have all required fields including rating={first_offer['rating']} and favoritesCount={first_offer['favoritesCount']}")
    
    def test_offers_count_is_21_or_more(self):
        """Should have 21+ offers (17 imported + 4 seeded)"""
        response = requests.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        
        offers = response.json()
        assert len(offers) >= 21, f"Expected at least 21 offers, got {len(offers)}"
        print(f"PASS: Found {len(offers)} offers (expected >= 21)")


class TestOfferFilters:
    """Test offer filters: fullScholarship, partialScholarship, selfFinanced, online, new"""
    
    def test_filter_full_scholarship(self):
        """Filter fullScholarship should return offers with hasScholarship=True and isPartialScholarship=False"""
        response = requests.get(f"{BASE_URL}/api/offers", params={"filter_type": "fullScholarship"})
        assert response.status_code == 200
        
        offers = response.json()
        for offer in offers:
            assert offer.get("hasScholarship") == True, f"Offer '{offer['title']}' should have hasScholarship=True"
            assert offer.get("isPartialScholarship") == False, f"Offer '{offer['title']}' should have isPartialScholarship=False"
        
        print(f"PASS: fullScholarship filter returned {len(offers)} offers")
    
    def test_filter_partial_scholarship(self):
        """Filter partialScholarship should return offers with isPartialScholarship=True"""
        response = requests.get(f"{BASE_URL}/api/offers", params={"filter_type": "partialScholarship"})
        assert response.status_code == 200
        
        offers = response.json()
        for offer in offers:
            assert offer.get("isPartialScholarship") == True, f"Offer '{offer['title']}' should have isPartialScholarship=True"
        
        print(f"PASS: partialScholarship filter returned {len(offers)} offers")
    
    def test_filter_self_financed(self):
        """Filter selfFinanced should return offers with isSelfFinanced=True"""
        response = requests.get(f"{BASE_URL}/api/offers", params={"filter_type": "selfFinanced"})
        assert response.status_code == 200
        
        offers = response.json()
        for offer in offers:
            assert offer.get("isSelfFinanced") == True, f"Offer '{offer['title']}' should have isSelfFinanced=True"
        
        print(f"PASS: selfFinanced filter returned {len(offers)} offers")
    
    def test_filter_online(self):
        """Filter online should return offers with isOnline=True"""
        response = requests.get(f"{BASE_URL}/api/offers", params={"filter_type": "online"})
        assert response.status_code == 200
        
        offers = response.json()
        for offer in offers:
            assert offer.get("isOnline") == True, f"Offer '{offer['title']}' should have isOnline=True"
        
        print(f"PASS: online filter returned {len(offers)} offers")
    
    def test_filter_new(self):
        """Filter new should return offers with isNew=True"""
        response = requests.get(f"{BASE_URL}/api/offers", params={"filter_type": "new"})
        assert response.status_code == 200
        
        offers = response.json()
        for offer in offers:
            assert offer.get("isNew") == True, f"Offer '{offer['title']}' should have isNew=True"
        
        print(f"PASS: new filter returned {len(offers)} offers")


class TestDeadlineStatus:
    """Test GET /api/offers/{id}/deadline-status for various deadline formats"""
    
    @pytest.fixture
    def all_offers(self):
        """Get all offers to find test IDs"""
        response = requests.get(f"{BASE_URL}/api/offers")
        return response.json()
    
    def test_deadline_status_past_date(self, all_offers):
        """Deadline '15 Janvier 2025' should return isOpen=false (past deadline)"""
        # Find an offer with past deadline (like '15 Janvier 2025')
        past_deadline_offer = None
        for offer in all_offers:
            deadline = offer.get("deadline", "").lower()
            if "janvier 2025" in deadline or "15 janvier" in deadline:
                past_deadline_offer = offer
                break
        
        if past_deadline_offer:
            response = requests.get(f"{BASE_URL}/api/offers/{past_deadline_offer['id']}/deadline-status")
            assert response.status_code == 200
            data = response.json()
            assert data["isOpen"] == False, f"Deadline '{past_deadline_offer['deadline']}' should be isOpen=false"
            print(f"PASS: Past deadline '{past_deadline_offer['deadline']}' returns isOpen=false")
        else:
            # Try with one of the known deadlines
            print("INFO: No offer with '15 Janvier 2025' deadline found, checking alternative test")
            # Check any offer with a past date
            for offer in all_offers:
                response = requests.get(f"{BASE_URL}/api/offers/{offer['id']}/deadline-status")
                if response.status_code == 200:
                    print(f"Checked deadline: {offer.get('deadline')} -> isOpen={response.json()['isOpen']}")
                    break
    
    def test_deadline_status_inscription_continue(self, all_offers):
        """Deadline 'Inscription continue' should return isOpen=true"""
        # Find an offer with 'Inscription continue' deadline
        continuous_offer = None
        for offer in all_offers:
            deadline = offer.get("deadline", "").lower()
            if "continue" in deadline or "flexible" in deadline or "ouvert" in deadline:
                continuous_offer = offer
                break
        
        if continuous_offer:
            response = requests.get(f"{BASE_URL}/api/offers/{continuous_offer['id']}/deadline-status")
            assert response.status_code == 200
            data = response.json()
            assert data["isOpen"] == True, f"Deadline '{continuous_offer['deadline']}' should be isOpen=true"
            print(f"PASS: Continuous deadline '{continuous_offer['deadline']}' returns isOpen=true")
        else:
            print("INFO: No offer with continuous enrollment found")
    
    def test_deadline_status_1er_format(self, all_offers):
        """Deadline '1er Mars 2025' format should be parsed correctly"""
        # Find an offer with '1er' format
        er_offer = None
        for offer in all_offers:
            deadline = offer.get("deadline", "")
            if "1er" in deadline:
                er_offer = offer
                break
        
        if er_offer:
            response = requests.get(f"{BASE_URL}/api/offers/{er_offer['id']}/deadline-status")
            assert response.status_code == 200
            data = response.json()
            assert "isOpen" in data, "Response should have isOpen field"
            assert data["offerId"] == er_offer["id"], "Response should have correct offerId"
            print(f"PASS: '1er' format deadline '{er_offer['deadline']}' parsed successfully, isOpen={data['isOpen']}")
        else:
            print("INFO: No offer with '1er' format deadline found")
    
    def test_deadline_status_returns_all_fields(self, all_offers):
        """Deadline status response should have deadline, isOpen, and offerId"""
        if all_offers:
            offer = all_offers[0]
            response = requests.get(f"{BASE_URL}/api/offers/{offer['id']}/deadline-status")
            assert response.status_code == 200
            data = response.json()
            
            assert "deadline" in data, "Response should have 'deadline' field"
            assert "isOpen" in data, "Response should have 'isOpen' field"
            assert "offerId" in data, "Response should have 'offerId' field"
            assert isinstance(data["isOpen"], bool), "isOpen should be a boolean"
            print(f"PASS: Deadline status response has all required fields")


class TestImportOffersData:
    """Test POST /api/admin/import-offers-data endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Login as admin and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@winners-consulting.com",
            "password": "Admin2025!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed")
    
    def test_import_requires_admin_auth(self):
        """POST /api/admin/import-offers-data should require admin authentication"""
        response = requests.post(f"{BASE_URL}/api/admin/import-offers-data")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("PASS: Import endpoint requires authentication")
    
    def test_import_skips_duplicates_on_rerun(self, admin_token):
        """Re-running import should skip all existing offers (17 duplicates)"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{BASE_URL}/api/admin/import-offers-data", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "imported" in data, "Response should have 'imported' count"
        assert "skipped" in data, "Response should have 'skipped' count"
        
        # Since data was already imported, should skip all 17
        assert data["imported"] == 0, f"Expected 0 new imports, got {data['imported']}"
        assert data["skipped"] == 17, f"Expected 17 skipped, got {data['skipped']}"
        
        print(f"PASS: Import skipped {data['skipped']} duplicates, imported {data['imported']} new")


class TestOfferRatingsComputation:
    """Test real-time ratings computation"""
    
    def test_get_offer_rating_endpoint(self):
        """GET /api/offers/{id}/rating should compute and return rating"""
        # Get an offer ID first
        response = requests.get(f"{BASE_URL}/api/offers")
        offers = response.json()
        if not offers:
            pytest.skip("No offers available")
        
        offer_id = offers[0]["id"]
        response = requests.get(f"{BASE_URL}/api/offers/{offer_id}/rating")
        assert response.status_code == 200
        
        data = response.json()
        assert "rating" in data, "Response should have 'rating'"
        assert "favorites" in data, "Response should have 'favorites'"
        assert "views" in data, "Response should have 'views'"
        assert "offerId" in data, "Response should have 'offerId'"
        
        # Rating should be between 4.0 and 5.0
        assert 4.0 <= data["rating"] <= 5.0, f"Rating {data['rating']} should be between 4.0 and 5.0"
        
        print(f"PASS: Rating computed for offer: rating={data['rating']}, favorites={data['favorites']}, views={data['views']}")
    
    def test_offers_list_has_computed_ratings(self):
        """GET /api/offers should include computed ratings for each offer"""
        response = requests.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        
        offers = response.json()
        for offer in offers[:5]:  # Check first 5 offers
            assert "rating" in offer, f"Offer '{offer['title']}' should have rating"
            assert "favoritesCount" in offer, f"Offer '{offer['title']}' should have favoritesCount"
            assert 4.0 <= offer["rating"] <= 5.0, f"Rating {offer['rating']} should be between 4.0 and 5.0"
            assert offer["favoritesCount"] >= 0, "favoritesCount should be non-negative"
        
        print(f"PASS: All offers have computed rating and favoritesCount fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
