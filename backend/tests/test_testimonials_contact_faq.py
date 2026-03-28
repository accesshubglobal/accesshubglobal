"""
Test suite for 3 new features:
1. Testimonials - users submit, admin approve/reject/delete
2. Contact Form - public submission (no auth required)
3. FAQ Management - admin CRUD operations
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://accesshub-cms.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

# Test credentials
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"

# Test user for testimonial submission
TEST_USER_EMAIL = f"test_testimonial_{uuid.uuid4().hex[:8]}@test.com"
TEST_USER_PASSWORD = "TestPass123!"


class TestSetup:
    """Setup fixtures for tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        """Get admin headers with auth token"""
        return {"Authorization": f"Bearer {admin_token}"}
    
    @pytest.fixture(scope="class")
    def test_user_token(self):
        """Create a test user and get token"""
        # Register new user
        response = requests.post(f"{API}/auth/register", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "firstName": "Test",
            "lastName": "Testimonial"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        elif response.status_code == 400 and "déjà utilisé" in response.text:
            # User exists, login instead
            response = requests.post(f"{API}/auth/login", json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            })
            assert response.status_code == 200, f"Test user login failed: {response.text}"
            return response.json()["access_token"]
        else:
            pytest.fail(f"Failed to create test user: {response.text}")
    
    @pytest.fixture(scope="class")
    def user_headers(self, test_user_token):
        """Get user headers with auth token"""
        return {"Authorization": f"Bearer {test_user_token}"}


class TestPublicTestimonials(TestSetup):
    """Test public testimonials endpoint (GET /api/testimonials)"""
    
    def test_get_testimonials_public(self):
        """GET /api/testimonials - returns approved testimonials (no auth required)"""
        response = requests.get(f"{API}/testimonials")
        assert response.status_code == 200, f"Failed to get testimonials: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # All returned testimonials should be approved
        for t in data:
            assert t.get("status") == "approved", f"Non-approved testimonial returned: {t}"
        print(f"GET /api/testimonials: {len(data)} approved testimonials returned")


class TestUserTestimonials(TestSetup):
    """Test user testimonial submission (requires auth)"""
    
    def test_submit_testimonial_without_auth(self):
        """POST /api/testimonials - requires authentication"""
        response = requests.post(f"{API}/testimonials", json={
            "text": "Test testimonial",
            "program": "Test Program",
            "rating": 5
        })
        assert response.status_code in [401, 403], f"Should require auth: {response.status_code}"
        print("POST /api/testimonials without auth: correctly returns 401/403")
    
    def test_submit_testimonial_with_auth(self, user_headers):
        """POST /api/testimonials - user submits a testimonial (requires auth)"""
        response = requests.post(f"{API}/testimonials", json={
            "text": "TEST_Great experience with Winner's Consulting! Highly recommended.",
            "program": "TEST_Master en Commerce - Université de Pékin",
            "rating": 5
        }, headers=user_headers)
        
        # Could be 200 (success) or 400 (already submitted)
        if response.status_code == 200:
            data = response.json()
            assert "id" in data or "message" in data, "Response should contain id or message"
            print(f"POST /api/testimonials: Testimonial submitted successfully")
        elif response.status_code == 400:
            # User already has a pending/approved testimonial
            assert "deja soumis" in response.text.lower() or "already" in response.text.lower(), f"Unexpected error: {response.text}"
            print("POST /api/testimonials: User already has a testimonial (expected)")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}, {response.text}")
    
    def test_get_my_testimonial(self, user_headers):
        """GET /api/testimonials/mine - user checks their testimonial (requires auth)"""
        response = requests.get(f"{API}/testimonials/mine", headers=user_headers)
        assert response.status_code == 200, f"Failed to get my testimonial: {response.text}"
        data = response.json()
        # Could be null if no testimonial, or the testimonial object
        if data:
            assert "text" in data, "Testimonial should have text field"
            assert "status" in data, "Testimonial should have status field"
            print(f"GET /api/testimonials/mine: Found testimonial with status '{data.get('status')}'")
        else:
            print("GET /api/testimonials/mine: No testimonial found (null response)")


class TestAdminTestimonials(TestSetup):
    """Test admin testimonial management"""
    
    def test_admin_get_all_testimonials(self, admin_headers):
        """GET /api/admin/testimonials - admin lists all testimonials"""
        response = requests.get(f"{API}/admin/testimonials", headers=admin_headers)
        assert response.status_code == 200, f"Failed to get admin testimonials: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"GET /api/admin/testimonials: {len(data)} total testimonials")
        return data
    
    def test_admin_approve_testimonial(self, admin_headers):
        """PUT /api/admin/testimonials/{id}/approve - admin approves testimonial"""
        # First get all testimonials
        response = requests.get(f"{API}/admin/testimonials", headers=admin_headers)
        testimonials = response.json()
        
        # Find a pending testimonial to approve
        pending = [t for t in testimonials if t.get("status") == "pending"]
        if pending:
            test_id = pending[0]["id"]
            response = requests.put(f"{API}/admin/testimonials/{test_id}/approve", headers=admin_headers)
            assert response.status_code == 200, f"Failed to approve testimonial: {response.text}"
            print(f"PUT /api/admin/testimonials/{test_id}/approve: Success")
        else:
            print("No pending testimonials to approve (skipping)")
    
    def test_admin_reject_testimonial(self, admin_headers):
        """PUT /api/admin/testimonials/{id}/reject - admin rejects testimonial"""
        # First get all testimonials
        response = requests.get(f"{API}/admin/testimonials", headers=admin_headers)
        testimonials = response.json()
        
        # Find a pending or approved testimonial to reject (for testing)
        candidates = [t for t in testimonials if t.get("status") in ["pending", "approved"] and "TEST_" in t.get("text", "")]
        if candidates:
            test_id = candidates[0]["id"]
            response = requests.put(f"{API}/admin/testimonials/{test_id}/reject", headers=admin_headers)
            assert response.status_code == 200, f"Failed to reject testimonial: {response.text}"
            print(f"PUT /api/admin/testimonials/{test_id}/reject: Success")
        else:
            print("No test testimonials to reject (skipping)")
    
    def test_admin_delete_testimonial(self, admin_headers):
        """DELETE /api/admin/testimonials/{id} - admin deletes testimonial"""
        # First get all testimonials
        response = requests.get(f"{API}/admin/testimonials", headers=admin_headers)
        testimonials = response.json()
        
        # Find a TEST_ testimonial to delete
        test_testimonials = [t for t in testimonials if "TEST_" in t.get("text", "") or "TEST_" in t.get("program", "")]
        if test_testimonials:
            test_id = test_testimonials[0]["id"]
            response = requests.delete(f"{API}/admin/testimonials/{test_id}", headers=admin_headers)
            assert response.status_code == 200, f"Failed to delete testimonial: {response.text}"
            print(f"DELETE /api/admin/testimonials/{test_id}: Success")
        else:
            print("No TEST_ testimonials to delete (skipping)")


class TestContactForm(TestSetup):
    """Test contact form submission (no auth required)"""
    
    def test_submit_contact_form_public(self):
        """POST /api/contact - public contact form submission (no auth required)"""
        test_data = {
            "name": "TEST_Contact User",
            "email": f"test_contact_{uuid.uuid4().hex[:8]}@test.com",
            "phone": "+1234567890",
            "service": "china",
            "message": "TEST_This is a test contact message from automated testing."
        }
        response = requests.post(f"{API}/contact", json=test_data)
        assert response.status_code == 200, f"Failed to submit contact form: {response.text}"
        data = response.json()
        assert "message" in data, "Response should contain message"
        print(f"POST /api/contact: Contact form submitted successfully")
    
    def test_submit_contact_form_minimal(self):
        """POST /api/contact - minimal required fields"""
        test_data = {
            "name": "TEST_Minimal Contact",
            "email": f"test_minimal_{uuid.uuid4().hex[:8]}@test.com",
            "message": "TEST_Minimal contact message"
        }
        response = requests.post(f"{API}/contact", json=test_data)
        assert response.status_code == 200, f"Failed to submit minimal contact: {response.text}"
        print("POST /api/contact (minimal): Success")
    
    def test_submit_contact_form_invalid_email(self):
        """POST /api/contact - invalid email should fail"""
        test_data = {
            "name": "Test User",
            "email": "invalid-email",
            "message": "Test message"
        }
        response = requests.post(f"{API}/contact", json=test_data)
        assert response.status_code == 422, f"Should reject invalid email: {response.status_code}"
        print("POST /api/contact (invalid email): Correctly rejected")


class TestAdminContacts(TestSetup):
    """Test admin contact message management"""
    
    def test_admin_get_contacts(self, admin_headers):
        """GET /api/admin/contacts - admin lists contact messages"""
        response = requests.get(f"{API}/admin/contacts", headers=admin_headers)
        assert response.status_code == 200, f"Failed to get contacts: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"GET /api/admin/contacts: {len(data)} contact messages")
        return data
    
    def test_admin_mark_contact_read(self, admin_headers):
        """PUT /api/admin/contacts/{id}/read - admin marks contact as read"""
        # First get all contacts
        response = requests.get(f"{API}/admin/contacts", headers=admin_headers)
        contacts = response.json()
        
        # Find an unread contact
        unread = [c for c in contacts if not c.get("isRead")]
        if unread:
            test_id = unread[0]["id"]
            response = requests.put(f"{API}/admin/contacts/{test_id}/read", headers=admin_headers)
            assert response.status_code == 200, f"Failed to mark contact as read: {response.text}"
            print(f"PUT /api/admin/contacts/{test_id}/read: Success")
        else:
            print("No unread contacts to mark (skipping)")
    
    def test_admin_delete_contact(self, admin_headers):
        """DELETE /api/admin/contacts/{id} - admin deletes contact message"""
        # First get all contacts
        response = requests.get(f"{API}/admin/contacts", headers=admin_headers)
        contacts = response.json()
        
        # Find a TEST_ contact to delete
        test_contacts = [c for c in contacts if "TEST_" in c.get("name", "") or "TEST_" in c.get("message", "")]
        if test_contacts:
            test_id = test_contacts[0]["id"]
            response = requests.delete(f"{API}/admin/contacts/{test_id}", headers=admin_headers)
            assert response.status_code == 200, f"Failed to delete contact: {response.text}"
            print(f"DELETE /api/admin/contacts/{test_id}: Success")
        else:
            print("No TEST_ contacts to delete (skipping)")


class TestPublicFAQ(TestSetup):
    """Test public FAQ endpoint"""
    
    def test_get_faqs_public(self):
        """GET /api/faqs - public FAQ list"""
        response = requests.get(f"{API}/faqs")
        assert response.status_code == 200, f"Failed to get FAQs: {response.text}"
        data = response.json()
        assert "faqs" in data, "Response should contain 'faqs' key"
        assert isinstance(data["faqs"], list), "FAQs should be a list"
        print(f"GET /api/faqs: {len(data['faqs'])} FAQs returned")


class TestAdminFAQ(TestSetup):
    """Test admin FAQ management"""
    
    def test_admin_get_faqs(self, admin_headers):
        """GET /api/admin/faqs - admin gets FAQ list"""
        response = requests.get(f"{API}/admin/faqs", headers=admin_headers)
        assert response.status_code == 200, f"Failed to get admin FAQs: {response.text}"
        data = response.json()
        assert "faqs" in data, "Response should contain 'faqs' key"
        print(f"GET /api/admin/faqs: {len(data['faqs'])} FAQs")
    
    def test_admin_save_faqs(self, admin_headers):
        """POST /api/admin/faqs - admin saves FAQ list"""
        # First get existing FAQs
        response = requests.get(f"{API}/admin/faqs", headers=admin_headers)
        existing_faqs = response.json().get("faqs", [])
        
        # Add a test FAQ
        test_faq = {
            "id": f"test_faq_{uuid.uuid4().hex[:8]}",
            "question": "TEST_Question: How do I apply for a scholarship?",
            "answer": "TEST_Answer: You can apply through our platform by creating an account and submitting your application."
        }
        
        new_faqs = existing_faqs + [test_faq]
        
        response = requests.post(f"{API}/admin/faqs", json={"faqs": new_faqs}, headers=admin_headers)
        assert response.status_code == 200, f"Failed to save FAQs: {response.text}"
        print("POST /api/admin/faqs: FAQs saved successfully")
        
        # Verify the FAQ was added
        response = requests.get(f"{API}/admin/faqs", headers=admin_headers)
        updated_faqs = response.json().get("faqs", [])
        test_faq_found = any("TEST_Question" in f.get("question", "") for f in updated_faqs)
        assert test_faq_found, "Test FAQ should be in the list"
        print("POST /api/admin/faqs: Verified FAQ was added")
    
    def test_admin_update_faqs_remove_test(self, admin_headers):
        """POST /api/admin/faqs - admin removes test FAQs"""
        # Get current FAQs
        response = requests.get(f"{API}/admin/faqs", headers=admin_headers)
        current_faqs = response.json().get("faqs", [])
        
        # Remove TEST_ FAQs
        cleaned_faqs = [f for f in current_faqs if "TEST_" not in f.get("question", "") and "TEST_" not in f.get("answer", "")]
        
        response = requests.post(f"{API}/admin/faqs", json={"faqs": cleaned_faqs}, headers=admin_headers)
        assert response.status_code == 200, f"Failed to clean FAQs: {response.text}"
        print("POST /api/admin/faqs: Test FAQs cleaned up")


class TestAuthorizationChecks(TestSetup):
    """Test that admin endpoints require proper authorization"""
    
    def test_admin_testimonials_requires_auth(self):
        """Admin testimonials endpoint requires authentication"""
        response = requests.get(f"{API}/admin/testimonials")
        assert response.status_code in [401, 403], f"Should require auth: {response.status_code}"
        print("GET /api/admin/testimonials: Correctly requires auth")
    
    def test_admin_contacts_requires_auth(self):
        """Admin contacts endpoint requires authentication"""
        response = requests.get(f"{API}/admin/contacts")
        assert response.status_code in [401, 403], f"Should require auth: {response.status_code}"
        print("GET /api/admin/contacts: Correctly requires auth")
    
    def test_admin_faqs_requires_auth(self):
        """Admin FAQs endpoint requires authentication"""
        response = requests.get(f"{API}/admin/faqs")
        assert response.status_code in [401, 403], f"Should require auth: {response.status_code}"
        print("GET /api/admin/faqs: Correctly requires auth")
    
    def test_admin_faqs_post_requires_auth(self):
        """Admin FAQs POST endpoint requires authentication"""
        response = requests.post(f"{API}/admin/faqs", json={"faqs": []})
        assert response.status_code in [401, 403], f"Should require auth: {response.status_code}"
        print("POST /api/admin/faqs: Correctly requires auth")


class TestCleanup(TestSetup):
    """Cleanup test data"""
    
    def test_cleanup_test_contacts(self, admin_headers):
        """Clean up TEST_ contact messages"""
        response = requests.get(f"{API}/admin/contacts", headers=admin_headers)
        contacts = response.json()
        
        deleted = 0
        for c in contacts:
            if "TEST_" in c.get("name", "") or "TEST_" in c.get("message", ""):
                requests.delete(f"{API}/admin/contacts/{c['id']}", headers=admin_headers)
                deleted += 1
        
        print(f"Cleanup: Deleted {deleted} TEST_ contact messages")
    
    def test_cleanup_test_testimonials(self, admin_headers):
        """Clean up TEST_ testimonials"""
        response = requests.get(f"{API}/admin/testimonials", headers=admin_headers)
        testimonials = response.json()
        
        deleted = 0
        for t in testimonials:
            if "TEST_" in t.get("text", "") or "TEST_" in t.get("program", ""):
                requests.delete(f"{API}/admin/testimonials/{t['id']}", headers=admin_headers)
                deleted += 1
        
        print(f"Cleanup: Deleted {deleted} TEST_ testimonials")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
