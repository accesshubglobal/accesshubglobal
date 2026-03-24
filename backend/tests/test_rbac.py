"""
RBAC (Role-Based Access Control) Tests
Tests for admin_principal and admin_secondary role permissions
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://access-control-demo-7.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_PRINCIPAL_EMAIL = "admin@winners-consulting.com"
ADMIN_PRINCIPAL_PASSWORD = "Admin2025!"
ADMIN_SECONDARY_EMAIL = "secondary@test.com"
ADMIN_SECONDARY_PASSWORD = "Test2025!"


class TestRBACSetup:
    """Setup and verify test users exist"""
    
    def test_admin_principal_login(self):
        """Test admin_principal can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_PRINCIPAL_EMAIL,
            "password": ADMIN_PRINCIPAL_PASSWORD
        })
        assert response.status_code == 200, f"Admin principal login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] in ("admin", "admin_principal")
        print(f"✓ Admin principal login successful, role: {data['user']['role']}")
    
    def test_admin_secondary_login(self):
        """Test admin_secondary can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_SECONDARY_EMAIL,
            "password": ADMIN_SECONDARY_PASSWORD
        })
        assert response.status_code == 200, f"Admin secondary login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin_secondary"
        print(f"✓ Admin secondary login successful, role: {data['user']['role']}")


class TestAdminPrincipalPermissions:
    """Test that admin_principal has full access"""
    
    @pytest.fixture
    def principal_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_PRINCIPAL_EMAIL,
            "password": ADMIN_PRINCIPAL_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_principal_can_access_users(self, principal_token):
        """Admin principal can access users list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {principal_token}"}
        )
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        print(f"✓ Admin principal can access users ({len(users)} users)")
    
    def test_principal_can_access_payment_settings(self, principal_token):
        """Admin principal can access payment settings"""
        response = requests.get(
            f"{BASE_URL}/api/admin/payment-settings",
            headers={"Authorization": f"Bearer {principal_token}"}
        )
        assert response.status_code == 200
        print("✓ Admin principal can access payment settings")
    
    def test_principal_can_access_banners(self, principal_token):
        """Admin principal can access banners"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-settings/banners",
            headers={"Authorization": f"Bearer {principal_token}"}
        )
        assert response.status_code == 200
        print("✓ Admin principal can access banners")
    
    def test_principal_can_access_offers(self, principal_token):
        """Admin principal can access offers"""
        response = requests.get(
            f"{BASE_URL}/api/admin/offers",
            headers={"Authorization": f"Bearer {principal_token}"}
        )
        assert response.status_code == 200
        print("✓ Admin principal can access offers")
    
    def test_principal_can_access_blog(self, principal_token):
        """Admin principal can access blog"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blog",
            headers={"Authorization": f"Bearer {principal_token}"}
        )
        assert response.status_code == 200
        print("✓ Admin principal can access blog")


class TestAdminSecondaryPermissions:
    """Test that admin_secondary has limited access"""
    
    @pytest.fixture
    def secondary_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_SECONDARY_EMAIL,
            "password": ADMIN_SECONDARY_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def principal_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_PRINCIPAL_EMAIL,
            "password": ADMIN_PRINCIPAL_PASSWORD
        })
        return response.json()["access_token"]
    
    # ===== ALLOWED ENDPOINTS FOR ADMIN_SECONDARY =====
    
    def test_secondary_can_access_offers(self, secondary_token):
        """Admin secondary CAN access offers"""
        response = requests.get(
            f"{BASE_URL}/api/admin/offers",
            headers={"Authorization": f"Bearer {secondary_token}"}
        )
        assert response.status_code == 200
        print("✓ Admin secondary CAN access offers")
    
    def test_secondary_can_access_blog(self, secondary_token):
        """Admin secondary CAN access blog"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blog",
            headers={"Authorization": f"Bearer {secondary_token}"}
        )
        assert response.status_code == 200
        print("✓ Admin secondary CAN access blog")
    
    def test_secondary_can_access_community(self, secondary_token):
        """Admin secondary CAN access community"""
        response = requests.get(
            f"{BASE_URL}/api/admin/community",
            headers={"Authorization": f"Bearer {secondary_token}"}
        )
        assert response.status_code == 200
        print("✓ Admin secondary CAN access community")
    
    def test_secondary_can_access_messages(self, secondary_token):
        """Admin secondary CAN access messages"""
        response = requests.get(
            f"{BASE_URL}/api/admin/messages",
            headers={"Authorization": f"Bearer {secondary_token}"}
        )
        assert response.status_code == 200
        print("✓ Admin secondary CAN access messages")
    
    def test_secondary_can_access_applications(self, secondary_token):
        """Admin secondary CAN access applications"""
        response = requests.get(
            f"{BASE_URL}/api/admin/applications",
            headers={"Authorization": f"Bearer {secondary_token}"}
        )
        assert response.status_code == 200
        print("✓ Admin secondary CAN access applications")
    
    # ===== RESTRICTED ENDPOINTS FOR ADMIN_SECONDARY =====
    
    def test_secondary_cannot_access_payment_settings(self, secondary_token):
        """Admin secondary CANNOT access payment settings (403)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/payment-settings",
            headers={"Authorization": f"Bearer {secondary_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("✓ Admin secondary CANNOT access payment settings (403)")
    
    def test_secondary_cannot_access_banners(self, secondary_token):
        """Admin secondary CANNOT access banners (403)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-settings/banners",
            headers={"Authorization": f"Bearer {secondary_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("✓ Admin secondary CANNOT access banners (403)")
    
    def test_secondary_cannot_set_user_role(self, secondary_token, principal_token):
        """Admin secondary CANNOT change user roles (403)"""
        # First get a user ID to test with
        users_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {principal_token}"}
        )
        users = users_response.json()
        # Find a regular user to test with
        test_user = next((u for u in users if u["role"] == "user"), None)
        
        if test_user:
            response = requests.put(
                f"{BASE_URL}/api/admin/users/{test_user['id']}/set-role?role=admin_secondary",
                headers={"Authorization": f"Bearer {secondary_token}"}
            )
            assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
            print("✓ Admin secondary CANNOT set user role (403)")
        else:
            pytest.skip("No regular user found to test with")
    
    def test_secondary_cannot_delete_user(self, secondary_token, principal_token):
        """Admin secondary CANNOT delete users (403)"""
        # First get a user ID to test with
        users_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {principal_token}"}
        )
        users = users_response.json()
        # Find a regular user to test with
        test_user = next((u for u in users if u["role"] == "user"), None)
        
        if test_user:
            response = requests.delete(
                f"{BASE_URL}/api/admin/users/{test_user['id']}",
                headers={"Authorization": f"Bearer {secondary_token}"}
            )
            assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
            print("✓ Admin secondary CANNOT delete user (403)")
        else:
            pytest.skip("No regular user found to test with")
    
    def test_secondary_cannot_toggle_user_status(self, secondary_token, principal_token):
        """Admin secondary CANNOT toggle user status (403)"""
        # First get a user ID to test with
        users_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {principal_token}"}
        )
        users = users_response.json()
        # Find a regular user to test with
        test_user = next((u for u in users if u["role"] == "user"), None)
        
        if test_user:
            response = requests.put(
                f"{BASE_URL}/api/admin/users/{test_user['id']}/toggle-status",
                headers={"Authorization": f"Bearer {secondary_token}"}
            )
            assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
            print("✓ Admin secondary CANNOT toggle user status (403)")
        else:
            pytest.skip("No regular user found to test with")


class TestRoleChangeByPrincipal:
    """Test that admin_principal can change user roles"""
    
    @pytest.fixture
    def principal_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_PRINCIPAL_EMAIL,
            "password": ADMIN_PRINCIPAL_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_principal_can_set_role_to_admin_secondary(self, principal_token):
        """Admin principal CAN change a user's role to admin_secondary"""
        # Get users list
        users_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {principal_token}"}
        )
        users = users_response.json()
        
        # Find a regular user to test with (not the admin itself)
        test_user = next((u for u in users if u["role"] == "user"), None)
        
        if test_user:
            # Change role to admin_secondary
            response = requests.put(
                f"{BASE_URL}/api/admin/users/{test_user['id']}/set-role?role=admin_secondary",
                headers={"Authorization": f"Bearer {principal_token}"}
            )
            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
            
            # Verify the change
            verify_response = requests.get(
                f"{BASE_URL}/api/admin/users",
                headers={"Authorization": f"Bearer {principal_token}"}
            )
            updated_user = next((u for u in verify_response.json() if u["id"] == test_user["id"]), None)
            
            # Revert back to user role
            requests.put(
                f"{BASE_URL}/api/admin/users/{test_user['id']}/set-role?role=user",
                headers={"Authorization": f"Bearer {principal_token}"}
            )
            
            assert updated_user["role"] == "admin_secondary"
            print("✓ Admin principal CAN set user role to admin_secondary")
        else:
            pytest.skip("No regular user found to test with")
    
    def test_principal_can_set_role_to_admin_principal(self, principal_token):
        """Admin principal CAN change a user's role to admin_principal"""
        # Get users list
        users_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {principal_token}"}
        )
        users = users_response.json()
        
        # Find a regular user to test with
        test_user = next((u for u in users if u["role"] == "user"), None)
        
        if test_user:
            # Change role to admin_principal
            response = requests.put(
                f"{BASE_URL}/api/admin/users/{test_user['id']}/set-role?role=admin_principal",
                headers={"Authorization": f"Bearer {principal_token}"}
            )
            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
            
            # Revert back to user role
            requests.put(
                f"{BASE_URL}/api/admin/users/{test_user['id']}/set-role?role=user",
                headers={"Authorization": f"Bearer {principal_token}"}
            )
            
            print("✓ Admin principal CAN set user role to admin_principal")
        else:
            pytest.skip("No regular user found to test with")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
