"""
Test suite for 5 UI improvements:
1. Banner slides management (admin CMS)
2. Messages API (for contact and publish needs modals)
3. Site settings banners (public endpoint)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://uni-management-hub.preview.emergentagent.com').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"


class TestBannerEndpoints:
    """Test banner slides management endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["access_token"]
    
    def test_public_banners_endpoint(self):
        """GET /api/site-settings/banners - returns banners list (empty by default)"""
        response = requests.get(f"{BASE_URL}/api/site-settings/banners")
        assert response.status_code == 200
        data = response.json()
        assert "slides" in data
        assert isinstance(data["slides"], list)
        print(f"✓ Public banners endpoint returns {len(data['slides'])} slides")
    
    def test_admin_get_banners(self, admin_token):
        """GET /api/admin/site-settings/banners - admin can retrieve banners"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-settings/banners",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "slides" in data
        print(f"✓ Admin banners endpoint returns {len(data['slides'])} slides")
    
    def test_admin_save_banners(self, admin_token):
        """POST /api/admin/site-settings/banners - admin can save banner slides"""
        test_slides = [
            {
                "id": f"test-{uuid.uuid4().hex[:8]}",
                "image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
                "title": "Test Banner",
                "subtitle": "Test subtitle"
            }
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/admin/site-settings/banners",
            json={"slides": test_slides},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Admin can save banners: {data['message']}")
        
        # Verify the banner was saved
        verify_response = requests.get(f"{BASE_URL}/api/site-settings/banners")
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert len(verify_data["slides"]) >= 1
        print(f"✓ Banner persisted - now {len(verify_data['slides'])} slides")
    
    def test_admin_banners_requires_auth(self):
        """Admin banner endpoints require authentication"""
        # GET without auth
        response = requests.get(f"{BASE_URL}/api/admin/site-settings/banners")
        assert response.status_code in [401, 403]
        
        # POST without auth
        response = requests.post(
            f"{BASE_URL}/api/admin/site-settings/banners",
            json={"slides": []}
        )
        assert response.status_code in [401, 403]
        print("✓ Admin banner endpoints require authentication")


class TestMessagesAPI:
    """Test messages API for contact and publish needs modals"""
    
    @pytest.fixture(scope="class")
    def user_token(self):
        """Get user authentication token (register new user)"""
        unique_email = f"test_user_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "TestPass123!",
            "firstName": "Test",
            "lastName": "User"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        # If registration fails, try login with admin
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_send_contact_message(self, user_token):
        """POST /api/messages - user can send contact message"""
        response = requests.post(
            f"{BASE_URL}/api/messages",
            json={
                "subject": "Test Contact Message",
                "content": "This is a test contact message from the contact modal."
            },
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "id" in data
        print(f"✓ Contact message sent successfully: {data['id']}")
    
    def test_send_publish_needs_message(self, user_token):
        """POST /api/messages - user can send publish needs message"""
        content = """Domaine d'études: Informatique
Niveau: Master
Pays souhaité: Chine
Budget: 5000 EUR / an
Description: Je recherche un programme de Master en informatique avec bourse."""
        
        response = requests.post(
            f"{BASE_URL}/api/messages",
            json={
                "subject": "Publication de besoins - Recherche de programme",
                "content": content
            },
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "id" in data
        print(f"✓ Publish needs message sent successfully: {data['id']}")
    
    def test_get_user_messages(self, user_token):
        """GET /api/messages - user can retrieve their messages"""
        response = requests.get(
            f"{BASE_URL}/api/messages",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ User can retrieve {len(data)} messages")
    
    def test_messages_require_auth(self):
        """Messages endpoints require authentication"""
        # POST without auth
        response = requests.post(
            f"{BASE_URL}/api/messages",
            json={"subject": "Test", "content": "Test"}
        )
        assert response.status_code in [401, 403]
        
        # GET without auth
        response = requests.get(f"{BASE_URL}/api/messages")
        assert response.status_code in [401, 403]
        print("✓ Messages endpoints require authentication")


class TestAdminStats:
    """Test admin stats endpoint includes all data"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_admin_stats(self, admin_token):
        """GET /api/admin/stats - returns comprehensive statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify all expected fields
        expected_fields = ["users", "offers", "universities", "housing", "messages", "unreadMessages", "applications", "pendingApplications"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✓ Admin stats: {data['users']} users, {data['offers']} offers, {data['messages']} messages")


class TestOffersAPI:
    """Test offers API for programs section"""
    
    def test_get_offers(self):
        """GET /api/offers - returns list of offers"""
        response = requests.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Offers endpoint returns {len(data)} offers")
        
        if len(data) > 0:
            offer = data[0]
            # Verify offer structure
            assert "id" in offer
            assert "title" in offer
            assert "university" in offer
            print(f"✓ First offer: {offer['title'][:50]}...")
    
    def test_get_offer_by_id(self):
        """GET /api/offers/{id} - returns single offer"""
        # First get list to get an ID
        response = requests.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        offers = response.json()
        
        if len(offers) > 0:
            offer_id = offers[0]["id"]
            response = requests.get(f"{BASE_URL}/api/offers/{offer_id}")
            assert response.status_code == 200
            offer = response.json()
            assert offer["id"] == offer_id
            print(f"✓ Single offer retrieval works: {offer['title'][:50]}...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
