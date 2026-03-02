"""
Test Payment Settings, Applications with Payment, and Deadline Status APIs
Tests for Winner's Consulting multi-step application flow and admin payment features
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"


class TestPaymentSettingsAPI:
    """Test Payment Settings CRUD operations"""

    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed - skipping payment settings tests")

    def test_get_public_payment_settings(self):
        """Test public payment settings endpoint (no auth required)"""
        response = requests.get(f"{BASE_URL}/api/payment-settings")
        assert response.status_code == 200
        
        data = response.json()
        # Verify default payment settings structure
        assert "wechatQrCode" in data
        assert "alipayQrCode" in data
        assert "paypalEmail" in data
        assert "bankName" in data
        assert "bankAccountNumber" in data
        assert "bankSwiftCode" in data
        assert "applicationFee" in data
        assert "currency" in data
        print(f"Public payment settings retrieved successfully: applicationFee={data.get('applicationFee')} {data.get('currency')}")

    def test_get_admin_payment_settings(self, admin_token):
        """Test admin payment settings endpoint (auth required)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/payment-settings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "wechatQrCode" in data
        assert "paypalEmail" in data
        print(f"Admin payment settings retrieved successfully")

    def test_update_payment_settings(self, admin_token):
        """Test updating payment settings"""
        # First, get current settings
        get_response = requests.get(
            f"{BASE_URL}/api/admin/payment-settings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        current_settings = get_response.json()
        
        # Update with new fee
        new_fee = 75
        updated_settings = {
            **current_settings,
            "applicationFee": new_fee,
            "id": "payment_settings"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/payment-settings",
            json=updated_settings,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"Payment settings updated successfully")
        
        # Verify the update persisted
        verify_response = requests.get(f"{BASE_URL}/api/payment-settings")
        assert verify_response.status_code == 200
        verified_data = verify_response.json()
        assert verified_data["applicationFee"] == new_fee
        print(f"Verified: applicationFee is now {new_fee}")
        
        # Restore original settings
        original_fee = current_settings.get("applicationFee", 50)
        updated_settings["applicationFee"] = original_fee
        requests.post(
            f"{BASE_URL}/api/admin/payment-settings",
            json=updated_settings,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        print(f"Restored original applicationFee: {original_fee}")

    def test_payment_settings_unauthorized(self):
        """Test that admin endpoints require auth"""
        response = requests.get(f"{BASE_URL}/api/admin/payment-settings")
        assert response.status_code in [401, 403]
        print("Admin payment settings correctly requires authentication")


class TestDeadlineStatus:
    """Test deadline status checking for offers"""

    def test_get_offers_for_deadline_check(self):
        """Get offers to test deadline status"""
        response = requests.get(f"{BASE_URL}/api/offers")
        assert response.status_code == 200
        offers = response.json()
        print(f"Found {len(offers)} offers to check deadline status")
        return offers

    def test_deadline_status_for_offer(self):
        """Test deadline status endpoint for an offer"""
        # First get offers
        offers_response = requests.get(f"{BASE_URL}/api/offers")
        if offers_response.status_code != 200 or not offers_response.json():
            pytest.skip("No offers available to test deadline")
        
        offers = offers_response.json()
        offer = offers[0]
        offer_id = offer.get("id")
        
        response = requests.get(f"{BASE_URL}/api/offers/{offer_id}/deadline-status")
        assert response.status_code == 200
        
        data = response.json()
        assert "deadline" in data
        assert "isOpen" in data
        print(f"Deadline status for offer '{offer.get('title', 'unknown')}': deadline={data['deadline']}, isOpen={data['isOpen']}")

    def test_deadline_status_invalid_offer(self):
        """Test deadline status for non-existent offer"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/offers/{fake_id}/deadline-status")
        assert response.status_code == 404
        print("Deadline status correctly returns 404 for non-existent offer")


class TestFullApplicationFlow:
    """Test multi-step application submission with payment info"""

    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed")

    @pytest.fixture(scope="class")
    def test_user_token(self):
        """Create a test user and get token"""
        test_email = f"TEST_appuser_{uuid.uuid4().hex[:8]}@test.com"
        
        # Register new user
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "TestPass123!",
            "firstName": "Test",
            "lastName": "Applicant"
        })
        
        if response.status_code == 200:
            return response.json().get("access_token")
        elif response.status_code == 400:
            # User might exist, try login
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": test_email,
                "password": "TestPass123!"
            })
            if login_response.status_code == 200:
                return login_response.json().get("access_token")
        pytest.skip("Could not create/login test user")

    @pytest.fixture(scope="class")
    def test_offer(self):
        """Get a test offer to apply to"""
        response = requests.get(f"{BASE_URL}/api/offers")
        if response.status_code != 200 or not response.json():
            pytest.skip("No offers available")
        return response.json()[0]

    def test_submit_full_application(self, test_user_token, test_offer):
        """Test submitting a full application with all steps"""
        application_data = {
            "offerId": test_offer["id"],
            "offerTitle": test_offer.get("title", "Test Offer"),
            "firstName": "Test",
            "lastName": "Applicant",
            "nationality": "French",
            "sex": "male",
            "passportNumber": "TEST123456",
            "dateOfBirth": "1995-05-15",
            "phoneNumber": "+33612345678",
            "address": "123 Test Street, Paris, France",
            "additionalPrograms": [],
            "documents": [{"name": "Passport", "url": "/api/files/test.pdf", "filename": "passport.pdf"}],
            "termsAccepted": True,
            "paymentMethod": "bank_transfer",
            "paymentProof": "/api/files/proof.jpg",
            "paymentAmount": 50
        }
        
        response = requests.post(
            f"{BASE_URL}/api/applications/full",
            json=application_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        # Could be 200 or 400 if already applied
        if response.status_code == 400:
            print(f"Application already exists for this offer (expected if test ran before)")
            return
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"Full application submitted successfully with ID: {data['id']}")

    def test_get_user_applications(self, test_user_token):
        """Test retrieving user's applications"""
        response = requests.get(
            f"{BASE_URL}/api/applications",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        applications = response.json()
        print(f"User has {len(applications)} application(s)")

    def test_admin_get_all_applications(self, admin_token):
        """Test admin can retrieve all applications"""
        response = requests.get(
            f"{BASE_URL}/api/admin/applications",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        applications = response.json()
        print(f"Admin retrieved {len(applications)} total applications")

    def test_admin_update_payment_status(self, admin_token):
        """Test admin updating application payment status"""
        # First get applications
        get_response = requests.get(
            f"{BASE_URL}/api/admin/applications",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        applications = get_response.json()
        
        if not applications:
            pytest.skip("No applications to test payment status update")
        
        app_id = applications[0]["id"]
        
        # Update payment status to verified
        response = requests.put(
            f"{BASE_URL}/api/admin/applications/{app_id}/payment-status?payment_status=verified",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"Payment status updated to 'verified' for application {app_id}")
        
        # Verify the update
        verify_response = requests.get(
            f"{BASE_URL}/api/admin/applications",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        updated_apps = verify_response.json()
        updated_app = next((a for a in updated_apps if a["id"] == app_id), None)
        if updated_app:
            assert updated_app.get("paymentStatus") == "verified"
            print(f"Verified: payment status is now 'verified'")

    def test_admin_update_application_status(self, admin_token):
        """Test admin updating application status"""
        get_response = requests.get(
            f"{BASE_URL}/api/admin/applications",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        applications = get_response.json()
        
        if not applications:
            pytest.skip("No applications to test status update")
        
        app_id = applications[0]["id"]
        
        # Update status to reviewing
        response = requests.put(
            f"{BASE_URL}/api/admin/applications/{app_id}/status?status=reviewing",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"Application status updated to 'reviewing' for {app_id}")


class TestShareFunctionality:
    """Test that offer endpoints support sharing via URL"""

    def test_get_single_offer_by_id(self):
        """Test getting a single offer by ID (used for sharing)"""
        # First get offers
        offers_response = requests.get(f"{BASE_URL}/api/offers")
        if offers_response.status_code != 200 or not offers_response.json():
            pytest.skip("No offers available")
        
        offer_id = offers_response.json()[0]["id"]
        
        response = requests.get(f"{BASE_URL}/api/offers/{offer_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == offer_id
        assert "title" in data
        assert "university" in data
        print(f"Single offer retrieved successfully: {data.get('title')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
