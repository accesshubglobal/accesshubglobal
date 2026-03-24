"""
Test suite for Winner's Consulting API after backend refactoring.
Tests all major endpoints to verify shared modules (_routes.py, _models.py, _helpers.py) work correctly.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"


class TestPublicEndpoints:
    """Tests for public (unauthenticated) endpoints"""
    
    def test_root_endpoint(self):
        """GET /api/ - root endpoint returns status ok"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "Winners Consulting" in data["message"]
        print("✓ Root endpoint working")
    
    def test_get_offers(self):
        """GET /api/offers - list all offers"""
        response = requests.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # Should have at least some offers
        print(f"✓ Offers endpoint working - returned {len(data)} offers")
    
    def test_get_universities(self):
        """GET /api/universities - list universities"""
        response = requests.get(f"{BASE_URL}/api/universities")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        print(f"✓ Universities endpoint working - returned {len(data)} universities")
    
    def test_get_housing(self):
        """GET /api/housing - list housing"""
        response = requests.get(f"{BASE_URL}/api/housing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        print(f"✓ Housing endpoint working - returned {len(data)} housing options")
    
    def test_get_payment_settings(self):
        """GET /api/payment-settings - public payment settings"""
        response = requests.get(f"{BASE_URL}/api/payment-settings")
        assert response.status_code == 200
        data = response.json()
        assert "applicationFee" in data
        assert "currency" in data
        assert "bankName" in data
        print("✓ Payment settings endpoint working")


class TestAuthEndpoints:
    """Tests for authentication endpoints"""
    
    def test_admin_login(self):
        """POST /api/auth/login - admin login"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        print("✓ Admin login working")
        return data["access_token"]
    
    def test_invalid_login(self):
        """POST /api/auth/login - invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "invalid@test.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")
    
    def test_register_new_user(self):
        """POST /api/auth/register - register new user"""
        unique_email = f"test_register_{int(time.time())}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": unique_email,
                "password": "Test1234!",
                "firstName": "Test",
                "lastName": "Register",
                "phone": "+1234567890"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["role"] == "user"
        print(f"✓ User registration working - created {unique_email}")
    
    def test_get_me(self):
        """GET /api/auth/me - verify authenticated user info"""
        # First login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_response.json()["access_token"]
        
        # Then get user info
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        print("✓ Get me endpoint working")


class TestAdminEndpoints:
    """Tests for admin-only endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_admin_stats(self):
        """GET /api/admin/stats - admin statistics"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "offers" in data
        assert "universities" in data
        assert "housing" in data
        assert "messages" in data
        assert "applications" in data
        print(f"✓ Admin stats working - {data['offers']} offers, {data['users']} users")
    
    def test_admin_offers(self):
        """GET /api/admin/offers - admin list all offers"""
        response = requests.get(f"{BASE_URL}/api/admin/offers", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin offers working - {len(data)} offers")
    
    def test_admin_messages(self):
        """GET /api/admin/messages - admin list messages"""
        response = requests.get(f"{BASE_URL}/api/admin/messages", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin messages working - {len(data)} messages")
    
    def test_admin_applications(self):
        """GET /api/admin/applications - admin list applications"""
        response = requests.get(f"{BASE_URL}/api/admin/applications", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin applications working - {len(data)} applications")
    
    def test_admin_users(self):
        """GET /api/admin/users - admin list users"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify no passwords are exposed
        for user in data:
            assert "password" not in user
        print(f"✓ Admin users working - {len(data)} users")
    
    def test_admin_payment_settings(self):
        """GET /api/admin/payment-settings - admin payment settings"""
        response = requests.get(f"{BASE_URL}/api/admin/payment-settings", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "applicationFee" in data
        assert "termsConditions" in data
        print("✓ Admin payment settings working")
    
    def test_admin_newsletter(self):
        """GET /api/admin/newsletter - admin list newsletter subscribers"""
        response = requests.get(f"{BASE_URL}/api/admin/newsletter", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin newsletter working - {len(data)} subscribers")
    
    def test_admin_requires_auth(self):
        """Admin endpoints should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code in [401, 403]
        print("✓ Admin endpoints correctly require authentication")


class TestUserEndpoints:
    """Tests for authenticated user endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token (admin is also a user)"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_notifications(self):
        """GET /api/notifications - user notifications"""
        response = requests.get(f"{BASE_URL}/api/notifications", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Notifications endpoint working - {len(data)} notifications")
    
    def test_get_applications(self):
        """GET /api/applications - user applications list"""
        response = requests.get(f"{BASE_URL}/api/applications", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ User applications endpoint working - {len(data)} applications")
    
    def test_get_messages(self):
        """GET /api/messages - user list messages"""
        response = requests.get(f"{BASE_URL}/api/messages", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ User messages endpoint working - {len(data)} messages")
    
    def test_create_message(self):
        """POST /api/messages - user send message"""
        response = requests.post(
            f"{BASE_URL}/api/messages",
            headers=self.headers,
            json={
                "subject": "Test Message from pytest",
                "content": "This is a test message created by the testing agent"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["message"] == "Message envoyé avec succès"
        print(f"✓ Create message working - created message {data['id']}")


class TestNewsletterEndpoint:
    """Tests for newsletter subscription"""
    
    def test_newsletter_subscribe(self):
        """POST /api/newsletter/subscribe - newsletter subscription"""
        unique_email = f"newsletter_test_{int(time.time())}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": unique_email}
        )
        assert response.status_code == 200
        data = response.json()
        assert "réussie" in data["message"].lower() or "success" in data["message"].lower()
        print(f"✓ Newsletter subscription working - subscribed {unique_email}")
    
    def test_newsletter_duplicate(self):
        """POST /api/newsletter/subscribe - duplicate email rejected"""
        # First subscription
        unique_email = f"newsletter_dup_{int(time.time())}@test.com"
        requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": unique_email}
        )
        
        # Second subscription with same email
        response = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": unique_email}
        )
        assert response.status_code == 400
        print("✓ Duplicate newsletter subscription correctly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
