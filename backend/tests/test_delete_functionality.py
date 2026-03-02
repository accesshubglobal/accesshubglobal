"""
Test Delete Functionality for Winner's Consulting
Tests:
- DELETE /api/admin/offers/{id} - actual deletion (not soft delete)
- DELETE /api/admin/universities/{id} - actual deletion
- DELETE /api/admin/housing/{id} - actual deletion  
- DELETE /api/admin/users/{id} - actual deletion with self-protection
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"


class TestDeleteFunctionality:
    """Test all delete endpoints for actual deletion (not soft delete)"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        return data["access_token"], data["user"]["id"]
    
    @pytest.fixture
    def auth_headers(self, admin_token):
        """Get auth headers for requests"""
        token, _ = admin_token
        return {"Authorization": f"Bearer {token}"}
    
    # ============== OFFER DELETE TESTS ==============
    
    def test_delete_offer_actually_removes_from_db(self, auth_headers):
        """Test that DELETE /api/admin/offers/{id} actually removes the offer from DB (not soft delete)"""
        # Step 1: Create a test offer
        test_offer = {
            "title": f"TEST_DELETE_OFFER_{uuid.uuid4().hex[:8]}",
            "university": "Test University",
            "city": "Beijing",
            "country": "Chine",
            "countryCode": "CN",
            "category": "engineering",
            "categoryLabel": "Ingénierie",
            "degree": "Master",
            "duration": "2 ans",
            "teachingLanguage": "Anglais",
            "intake": "Automne 2025",
            "deadline": "Ouvert",
            "hasScholarship": False,
            "isSelfFinanced": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/offers",
            json=test_offer,
            headers=auth_headers
        )
        assert create_response.status_code == 200, f"Failed to create offer: {create_response.text}"
        offer_id = create_response.json()["id"]
        print(f"Created test offer with ID: {offer_id}")
        
        # Step 2: Verify offer exists
        get_response = requests.get(f"{BASE_URL}/api/offers/{offer_id}")
        assert get_response.status_code == 200, "Offer should exist before deletion"
        
        # Step 3: Delete the offer
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/offers/{offer_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        assert "supprimée" in delete_response.json().get("message", "").lower() or "deleted" in delete_response.json().get("message", "").lower()
        print(f"Delete response: {delete_response.json()}")
        
        # Step 4: Verify offer is ACTUALLY deleted (not just isActive=false)
        get_after_delete = requests.get(f"{BASE_URL}/api/offers/{offer_id}")
        assert get_after_delete.status_code == 404, f"Offer should be deleted but got {get_after_delete.status_code}. Response: {get_after_delete.text}"
        print("✓ Offer is actually deleted from database (not soft delete)")
    
    def test_delete_nonexistent_offer_returns_404(self, auth_headers):
        """Test that deleting nonexistent offer returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(
            f"{BASE_URL}/api/admin/offers/{fake_id}",
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404 for nonexistent offer, got {response.status_code}"
        print("✓ DELETE nonexistent offer returns 404")
    
    # ============== UNIVERSITY DELETE TESTS ==============
    
    def test_delete_university_actually_removes_from_db(self, auth_headers):
        """Test that DELETE /api/admin/universities/{id} actually removes the university from DB"""
        # Step 1: Create a test university
        test_university = {
            "name": f"TEST_DELETE_UNIVERSITY_{uuid.uuid4().hex[:8]}",
            "city": "Beijing",
            "country": "Chine",
            "countryCode": "CN",
            "ranking": "Test Ranking",
            "badges": ["Test"]
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/universities",
            json=test_university,
            headers=auth_headers
        )
        assert create_response.status_code == 200, f"Failed to create university: {create_response.text}"
        uni_id = create_response.json()["id"]
        print(f"Created test university with ID: {uni_id}")
        
        # Step 2: Verify university exists
        get_response = requests.get(f"{BASE_URL}/api/universities/{uni_id}")
        assert get_response.status_code == 200, "University should exist before deletion"
        
        # Step 3: Delete the university
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/universities/{uni_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        print(f"Delete response: {delete_response.json()}")
        
        # Step 4: Verify university is ACTUALLY deleted
        get_after_delete = requests.get(f"{BASE_URL}/api/universities/{uni_id}")
        assert get_after_delete.status_code == 404, f"University should be deleted but got {get_after_delete.status_code}"
        print("✓ University is actually deleted from database (not soft delete)")
    
    def test_delete_nonexistent_university_returns_404(self, auth_headers):
        """Test that deleting nonexistent university returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(
            f"{BASE_URL}/api/admin/universities/{fake_id}",
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404 for nonexistent university, got {response.status_code}"
        print("✓ DELETE nonexistent university returns 404")
    
    # ============== HOUSING DELETE TESTS ==============
    
    def test_delete_housing_actually_removes_from_db(self, auth_headers):
        """Test that DELETE /api/admin/housing/{id} actually removes the housing from DB"""
        # Step 1: Create a test housing
        test_housing = {
            "type": f"TEST_DELETE_HOUSING_{uuid.uuid4().hex[:8]}",
            "location": "Test Location",
            "city": "Beijing",
            "country": "Chine",
            "priceRange": "1000-2000 CNY/mois",
            "features": ["WiFi", "Test"]
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/housing",
            json=test_housing,
            headers=auth_headers
        )
        assert create_response.status_code == 200, f"Failed to create housing: {create_response.text}"
        housing_id = create_response.json()["id"]
        print(f"Created test housing with ID: {housing_id}")
        
        # Step 2: Verify housing exists via admin endpoint (no public single housing GET)
        all_housing = requests.get(f"{BASE_URL}/api/admin/housing", headers=auth_headers)
        assert all_housing.status_code == 200
        housing_exists = any(h["id"] == housing_id for h in all_housing.json())
        assert housing_exists, "Housing should exist before deletion"
        
        # Step 3: Delete the housing
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/housing/{housing_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        print(f"Delete response: {delete_response.json()}")
        
        # Step 4: Verify housing is ACTUALLY deleted
        all_housing_after = requests.get(f"{BASE_URL}/api/admin/housing", headers=auth_headers)
        assert all_housing_after.status_code == 200
        housing_exists_after = any(h["id"] == housing_id for h in all_housing_after.json())
        assert not housing_exists_after, "Housing should be deleted but still exists"
        print("✓ Housing is actually deleted from database (not soft delete)")
    
    def test_delete_nonexistent_housing_returns_404(self, auth_headers):
        """Test that deleting nonexistent housing returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(
            f"{BASE_URL}/api/admin/housing/{fake_id}",
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404 for nonexistent housing, got {response.status_code}"
        print("✓ DELETE nonexistent housing returns 404")
    
    # ============== USER DELETE TESTS ==============
    
    def test_delete_user_actually_removes_from_db(self, auth_headers):
        """Test that DELETE /api/admin/users/{id} actually removes the user from DB"""
        # Step 1: Create a test user via registration
        test_email = f"test_delete_{uuid.uuid4().hex[:8]}@test.com"
        test_user = {
            "email": test_email,
            "password": "TestPass123!",
            "firstName": "Test",
            "lastName": "DeleteUser"
        }
        
        register_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=test_user
        )
        assert register_response.status_code == 200, f"Failed to register user: {register_response.text}"
        user_id = register_response.json()["user"]["id"]
        print(f"Created test user with ID: {user_id}")
        
        # Step 2: Verify user exists in admin list
        users_response = requests.get(f"{BASE_URL}/api/admin/users", headers=auth_headers)
        assert users_response.status_code == 200
        user_exists = any(u["id"] == user_id for u in users_response.json())
        assert user_exists, "User should exist before deletion"
        
        # Step 3: Delete the user
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/users/{user_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        print(f"Delete response: {delete_response.json()}")
        
        # Step 4: Verify user is ACTUALLY deleted (not just isActive=false)
        users_after = requests.get(f"{BASE_URL}/api/admin/users", headers=auth_headers)
        assert users_after.status_code == 200
        user_exists_after = any(u["id"] == user_id for u in users_after.json())
        assert not user_exists_after, "User should be deleted but still exists"
        
        # Step 5: Verify deleted user cannot login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": "TestPass123!"
        })
        assert login_response.status_code == 401, f"Deleted user should not be able to login, got {login_response.status_code}"
        print("✓ User is actually deleted from database (not soft delete)")
    
    def test_admin_cannot_delete_themselves(self, admin_token, auth_headers):
        """Test that admin cannot delete their own account (returns 400)"""
        _, admin_id = admin_token
        
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/users/{admin_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 400, f"Expected 400 when admin tries to delete self, got {delete_response.status_code}"
        
        # Verify the error message
        error_detail = delete_response.json().get("detail", "")
        assert "propre compte" in error_detail or "your own" in error_detail.lower() or "yourself" in error_detail.lower(), f"Error message should mention self-deletion: {error_detail}"
        print(f"✓ Admin cannot delete themselves - Error: {error_detail}")
    
    def test_delete_nonexistent_user_returns_404(self, auth_headers):
        """Test that deleting nonexistent user returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(
            f"{BASE_URL}/api/admin/users/{fake_id}",
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404 for nonexistent user, got {response.status_code}"
        print("✓ DELETE nonexistent user returns 404")


class TestScholarshipDeleteSameAsOfferDelete:
    """Test that scholarships (which are offers with hasScholarship=true) use the same delete mechanism"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture
    def auth_headers(self, admin_token):
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_delete_scholarship_offer(self, auth_headers):
        """Test that deleting a scholarship offer works the same as regular offers"""
        # Create a scholarship offer
        scholarship_offer = {
            "title": f"TEST_SCHOLARSHIP_{uuid.uuid4().hex[:8]}",
            "university": "Test Scholarship University",
            "city": "Beijing",
            "country": "Chine",
            "countryCode": "CN",
            "category": "engineering",
            "categoryLabel": "Ingénierie",
            "degree": "Master",
            "duration": "2 ans",
            "teachingLanguage": "Anglais",
            "intake": "Automne 2025",
            "deadline": "31 Mars 2025",
            "hasScholarship": True,  # This makes it a scholarship
            "isPartialScholarship": False,  # Full scholarship
            "isSelfFinanced": False,
            "scholarshipType": "Test Scholarship CSC"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/offers",
            json=scholarship_offer,
            headers=auth_headers
        )
        assert create_response.status_code == 200
        offer_id = create_response.json()["id"]
        print(f"Created scholarship offer with ID: {offer_id}")
        
        # Delete using the same endpoint as regular offers
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/offers/{offer_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        
        # Verify it's actually deleted
        get_response = requests.get(f"{BASE_URL}/api/offers/{offer_id}")
        assert get_response.status_code == 404, "Scholarship offer should be deleted"
        print("✓ Scholarship offer deleted using same deleteOffer function")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
