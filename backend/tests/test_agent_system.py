"""
Agent/Partner System Tests
Tests for agent registration, activation codes, admin approval, student management, applications, and messages.
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"
AGENT_EMAIL = "agent@test.com"
AGENT_PASSWORD = "Agent2025!"


class TestAgentAuth:
    """Agent authentication and registration tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_admin_token(self):
        """Get admin principal token"""
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert res.status_code == 200, f"Admin login failed: {res.text}"
        return res.json()["access_token"]
    
    def get_agent_token(self):
        """Get approved agent token"""
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": AGENT_EMAIL,
            "password": AGENT_PASSWORD
        })
        assert res.status_code == 200, f"Agent login failed: {res.text}"
        return res.json()["access_token"]
    
    def test_agent_login_success(self):
        """Test agent can login with valid credentials"""
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": AGENT_EMAIL,
            "password": AGENT_PASSWORD
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] == "agent"
        assert data["user"]["email"] == AGENT_EMAIL
        print(f"PASS: Agent login successful, role={data['user']['role']}")
    
    def test_agent_register_invalid_code(self):
        """Test agent registration fails with invalid activation code"""
        res = self.session.post(f"{BASE_URL}/api/auth/register-agent", json={
            "firstName": "Test",
            "lastName": "Agent",
            "email": f"test_invalid_{uuid.uuid4().hex[:8]}@test.com",
            "phone": "123456789",
            "password": "Test2025!",
            "company": "Test Company",
            "activationCode": "INVALID-CODE-123"
        })
        assert res.status_code == 400
        assert "invalide" in res.json()["detail"].lower() or "utilise" in res.json()["detail"].lower()
        print(f"PASS: Registration with invalid code correctly rejected: {res.json()['detail']}")
    
    def test_agent_register_missing_code(self):
        """Test agent registration fails without activation code"""
        res = self.session.post(f"{BASE_URL}/api/auth/register-agent", json={
            "firstName": "Test",
            "lastName": "Agent",
            "email": f"test_nocode_{uuid.uuid4().hex[:8]}@test.com",
            "phone": "123456789",
            "password": "Test2025!",
            "company": "Test Company",
            "activationCode": ""
        })
        # Should fail validation or return 400
        assert res.status_code in [400, 422]
        print(f"PASS: Registration without code correctly rejected")


class TestAgentAccessControl:
    """Test agent access control - unapproved vs approved"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_agent_token(self):
        """Get approved agent token"""
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": AGENT_EMAIL,
            "password": AGENT_PASSWORD
        })
        if res.status_code == 200:
            return res.json()["access_token"]
        return None
    
    def test_approved_agent_can_access_dashboard_stats(self):
        """Test approved agent can access dashboard stats"""
        token = self.get_agent_token()
        assert token, "Agent login failed"
        
        res = self.session.get(
            f"{BASE_URL}/api/agent/dashboard-stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "students" in data
        assert "totalApplications" in data
        assert "pendingApplications" in data
        print(f"PASS: Agent dashboard stats accessible: {data}")
    
    def test_approved_agent_can_access_students(self):
        """Test approved agent can access students endpoint"""
        token = self.get_agent_token()
        assert token, "Agent login failed"
        
        res = self.session.get(
            f"{BASE_URL}/api/agent/students",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        print(f"PASS: Agent students endpoint accessible, count={len(res.json())}")
    
    def test_approved_agent_can_access_applications(self):
        """Test approved agent can access applications endpoint"""
        token = self.get_agent_token()
        assert token, "Agent login failed"
        
        res = self.session.get(
            f"{BASE_URL}/api/agent/applications",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        print(f"PASS: Agent applications endpoint accessible, count={len(res.json())}")
    
    def test_approved_agent_can_access_messages(self):
        """Test approved agent can access messages endpoint"""
        token = self.get_agent_token()
        assert token, "Agent login failed"
        
        res = self.session.get(
            f"{BASE_URL}/api/agent/messages",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        print(f"PASS: Agent messages endpoint accessible, count={len(res.json())}")
    
    def test_non_agent_cannot_access_agent_endpoints(self):
        """Test regular user cannot access agent endpoints"""
        # Login as admin (not agent)
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert res.status_code == 200
        admin_token = res.json()["access_token"]
        
        # Try to access agent endpoint
        res = self.session.get(
            f"{BASE_URL}/api/agent/dashboard-stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 403
        print(f"PASS: Non-agent correctly blocked from agent endpoints")


class TestAgentStudentCRUD:
    """Test agent student CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.created_student_ids = []
    
    def get_agent_token(self):
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": AGENT_EMAIL,
            "password": AGENT_PASSWORD
        })
        if res.status_code == 200:
            return res.json()["access_token"]
        return None
    
    def test_create_student(self):
        """Test agent can create a student"""
        token = self.get_agent_token()
        assert token, "Agent login failed"
        
        student_data = {
            "firstName": "TEST_Jean",
            "lastName": "TEST_Martin",
            "email": f"test_student_{uuid.uuid4().hex[:8]}@test.com",
            "phone": "+33612345678",
            "dateOfBirth": "2000-01-15",
            "nationality": "Francaise",
            "sex": "M",
            "passportNumber": "TEST123456",
            "address": "123 Rue Test, Paris"
        }
        
        res = self.session.post(
            f"{BASE_URL}/api/agent/students",
            json=student_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["firstName"] == student_data["firstName"]
        assert data["lastName"] == student_data["lastName"]
        assert "id" in data
        self.created_student_ids.append(data["id"])
        print(f"PASS: Student created with id={data['id']}")
        
        # Verify with GET
        res = self.session.get(
            f"{BASE_URL}/api/agent/students",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        students = res.json()
        created = next((s for s in students if s["id"] == data["id"]), None)
        assert created is not None
        assert created["firstName"] == student_data["firstName"]
        print(f"PASS: Student verified in list")
        
        return data["id"]
    
    def test_update_student(self):
        """Test agent can update a student"""
        token = self.get_agent_token()
        assert token, "Agent login failed"
        
        # First create a student
        student_data = {
            "firstName": "TEST_Update",
            "lastName": "TEST_Student",
            "email": f"test_update_{uuid.uuid4().hex[:8]}@test.com",
        }
        res = self.session.post(
            f"{BASE_URL}/api/agent/students",
            json=student_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        student_id = res.json()["id"]
        self.created_student_ids.append(student_id)
        
        # Update the student
        update_data = {"firstName": "TEST_Updated", "phone": "+33699999999"}
        res = self.session.put(
            f"{BASE_URL}/api/agent/students/{student_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["firstName"] == "TEST_Updated"
        assert data["phone"] == "+33699999999"
        print(f"PASS: Student updated successfully")
    
    def test_delete_student(self):
        """Test agent can delete a student"""
        token = self.get_agent_token()
        assert token, "Agent login failed"
        
        # First create a student
        student_data = {
            "firstName": "TEST_Delete",
            "lastName": "TEST_Student",
            "email": f"test_delete_{uuid.uuid4().hex[:8]}@test.com",
        }
        res = self.session.post(
            f"{BASE_URL}/api/agent/students",
            json=student_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        student_id = res.json()["id"]
        
        # Delete the student
        res = self.session.delete(
            f"{BASE_URL}/api/agent/students/{student_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        print(f"PASS: Student deleted successfully")
        
        # Verify deletion
        res = self.session.get(
            f"{BASE_URL}/api/agent/students",
            headers={"Authorization": f"Bearer {token}"}
        )
        students = res.json()
        deleted = next((s for s in students if s["id"] == student_id), None)
        assert deleted is None
        print(f"PASS: Student verified as deleted")


class TestAgentApplications:
    """Test agent application submission"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_agent_token(self):
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": AGENT_EMAIL,
            "password": AGENT_PASSWORD
        })
        if res.status_code == 200:
            return res.json()["access_token"]
        return None
    
    def test_get_agent_applications(self):
        """Test agent can get their applications"""
        token = self.get_agent_token()
        assert token, "Agent login failed"
        
        res = self.session.get(
            f"{BASE_URL}/api/agent/applications",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        apps = res.json()
        assert isinstance(apps, list)
        print(f"PASS: Agent applications retrieved, count={len(apps)}")
        
        # Check application structure if any exist
        if apps:
            app = apps[0]
            assert "id" in app
            assert "status" in app
            assert "agentId" in app
            print(f"PASS: Application structure verified: status={app['status']}")
    
    def test_submit_application_for_student(self):
        """Test agent can submit application for their student"""
        token = self.get_agent_token()
        assert token, "Agent login failed"
        
        # Get existing students
        res = self.session.get(
            f"{BASE_URL}/api/agent/students",
            headers={"Authorization": f"Bearer {token}"}
        )
        students = res.json()
        
        if not students:
            # Create a student first
            student_data = {
                "firstName": "TEST_App",
                "lastName": "TEST_Student",
                "email": f"test_app_{uuid.uuid4().hex[:8]}@test.com",
            }
            res = self.session.post(
                f"{BASE_URL}/api/agent/students",
                json=student_data,
                headers={"Authorization": f"Bearer {token}"}
            )
            assert res.status_code == 200
            student_id = res.json()["id"]
        else:
            student_id = students[0]["id"]
        
        # Get an offer
        res = self.session.get(f"{BASE_URL}/api/offers")
        offers = res.json()
        if not offers:
            pytest.skip("No offers available for testing")
        
        offer = offers[0]
        
        # Submit application
        app_data = {
            "studentId": student_id,
            "offerId": offer["id"],
            "offerTitle": offer["title"],
            "termsAccepted": True,
            "additionalPrograms": [],
            "documents": [],
            "paymentMethod": "bank_transfer",
            "paymentProof": "",
            "paymentAmount": 0
        }
        
        res = self.session.post(
            f"{BASE_URL}/api/agent/applications",
            json=app_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Could be 200 (success) or 400 (already applied)
        if res.status_code == 200:
            data = res.json()
            assert "id" in data
            assert data["agentId"] is not None
            assert data["agentStudentId"] == student_id
            print(f"PASS: Application submitted successfully, id={data['id']}")
        elif res.status_code == 400:
            # Already applied - this is expected if test ran before
            assert "deja postule" in res.json()["detail"].lower()
            print(f"PASS: Duplicate application correctly rejected")
        else:
            pytest.fail(f"Unexpected status: {res.status_code} - {res.text}")


class TestAgentMessages:
    """Test agent messaging functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_agent_token(self):
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": AGENT_EMAIL,
            "password": AGENT_PASSWORD
        })
        if res.status_code == 200:
            return res.json()["access_token"]
        return None
    
    def test_send_message(self):
        """Test agent can send a message"""
        token = self.get_agent_token()
        assert token, "Agent login failed"
        
        msg_data = {
            "subject": f"TEST_Message_{uuid.uuid4().hex[:8]}",
            "content": "This is a test message from agent",
            "offerId": None,
            "attachments": []
        }
        
        res = self.session.post(
            f"{BASE_URL}/api/agent/messages",
            json=msg_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["subject"] == msg_data["subject"]
        assert data["senderRole"] == "agent"
        assert "id" in data
        print(f"PASS: Message sent successfully, id={data['id']}")
    
    def test_get_messages(self):
        """Test agent can get their messages"""
        token = self.get_agent_token()
        assert token, "Agent login failed"
        
        res = self.session.get(
            f"{BASE_URL}/api/agent/messages",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        msgs = res.json()
        assert isinstance(msgs, list)
        print(f"PASS: Agent messages retrieved, count={len(msgs)}")


class TestAdminAgentManagement:
    """Test admin agent management endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_admin_token(self):
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if res.status_code == 200:
            return res.json()["access_token"]
        return None
    
    def test_admin_generate_agent_code(self):
        """Test admin can generate activation code"""
        token = self.get_admin_token()
        assert token, "Admin login failed"
        
        res = self.session.post(
            f"{BASE_URL}/api/admin/agent-codes",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "code" in data
        assert data["code"].startswith("AG-")
        assert data["isUsed"] == False
        assert "expiresAt" in data
        print(f"PASS: Agent code generated: {data['code']}")
        return data
    
    def test_admin_list_agent_codes(self):
        """Test admin can list activation codes"""
        token = self.get_admin_token()
        assert token, "Admin login failed"
        
        res = self.session.get(
            f"{BASE_URL}/api/admin/agent-codes",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        codes = res.json()
        assert isinstance(codes, list)
        print(f"PASS: Agent codes listed, count={len(codes)}")
        
        # Verify structure
        if codes:
            code = codes[0]
            assert "code" in code
            assert "isUsed" in code
            assert "createdAt" in code
    
    def test_admin_list_agents(self):
        """Test admin can list all agents"""
        token = self.get_admin_token()
        assert token, "Admin login failed"
        
        res = self.session.get(
            f"{BASE_URL}/api/admin/agents",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        agents = res.json()
        assert isinstance(agents, list)
        print(f"PASS: Agents listed, count={len(agents)}")
        
        # Verify structure and find test agent
        test_agent = next((a for a in agents if a["email"] == AGENT_EMAIL), None)
        if test_agent:
            assert test_agent["role"] == "agent"
            assert "studentsCount" in test_agent
            assert "applicationsCount" in test_agent
            print(f"PASS: Test agent found with {test_agent['studentsCount']} students, {test_agent['applicationsCount']} applications")
    
    def test_admin_approve_agent(self):
        """Test admin can approve an agent (using already approved agent)"""
        token = self.get_admin_token()
        assert token, "Admin login failed"
        
        # Get agents list
        res = self.session.get(
            f"{BASE_URL}/api/admin/agents",
            headers={"Authorization": f"Bearer {token}"}
        )
        agents = res.json()
        test_agent = next((a for a in agents if a["email"] == AGENT_EMAIL), None)
        
        if test_agent:
            # Approve the agent (should work even if already approved)
            res = self.session.put(
                f"{BASE_URL}/api/admin/agents/{test_agent['id']}/approve",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert res.status_code == 200
            print(f"PASS: Agent approval endpoint works")
        else:
            pytest.skip("Test agent not found")
    
    def test_admin_delete_agent_code(self):
        """Test admin can delete an activation code"""
        token = self.get_admin_token()
        assert token, "Admin login failed"
        
        # First generate a code
        res = self.session.post(
            f"{BASE_URL}/api/admin/agent-codes",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        code_id = res.json()["id"]
        
        # Delete it
        res = self.session.delete(
            f"{BASE_URL}/api/admin/agent-codes/{code_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        print(f"PASS: Agent code deleted successfully")
    
    def test_non_principal_admin_cannot_manage_agents(self):
        """Test that non-principal admin cannot access agent management"""
        # Try to login as secondary admin if exists
        res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "secondary@test.com",
            "password": "Test2025!"
        })
        
        if res.status_code != 200:
            pytest.skip("Secondary admin not available for testing")
        
        secondary_token = res.json()["access_token"]
        
        # Try to access agent codes
        res = self.session.get(
            f"{BASE_URL}/api/admin/agent-codes",
            headers={"Authorization": f"Bearer {secondary_token}"}
        )
        assert res.status_code == 403
        print(f"PASS: Secondary admin correctly blocked from agent management")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
