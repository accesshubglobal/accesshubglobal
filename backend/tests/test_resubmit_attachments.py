"""
Test suite for:
1. PUT /api/applications/{id}/resubmit - resets modify status to pending (requires user auth, status must be 'modify')
2. PUT /api/applications/{id}/documents - updates documents array (requires user auth)
3. POST /api/admin/applications/{id}/message - now accepts 'attachments' field (list of URLs)
4. Resubmit endpoint returns 400 if status is not 'modify'
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://uni-management-hub.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"

# Test application ID with 'modify' status
TEST_APP_ID = "5dc87f22-e8ed-4c2e-b3a3-ac0deda2b9f3"


class TestResubmitAndAttachments:
    """Test resubmit flow and attachment support"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def user_token(self):
        """Get user authentication token (admin is also a user)"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"User login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def user_headers(self, user_token):
        """Headers with user auth"""
        return {"Authorization": f"Bearer {user_token}"}
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        """Headers with admin auth"""
        return {"Authorization": f"Bearer {admin_token}"}
    
    # ============= RESUBMIT ENDPOINT TESTS =============
    
    def test_resubmit_requires_auth(self):
        """Test that resubmit endpoint requires authentication"""
        response = requests.put(f"{BASE_URL}/api/applications/{TEST_APP_ID}/resubmit")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Resubmit endpoint requires authentication")
    
    def test_resubmit_returns_400_if_not_modify_status(self, admin_headers, user_headers):
        """Test that resubmit returns 400 if application status is not 'modify'"""
        # First, get an application and ensure it's NOT in 'modify' status
        # Set status to 'pending' first
        response = requests.put(
            f"{BASE_URL}/api/admin/applications/{TEST_APP_ID}/status?status=pending",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Failed to set status to pending: {response.text}"
        
        # Now try to resubmit - should fail with 400
        response = requests.put(
            f"{BASE_URL}/api/applications/{TEST_APP_ID}/resubmit",
            headers=user_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        assert "ne nécessite pas de modification" in response.json().get("detail", "").lower() or "modify" in response.json().get("detail", "").lower()
        print("✓ Resubmit returns 400 when status is not 'modify'")
    
    def test_resubmit_success_when_modify_status(self, admin_headers, user_headers):
        """Test that resubmit works when application status is 'modify'"""
        # First, set status to 'modify'
        response = requests.put(
            f"{BASE_URL}/api/admin/applications/{TEST_APP_ID}/status?status=modify&reason=Test+modification+request",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Failed to set status to modify: {response.text}"
        
        # Verify status is 'modify'
        response = requests.get(
            f"{BASE_URL}/api/applications/{TEST_APP_ID}",
            headers=user_headers
        )
        assert response.status_code == 200
        app_data = response.json()
        assert app_data.get("status") == "modify", f"Expected status 'modify', got {app_data.get('status')}"
        print("✓ Application status set to 'modify'")
        
        # Now resubmit - should succeed
        response = requests.put(
            f"{BASE_URL}/api/applications/{TEST_APP_ID}/resubmit",
            headers=user_headers
        )
        assert response.status_code == 200, f"Resubmit failed: {response.text}"
        assert "succès" in response.json().get("message", "").lower() or "success" in response.json().get("message", "").lower()
        print("✓ Resubmit succeeded")
        
        # Verify status changed to 'pending'
        response = requests.get(
            f"{BASE_URL}/api/applications/{TEST_APP_ID}",
            headers=user_headers
        )
        assert response.status_code == 200
        app_data = response.json()
        assert app_data.get("status") == "pending", f"Expected status 'pending' after resubmit, got {app_data.get('status')}"
        # modifyReason should be cleared
        assert app_data.get("modifyReason") is None, f"modifyReason should be None after resubmit"
        print("✓ Status reset to 'pending' and modifyReason cleared")
    
    # ============= UPDATE DOCUMENTS ENDPOINT TESTS =============
    
    def test_update_documents_requires_auth(self):
        """Test that update documents endpoint requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/applications/{TEST_APP_ID}/documents",
            json={"documents": []}
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Update documents endpoint requires authentication")
    
    def test_update_documents_success(self, user_headers):
        """Test updating documents array"""
        test_docs = [
            {"name": "TEST_Passport.pdf", "url": "https://example.com/test_passport.pdf"},
            {"name": "TEST_Diploma.pdf", "url": "https://example.com/test_diploma.pdf"}
        ]
        
        response = requests.put(
            f"{BASE_URL}/api/applications/{TEST_APP_ID}/documents",
            json={"documents": test_docs},
            headers=user_headers
        )
        assert response.status_code == 200, f"Update documents failed: {response.text}"
        print("✓ Documents updated successfully")
        
        # Verify documents were updated
        response = requests.get(
            f"{BASE_URL}/api/applications/{TEST_APP_ID}",
            headers=user_headers
        )
        assert response.status_code == 200
        app_data = response.json()
        assert len(app_data.get("documents", [])) == 2, f"Expected 2 documents, got {len(app_data.get('documents', []))}"
        print("✓ Documents persisted correctly")
    
    # ============= ADMIN MESSAGE WITH ATTACHMENTS TESTS =============
    
    def test_admin_message_with_attachments(self, admin_headers):
        """Test that admin can send message with attachments"""
        test_attachments = [
            "https://example.com/test_attachment1.pdf",
            "https://example.com/test_attachment2.jpg"
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/admin/applications/{TEST_APP_ID}/message",
            json={
                "content": "TEST_Message with attachments",
                "attachments": test_attachments
            },
            headers=admin_headers
        )
        assert response.status_code == 200, f"Send message with attachments failed: {response.text}"
        
        # Verify response contains attachments
        msg_data = response.json().get("data", {})
        assert "attachments" in msg_data, "Response should contain attachments field"
        assert len(msg_data.get("attachments", [])) == 2, f"Expected 2 attachments, got {len(msg_data.get('attachments', []))}"
        print("✓ Admin message with attachments sent successfully")
    
    def test_admin_message_without_attachments(self, admin_headers):
        """Test that admin can send message without attachments (backward compatibility)"""
        response = requests.post(
            f"{BASE_URL}/api/admin/applications/{TEST_APP_ID}/message",
            json={
                "content": "TEST_Message without attachments"
            },
            headers=admin_headers
        )
        assert response.status_code == 200, f"Send message without attachments failed: {response.text}"
        print("✓ Admin message without attachments sent successfully")
    
    def test_admin_message_empty_attachments(self, admin_headers):
        """Test that admin can send message with empty attachments array"""
        response = requests.post(
            f"{BASE_URL}/api/admin/applications/{TEST_APP_ID}/message",
            json={
                "content": "TEST_Message with empty attachments",
                "attachments": []
            },
            headers=admin_headers
        )
        assert response.status_code == 200, f"Send message with empty attachments failed: {response.text}"
        print("✓ Admin message with empty attachments sent successfully")
    
    def test_get_messages_includes_attachments(self, admin_headers):
        """Test that getting messages includes attachments"""
        response = requests.get(
            f"{BASE_URL}/api/admin/applications/{TEST_APP_ID}/messages",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Get messages failed: {response.text}"
        
        messages = response.json()
        # Find message with attachments
        msg_with_attachments = None
        for msg in messages:
            if msg.get("attachments") and len(msg.get("attachments", [])) > 0:
                msg_with_attachments = msg
                break
        
        assert msg_with_attachments is not None, "Should find at least one message with attachments"
        print(f"✓ Found message with {len(msg_with_attachments.get('attachments', []))} attachments")
    
    # ============= CLEANUP =============
    
    def test_cleanup_reset_status(self, admin_headers):
        """Cleanup: Reset application status to pending"""
        response = requests.put(
            f"{BASE_URL}/api/admin/applications/{TEST_APP_ID}/status?status=pending",
            headers=admin_headers
        )
        assert response.status_code == 200
        print("✓ Cleanup: Status reset to pending")


class TestResubmitEdgeCases:
    """Edge case tests for resubmit functionality"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def user_headers(self, admin_token):
        return {"Authorization": f"Bearer {admin_token}"}
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_resubmit_nonexistent_application(self, user_headers):
        """Test resubmit on non-existent application returns 404"""
        response = requests.put(
            f"{BASE_URL}/api/applications/nonexistent-id-12345/resubmit",
            headers=user_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Resubmit on non-existent application returns 404")
    
    def test_update_documents_nonexistent_application(self, user_headers):
        """Test update documents on non-existent application returns 404"""
        response = requests.put(
            f"{BASE_URL}/api/applications/nonexistent-id-12345/documents",
            json={"documents": []},
            headers=user_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Update documents on non-existent application returns 404")
    
    def test_resubmit_all_non_modify_statuses(self, admin_headers, user_headers):
        """Test that resubmit fails for all non-modify statuses"""
        non_modify_statuses = ["pending", "reviewing", "accepted", "rejected"]
        
        for status in non_modify_statuses:
            # Set status
            response = requests.put(
                f"{BASE_URL}/api/admin/applications/{TEST_APP_ID}/status?status={status}",
                headers=admin_headers
            )
            assert response.status_code == 200, f"Failed to set status to {status}"
            
            # Try resubmit - should fail
            response = requests.put(
                f"{BASE_URL}/api/applications/{TEST_APP_ID}/resubmit",
                headers=user_headers
            )
            assert response.status_code == 400, f"Resubmit should fail for status '{status}', got {response.status_code}"
            print(f"✓ Resubmit correctly fails for status '{status}'")
        
        # Reset to pending
        requests.put(
            f"{BASE_URL}/api/admin/applications/{TEST_APP_ID}/status?status=pending",
            headers=admin_headers
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
