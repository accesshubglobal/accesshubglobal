"""
Backend API Tests for Winner's Consulting
Testing: Auth (register, login), Admin endpoints, User favorites, Applications, Messages
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://accesshub-cms.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"
TEST_USER_EMAIL = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
TEST_USER_PASSWORD = "TestPass123!"

# Store tokens for reuse
test_data = {
    "admin_token": None,
    "user_token": None,
    "user_id": None,
    "offer_id": None,
    "application_id": None,
    "message_id": None,
}


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestHealthCheck:
    """Basic health checks"""

    def test_api_accessible(self, api_client):
        """Test that API is accessible"""
        response = api_client.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200, f"API not accessible: {response.status_code}"
        print("✓ API is accessible")


class TestUserAuth:
    """User registration and login tests"""

    def test_register_new_user(self, api_client):
        """Test user registration"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
                "firstName": "Test",
                "lastName": "User",
                "phone": "+33123456789"
            }
        )
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["email"] == TEST_USER_EMAIL
        assert data["user"]["firstName"] == "Test"
        assert data["user"]["lastName"] == "User"
        assert data["user"]["role"] == "user"
        
        test_data["user_token"] = data["access_token"]
        test_data["user_id"] = data["user"]["id"]
        print(f"✓ User registered: {TEST_USER_EMAIL}")

    def test_register_duplicate_email(self, api_client):
        """Test registration with duplicate email fails"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": TEST_USER_EMAIL,
                "password": "AnotherPass123!",
                "firstName": "Duplicate",
                "lastName": "User"
            }
        )
        assert response.status_code == 400, "Duplicate registration should fail"
        print("✓ Duplicate email registration rejected")

    def test_login_valid_credentials(self, api_client):
        """Test login with valid credentials"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        print("✓ User login successful")

    def test_login_invalid_password(self, api_client):
        """Test login with wrong password"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": "WrongPassword123!"
            }
        )
        assert response.status_code == 401, "Invalid password should return 401"
        print("✓ Invalid password rejected")

    def test_login_nonexistent_user(self, api_client):
        """Test login with non-existent email"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "AnyPassword123!"
            }
        )
        assert response.status_code == 401, "Non-existent user should return 401"
        print("✓ Non-existent user login rejected")


class TestAdminAuth:
    """Admin login and access tests"""

    def test_admin_login(self, api_client):
        """Test admin login"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        
        data = response.json()
        assert data["user"]["role"] == "admin"
        test_data["admin_token"] = data["access_token"]
        print("✓ Admin login successful")

    def test_auth_me_with_admin_token(self, api_client):
        """Test /auth/me endpoint with admin token"""
        response = api_client.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        print("✓ Admin /auth/me verified")


class TestAdminEndpoints:
    """Admin-only endpoint tests"""

    def test_admin_stats(self, api_client):
        """Test admin stats endpoint"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"}
        )
        assert response.status_code == 200, f"Admin stats failed: {response.text}"
        
        data = response.json()
        assert "users" in data
        assert "offers" in data
        assert "universities" in data
        assert "messages" in data
        assert "applications" in data
        print(f"✓ Admin stats: {data['users']} users, {data['offers']} offers")

    def test_admin_users_list(self, api_client):
        """Test admin users list endpoint"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"}
        )
        assert response.status_code == 200, f"Admin users list failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        # Verify password is not exposed
        if len(data) > 0:
            assert "password" not in data[0]
        print(f"✓ Admin users list: {len(data)} users found")

    def test_admin_stats_unauthorized(self, api_client):
        """Test admin stats without auth - should fail"""
        response = api_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code in [401, 403], "Admin endpoint should require auth"
        print("✓ Admin stats requires authentication")

    def test_admin_stats_non_admin_user(self, api_client):
        """Test admin stats with regular user - should fail"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        assert response.status_code == 403, "Admin endpoint should reject non-admin users"
        print("✓ Admin stats rejects non-admin users")

    def test_admin_offers_list(self, api_client):
        """Test admin offers list"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/offers",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin offers list: {len(data)} offers")

    def test_admin_universities_list(self, api_client):
        """Test admin universities list"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/universities",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin universities list: {len(data)} universities")

    def test_admin_messages_list(self, api_client):
        """Test admin messages list"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/messages",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin messages list: {len(data)} messages")

    def test_admin_applications_list(self, api_client):
        """Test admin applications list"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/applications",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin applications list: {len(data)} applications")


class TestUserFavorites:
    """User favorites add/remove tests"""

    def test_add_to_favorites(self, api_client):
        """Test adding an offer to favorites"""
        # Use a test offer ID
        offer_id = "test-offer-123"
        response = api_client.post(
            f"{BASE_URL}/api/user/favorites/{offer_id}",
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        assert response.status_code == 200, f"Add to favorites failed: {response.text}"
        
        data = response.json()
        assert offer_id in data["favorites"]
        print("✓ Added offer to favorites")

    def test_get_favorites(self, api_client):
        """Test getting user favorites"""
        response = api_client.get(
            f"{BASE_URL}/api/user/favorites",
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get favorites: {len(data)} favorites")

    def test_remove_from_favorites(self, api_client):
        """Test removing an offer from favorites"""
        offer_id = "test-offer-123"
        response = api_client.delete(
            f"{BASE_URL}/api/user/favorites/{offer_id}",
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        assert response.status_code == 200, f"Remove from favorites failed: {response.text}"
        
        data = response.json()
        assert offer_id not in data["favorites"]
        print("✓ Removed offer from favorites")

    def test_favorites_unauthorized(self, api_client):
        """Test favorites without auth - should fail"""
        response = api_client.post(f"{BASE_URL}/api/user/favorites/test-offer")
        assert response.status_code in [401, 403], "Favorites should require auth"
        print("✓ Favorites requires authentication")


class TestMessages:
    """Message sending tests"""

    def test_send_message(self, api_client):
        """Test sending a message"""
        response = api_client.post(
            f"{BASE_URL}/api/messages",
            headers={"Authorization": f"Bearer {test_data['user_token']}"},
            json={
                "subject": "TEST_Inquiry about programs",
                "content": "I would like to know more about the scholarship programs available.",
                "offerId": None
            }
        )
        assert response.status_code == 200, f"Send message failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        test_data["message_id"] = data["id"]
        print("✓ Message sent successfully")

    def test_get_user_messages(self, api_client):
        """Test getting user's messages"""
        response = api_client.get(
            f"{BASE_URL}/api/messages",
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # Should have at least the test message
        print(f"✓ Get user messages: {len(data)} messages")

    def test_send_message_unauthorized(self, api_client):
        """Test sending message without auth - should fail"""
        response = api_client.post(
            f"{BASE_URL}/api/messages",
            json={
                "subject": "Test",
                "content": "Test content"
            }
        )
        assert response.status_code in [401, 403], "Messages should require auth"
        print("✓ Messages requires authentication")


class TestApplications:
    """Application submission tests"""

    def test_submit_application(self, api_client):
        """Test submitting an application"""
        response = api_client.post(
            f"{BASE_URL}/api/applications",
            headers={"Authorization": f"Bearer {test_data['user_token']}"},
            json={
                "offerId": "test-offer-for-application",
                "offerTitle": "TEST_Master in Computer Science"
            }
        )
        assert response.status_code == 200, f"Submit application failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        test_data["application_id"] = data["id"]
        print("✓ Application submitted successfully")

    def test_duplicate_application(self, api_client):
        """Test submitting duplicate application - should fail"""
        response = api_client.post(
            f"{BASE_URL}/api/applications",
            headers={"Authorization": f"Bearer {test_data['user_token']}"},
            json={
                "offerId": "test-offer-for-application",
                "offerTitle": "TEST_Master in Computer Science"
            }
        )
        assert response.status_code == 400, "Duplicate application should fail"
        print("✓ Duplicate application rejected")

    def test_get_user_applications(self, api_client):
        """Test getting user's applications"""
        response = api_client.get(
            f"{BASE_URL}/api/applications",
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # Should have at least the test application
        print(f"✓ Get user applications: {len(data)} applications")

    def test_submit_application_unauthorized(self, api_client):
        """Test submitting application without auth - should fail"""
        response = api_client.post(
            f"{BASE_URL}/api/applications",
            json={
                "offerId": "test",
                "offerTitle": "Test"
            }
        )
        assert response.status_code in [401, 403], "Applications should require auth"
        print("✓ Applications requires authentication")


class TestPublicEndpoints:
    """Public endpoint tests (no auth required)"""

    def test_get_offers(self, api_client):
        """Test getting public offers list"""
        response = api_client.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public offers: {len(data)} offers")

    def test_get_offers_with_filter(self, api_client):
        """Test getting offers with filter"""
        response = api_client.get(f"{BASE_URL}/api/offers?filter_type=new")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Filtered offers: {len(data)} new offers")

    def test_get_universities(self, api_client):
        """Test getting public universities list"""
        response = api_client.get(f"{BASE_URL}/api/universities")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public universities: {len(data)} universities")

    def test_get_housing(self, api_client):
        """Test getting public housing list"""
        response = api_client.get(f"{BASE_URL}/api/housing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public housing: {len(data)} listings")


class TestTokenValidation:
    """Token and session validation tests"""

    def test_invalid_token(self, api_client):
        """Test accessing protected endpoint with invalid token"""
        response = api_client.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid-token-123"}
        )
        assert response.status_code == 401, "Invalid token should return 401"
        print("✓ Invalid token rejected")

    def test_missing_token(self, api_client):
        """Test accessing protected endpoint without token"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403], "Missing token should be rejected"
        print("✓ Missing token rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
