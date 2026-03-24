"""
Test suite for Admin Applications features:
- PUT /api/admin/applications/{id}/status with 'modify' status and reason
- POST /api/admin/applications/{id}/message - send message to candidate
- GET /api/admin/applications/{id}/messages - retrieve messages
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
API = f"{BASE_URL}/api"

# Test credentials
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"


class TestApplicationsAdmin:
    """Test admin application management features"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.status_code}")
        return response.json().get("access_token")
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        """Headers with admin auth"""
        return {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
    
    @pytest.fixture(scope="class")
    def test_user_token(self):
        """Create a test user and get token"""
        test_email = f"TEST_user_{uuid.uuid4().hex[:8]}@test.com"
        # Register
        response = requests.post(f"{API}/auth/register", json={
            "email": test_email,
            "password": "TestPass123!",
            "firstName": "Test",
            "lastName": "User",
            "phone": "+1234567890"
        })
        if response.status_code == 200:
            return response.json().get("access_token"), test_email
        # If user exists, try login
        response = requests.post(f"{API}/auth/login", json={
            "email": test_email,
            "password": "TestPass123!"
        })
        if response.status_code == 200:
            return response.json().get("access_token"), test_email
        pytest.skip("Could not create test user")
    
    @pytest.fixture(scope="class")
    def test_application_id(self, admin_headers):
        """Get an existing application ID for testing"""
        response = requests.get(f"{API}/admin/applications", headers=admin_headers)
        if response.status_code == 200 and len(response.json()) > 0:
            return response.json()[0]["id"]
        pytest.skip("No applications found for testing")
    
    # ============= STATUS UPDATE TESTS =============
    
    def test_get_applications_list(self, admin_headers):
        """Test GET /api/admin/applications returns list"""
        response = requests.get(f"{API}/admin/applications", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"SUCCESS: Found {len(data)} applications")
    
    def test_update_status_to_reviewing(self, admin_headers, test_application_id):
        """Test updating application status to 'reviewing'"""
        response = requests.put(
            f"{API}/admin/applications/{test_application_id}/status?status=reviewing",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"SUCCESS: Status updated to reviewing - {data['message']}")
    
    def test_update_status_to_accepted(self, admin_headers, test_application_id):
        """Test updating application status to 'accepted'"""
        response = requests.put(
            f"{API}/admin/applications/{test_application_id}/status?status=accepted",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"SUCCESS: Status updated to accepted - {data['message']}")
    
    def test_update_status_to_rejected(self, admin_headers, test_application_id):
        """Test updating application status to 'rejected'"""
        response = requests.put(
            f"{API}/admin/applications/{test_application_id}/status?status=rejected",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"SUCCESS: Status updated to rejected - {data['message']}")
    
    def test_update_status_to_modify_with_reason(self, admin_headers, test_application_id):
        """Test updating application status to 'modify' with reason"""
        reason = "TEST_Le passeport soumis est illisible, veuillez soumettre une copie plus claire."
        response = requests.put(
            f"{API}/admin/applications/{test_application_id}/status?status=modify&reason={reason}",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        assert "modify" in data["message"].lower()
        print(f"SUCCESS: Status updated to modify with reason - {data['message']}")
    
    def test_update_status_to_modify_without_reason(self, admin_headers, test_application_id):
        """Test updating application status to 'modify' without reason (should still work)"""
        response = requests.put(
            f"{API}/admin/applications/{test_application_id}/status?status=modify",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("SUCCESS: Status updated to modify without reason")
    
    def test_update_status_invalid_status(self, admin_headers, test_application_id):
        """Test updating with invalid status returns 400"""
        response = requests.put(
            f"{API}/admin/applications/{test_application_id}/status?status=invalid_status",
            headers=admin_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("SUCCESS: Invalid status correctly rejected with 400")
    
    def test_verify_modify_status_persisted(self, admin_headers, test_application_id):
        """Verify that modify status and reason are persisted in database"""
        # First set modify status with reason
        reason = "TEST_Documents incomplets - veuillez ajouter votre diplôme"
        requests.put(
            f"{API}/admin/applications/{test_application_id}/status?status=modify&reason={reason}",
            headers=admin_headers
        )
        
        # Get applications and verify
        response = requests.get(f"{API}/admin/applications", headers=admin_headers)
        assert response.status_code == 200
        
        apps = response.json()
        app = next((a for a in apps if a["id"] == test_application_id), None)
        assert app is not None, "Application not found"
        assert app["status"] == "modify", f"Expected status 'modify', got '{app['status']}'"
        assert app.get("modifyReason") == reason, f"Reason not persisted correctly"
        print(f"SUCCESS: Modify status and reason persisted correctly")
    
    # ============= MESSAGING TESTS =============
    
    def test_send_message_to_candidate(self, admin_headers, test_application_id):
        """Test POST /api/admin/applications/{id}/message"""
        message_content = "TEST_Bonjour, nous avons besoin de documents supplémentaires."
        response = requests.post(
            f"{API}/admin/applications/{test_application_id}/message",
            headers=admin_headers,
            json={"content": message_content}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        assert "data" in data
        assert data["data"]["content"] == message_content
        assert data["data"]["isAdmin"] == True
        assert "adminName" in data["data"]
        assert "id" in data["data"]
        print(f"SUCCESS: Message sent to candidate - {data['message']}")
    
    def test_get_application_messages(self, admin_headers, test_application_id):
        """Test GET /api/admin/applications/{id}/messages"""
        response = requests.get(
            f"{API}/admin/applications/{test_application_id}/messages",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"SUCCESS: Retrieved {len(data)} messages for application")
    
    def test_send_multiple_messages(self, admin_headers, test_application_id):
        """Test sending multiple messages"""
        messages = [
            "TEST_Message 1: Veuillez vérifier vos informations",
            "TEST_Message 2: Nous avons reçu vos documents"
        ]
        
        for msg in messages:
            response = requests.post(
                f"{API}/admin/applications/{test_application_id}/message",
                headers=admin_headers,
                json={"content": msg}
            )
            assert response.status_code == 200
        
        # Verify all messages are stored
        response = requests.get(
            f"{API}/admin/applications/{test_application_id}/messages",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check that our test messages are in the list
        test_messages = [m for m in data if m.get("content", "").startswith("TEST_")]
        assert len(test_messages) >= 2, f"Expected at least 2 test messages, found {len(test_messages)}"
        print(f"SUCCESS: Multiple messages sent and retrieved correctly")
    
    def test_message_not_found_application(self, admin_headers):
        """Test messaging non-existent application returns 404"""
        fake_id = "non-existent-app-id-12345"
        response = requests.post(
            f"{API}/admin/applications/{fake_id}/message",
            headers=admin_headers,
            json={"content": "Test message"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: Non-existent application correctly returns 404")
    
    def test_get_messages_not_found_application(self, admin_headers):
        """Test getting messages for non-existent application returns 404"""
        fake_id = "non-existent-app-id-12345"
        response = requests.get(
            f"{API}/admin/applications/{fake_id}/messages",
            headers=admin_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: Non-existent application messages correctly returns 404")
    
    # ============= AUTHENTICATION TESTS =============
    
    def test_status_update_requires_admin(self, test_application_id):
        """Test that status update requires admin authentication"""
        response = requests.put(
            f"{API}/admin/applications/{test_application_id}/status?status=reviewing"
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("SUCCESS: Status update correctly requires authentication")
    
    def test_send_message_requires_admin(self, test_application_id):
        """Test that sending message requires admin authentication"""
        response = requests.post(
            f"{API}/admin/applications/{test_application_id}/message",
            json={"content": "Test"}
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("SUCCESS: Send message correctly requires authentication")
    
    def test_get_messages_requires_admin(self, test_application_id):
        """Test that getting messages requires admin authentication"""
        response = requests.get(
            f"{API}/admin/applications/{test_application_id}/messages"
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("SUCCESS: Get messages correctly requires authentication")
    
    # ============= PAYMENT STATUS TESTS =============
    
    def test_update_payment_status(self, admin_headers, test_application_id):
        """Test updating payment status"""
        for status in ["pending", "submitted", "verified", "rejected"]:
            response = requests.put(
                f"{API}/admin/applications/{test_application_id}/payment-status?payment_status={status}",
                headers=admin_headers
            )
            assert response.status_code == 200, f"Expected 200 for {status}, got {response.status_code}"
        print("SUCCESS: All payment statuses updated correctly")
    
    def test_update_payment_status_invalid(self, admin_headers, test_application_id):
        """Test updating with invalid payment status returns 400"""
        response = requests.put(
            f"{API}/admin/applications/{test_application_id}/payment-status?payment_status=invalid",
            headers=admin_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("SUCCESS: Invalid payment status correctly rejected")
    
    # ============= CLEANUP =============
    
    def test_cleanup_reset_status(self, admin_headers, test_application_id):
        """Reset application status to pending after tests"""
        response = requests.put(
            f"{API}/admin/applications/{test_application_id}/status?status=pending",
            headers=admin_headers
        )
        assert response.status_code == 200
        print("SUCCESS: Application status reset to pending")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
