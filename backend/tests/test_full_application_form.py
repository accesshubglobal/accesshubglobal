"""
Test Full Application Form - 11 sections with new extended fields
Tests POST /api/applications/full endpoint with all new fields:
- Personal Info (countryOfBirth, placeOfBirth, nativeLanguage, religion, maritalStatus, etc.)
- Home Address, Current Address
- Health Status (bloodGroup, height, weight)
- China Status (inChinaNow, chinaSchool, etc.)
- Passport Information
- Educational Background (list of dicts)
- Work Experience (list of dicts)
- Family Information (fatherInfo, motherInfo, spouseInfo)
- Financial Sponsor
- Emergency Contact in China
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"

# Test user credentials (will be created if not exists)
TEST_USER_EMAIL = f"TEST_appform_{uuid.uuid4().hex[:8]}@test.com"
TEST_USER_PASSWORD = "Test2025!"
TEST_USER_FIRST = "TestPrénom"
TEST_USER_LAST = "TestNom"

# First offer ID to use for testing
OFFER_ID = "2b10b4a7-e524-47ae-a789-cb0b65e18056"
OFFER_TITLE = "Architecture et Design"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json().get("access_token")


@pytest.fixture(scope="module")
def user_token():
    """Register a test user and return token"""
    # Register test user
    reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
        "firstName": TEST_USER_FIRST,
        "lastName": TEST_USER_LAST
    })
    if reg_response.status_code in [200, 201]:
        token = reg_response.json().get("access_token")
        if token:
            return token

    # Try login if already registered
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    })
    if login_response.status_code == 200:
        return login_response.json().get("access_token")

    pytest.skip(f"Could not create/login test user: {reg_response.text}")


# Full application payload with all 11 sections
def build_full_payload(offer_id=OFFER_ID, offer_title=OFFER_TITLE):
    return {
        # Step identifiers
        "offerId": offer_id,
        "offerTitle": offer_title,
        # 1. Personal Information
        "firstName": "Jean",
        "lastName": "Dupont",
        "sex": "male",
        "nationality": "Camerounais",
        "countryOfBirth": "Cameroun",
        "placeOfBirth": "Yaoundé, Centre",
        "nativeLanguage": "Français",
        "religion": "christian",
        "maritalStatus": "single",
        "occupation": "Etudiant",
        "hobby": "Lecture, Sport",
        "highestEducation": "bachelor",
        "majorInChina": "Médecine",
        "currentEmployer": "Université de Yaoundé",
        "personalEmail": "jean.dupont@example.com",
        "dateOfBirth": "2000-01-15",
        "phoneNumber": "+237600000001",
        # 2. Home Address
        "address": "Rue 1234, Yaoundé, Cameroun",
        "addressDetailed": "Quartier Bastos, Appartement 5",
        "addressPhone": "+237600000002",
        "zipCode": "BP 1234",
        # 3. Current Address
        "currentAddress": "Rue 5678, Douala, Cameroun",
        "currentAddressDetailed": "Quartier Bonanjo",
        "currentAddressPhone": "+237600000003",
        "currentAddressZipCode": "BP 5678",
        # 4. Health Status
        "bloodGroup": "A+",
        "height": "175 cm",
        "weight": "70 kg",
        # 5. China Status
        "inChinaNow": False,
        "chinaSchool": "",
        "chinaLearningPeriodStart": "",
        "chinaLearningPeriodEnd": "",
        "chinaVisaType": "",
        "chinaVisaNo": "",
        "chinaVisaExpiry": "",
        # 6. Passport
        "passportNumber": "AB123456",
        "passportIssuedDate": "2020-01-01",
        "passportExpiryDate": "2030-01-01",
        "oldPassportNo": "",
        "oldPassportIssuedDate": "",
        "oldPassportExpiryDate": "",
        # 7. Educational Background (3 schools)
        "educationalBackground": [
            {"instituteName": "Lycée de Yaoundé", "educationLevel": "high_school", "fieldOfStudy": "Sciences", "yearsFrom": "2015-09-01", "yearsTo": "2018-06-30"},
            {"instituteName": "Université de Yaoundé I", "educationLevel": "bachelor", "fieldOfStudy": "Biologie", "yearsFrom": "2018-09-01", "yearsTo": "2021-06-30"},
            {"instituteName": "", "educationLevel": "", "fieldOfStudy": "", "yearsFrom": "", "yearsTo": ""}
        ],
        # 8. Work Experience (2 entries)
        "workExperience": [
            {"companyName": "Hôpital Central Yaoundé", "position": "Stagiaire", "industryType": "Santé", "yearsFrom": "2021-07-01", "yearsTo": "2022-06-30", "contactPerson": "Dr. Martin", "contactPhone": "+237600000010", "contactEmail": "martin@hospital.cm"},
            {"companyName": "", "position": "", "industryType": "", "yearsFrom": "", "yearsTo": "", "contactPerson": "", "contactPhone": "", "contactEmail": ""}
        ],
        # 9. Family Information
        "fatherInfo": {"name": "Pierre Dupont", "nationality": "Camerounais", "dob": "1965-03-20", "idNo": "123456789", "mobile": "+237600000004", "email": "pierre@example.com", "occupation": "Enseignant", "employer": "Lycée de Yaoundé"},
        "motherInfo": {"name": "Marie Dupont", "nationality": "Camerounaise", "dob": "1968-07-15", "idNo": "987654321", "mobile": "+237600000005", "email": "marie@example.com", "occupation": "Infirmière", "employer": "CHU Yaoundé"},
        "spouseInfo": {"name": "", "nationality": "", "dob": "", "idNo": "", "mobile": "", "email": "", "occupation": "", "employer": ""},
        # 10. Financial Sponsor
        "financialSponsor": {"relationship": "Père", "address": "Rue 1234, Yaoundé, Cameroun"},
        # 11. Emergency Contact in China
        "emergencyContact": {"name": "Liu Wei", "relationship": "Ami de famille", "occupation": "Professeur", "nationality": "Chinois", "idNo": "CN123456789", "employer": "Université de Pékin", "addressChina": "123 Wudaokou, Beijing", "phone": "+8613800000001", "email": "liu.wei@pku.edu.cn"},
        # Application data
        "additionalPrograms": [],
        "documents": [{"name": "Passeport", "url": "https://example.com/passeport.pdf", "filename": "passeport.pdf"}],
        "termsAccepted": True,
        "paymentMethod": "bank_transfer",
        "paymentProof": "https://example.com/proof.jpg",
        "paymentAmount": 50.0
    }


class TestFullApplicationEndpoint:
    """Tests for POST /api/applications/full with all new fields"""

    def test_health_check(self):
        """Verify backend is accessible"""
        response = requests.get(f"{BASE_URL}/api/payment-settings")
        assert response.status_code == 200
        print("Backend is accessible")

    def test_create_full_application_with_all_fields(self, user_token):
        """Test creating a full application with all 11 sections"""
        payload = build_full_payload()
        response = requests.post(
            f"{BASE_URL}/api/applications/full",
            json=payload,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert "id" in data, "Response should contain application id"
        assert "message" in data
        print(f"Full application created: id={data['id']}, message={data['message']}")
        return data["id"]

    def test_full_application_requires_auth(self):
        """Test that unauthenticated request is rejected"""
        payload = build_full_payload()
        response = requests.post(f"{BASE_URL}/api/applications/full", json=payload)
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("Unauthenticated request correctly rejected")

    def test_full_application_missing_required_fields(self, user_token):
        """Test that missing required fields return 422"""
        # Missing firstName, lastName, passportNumber, etc.
        incomplete_payload = {
            "offerId": "some-offer-id",
            "offerTitle": "Test Offer",
            "termsAccepted": True,
            "paymentMethod": "bank_transfer",
            "paymentProof": "https://example.com/proof.jpg",
            "paymentAmount": 50.0
        }
        response = requests.post(
            f"{BASE_URL}/api/applications/full",
            json=incomplete_payload,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}: {response.text}"
        print("Missing required fields correctly rejected with 422")

    def test_full_application_data_persisted(self, user_token, admin_token):
        """Test that all fields from the full application are persisted correctly"""
        # Create a new application with a different offer to avoid duplicate
        different_offer_id = "494ac13d-4504-4fb8-80d0-cbc989f43dba"  # Commerce et Marketing
        different_offer_title = "Commerce et Marketing"
        payload = build_full_payload(different_offer_id, different_offer_title)

        create_response = requests.post(
            f"{BASE_URL}/api/applications/full",
            json=payload,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        if create_response.status_code == 400 and "déjà postulé" in create_response.text:
            pytest.skip("User already applied to this offer - skipping persistence test")

        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        app_id = create_response.json()["id"]

        # Retrieve the application using user's own token (user can access own application)
        # NOTE: Admin token fails because GET /applications/{id} checks role=="admin"
        # but admin has role "admin_principal" — this is a known bug to report
        get_response = requests.get(
            f"{BASE_URL}/api/applications/{app_id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert get_response.status_code == 200, f"Get failed: {get_response.text}"
        data = get_response.json()

        # Verify all new fields are correctly persisted
        # Section 1: Personal Info
        assert data.get("firstName") == "Jean", f"firstName mismatch: {data.get('firstName')}"
        assert data.get("lastName") == "Dupont", f"lastName mismatch: {data.get('lastName')}"
        assert data.get("countryOfBirth") == "Cameroun", f"countryOfBirth mismatch: {data.get('countryOfBirth')}"
        assert data.get("placeOfBirth") == "Yaoundé, Centre", f"placeOfBirth mismatch"
        assert data.get("nativeLanguage") == "Français", f"nativeLanguage mismatch"
        assert data.get("religion") == "christian", f"religion mismatch"
        assert data.get("maritalStatus") == "single", f"maritalStatus mismatch"
        assert data.get("hobby") == "Lecture, Sport", f"hobby mismatch"

        # Section 4: Health
        assert data.get("bloodGroup") == "A+", f"bloodGroup mismatch: {data.get('bloodGroup')}"
        assert data.get("height") == "175 cm", f"height mismatch"
        assert data.get("weight") == "70 kg", f"weight mismatch"

        # Section 5: China Status
        assert data.get("inChinaNow") == False, f"inChinaNow mismatch"

        # Section 7: Educational Background
        edu = data.get("educationalBackground", [])
        assert len(edu) >= 1, "Educational background should have at least 1 entry"
        assert edu[0].get("instituteName") == "Lycée de Yaoundé", f"edu instituteName mismatch: {edu[0]}"
        assert edu[0].get("educationLevel") == "high_school", f"edu level mismatch"
        print(f"Educational background verified: {len(edu)} entries")

        # Section 8: Work Experience
        work = data.get("workExperience", [])
        assert len(work) >= 1, "Work experience should have at least 1 entry"
        assert work[0].get("companyName") == "Hôpital Central Yaoundé", f"work companyName mismatch: {work[0]}"
        print(f"Work experience verified: {len(work)} entries")

        # Section 9: Family Information
        father = data.get("fatherInfo", {})
        assert father.get("name") == "Pierre Dupont", f"fatherInfo name mismatch: {father}"
        mother = data.get("motherInfo", {})
        assert mother.get("name") == "Marie Dupont", f"motherInfo name mismatch: {mother}"
        print(f"Family info verified: father={father.get('name')}, mother={mother.get('name')}")

        # Section 10: Financial Sponsor
        sponsor = data.get("financialSponsor", {})
        assert sponsor.get("relationship") == "Père", f"financialSponsor relationship mismatch: {sponsor}"
        print(f"Financial sponsor verified: relationship={sponsor.get('relationship')}")

        # Section 11: Emergency Contact
        emergency = data.get("emergencyContact", {})
        assert emergency.get("name") == "Liu Wei", f"emergencyContact name mismatch: {emergency}"
        assert emergency.get("nationality") == "Chinois", f"emergencyContact nationality mismatch"
        print(f"Emergency contact verified: name={emergency.get('name')}")

        print(f"All 11 sections data persistence verified for application {app_id}")

    def test_duplicate_application_rejected(self, user_token):
        """Test that duplicate application (same user + offer) is rejected"""
        # Use the same offer as the first test (already applied)
        payload = build_full_payload()  # Uses OFFER_ID
        response = requests.post(
            f"{BASE_URL}/api/applications/full",
            json=payload,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        # First check if already applied or just applied
        if response.status_code == 200:
            # It was the first application, try again
            response2 = requests.post(
                f"{BASE_URL}/api/applications/full",
                json=payload,
                headers={"Authorization": f"Bearer {user_token}"}
            )
            assert response2.status_code == 400, f"Expected 400 for duplicate, got {response2.status_code}"
            print("Duplicate application correctly rejected on second attempt")
        else:
            assert response.status_code == 400, f"Expected 400 for duplicate, got {response.status_code}"
            print("Duplicate application correctly rejected")

    def test_china_fields_with_inChina_true(self, admin_token):
        """Test application where student is currently in China"""
        # Create a new user for this test
        china_user_email = f"TEST_china_{uuid.uuid4().hex[:8]}@test.com"
        reg = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": china_user_email, "password": "Test2025!",
            "firstName": "Wang", "lastName": "Fang"
        })
        if reg.status_code not in [200, 201]:
            pytest.skip("Could not create test user for China test")
        china_token = reg.json().get("access_token")
        if not china_token:
            login = requests.post(f"{BASE_URL}/api/auth/login", json={"email": china_user_email, "password": "Test2025!"})
            china_token = login.json().get("access_token")

        payload = build_full_payload("e1f93080-1fbf-4733-b7fa-d10d96e4593e", "Data Science & Intelligence Artificielle")
        payload["inChinaNow"] = True
        payload["chinaSchool"] = "Beijing Language and Culture University"
        payload["chinaVisaType"] = "X1"
        payload["chinaVisaNo"] = "CN-VISA-12345"
        payload["chinaVisaExpiry"] = "2025-08-31"
        payload["chinaLearningPeriodStart"] = "2023-09-01"
        payload["chinaLearningPeriodEnd"] = "2025-06-30"

        response = requests.post(
            f"{BASE_URL}/api/applications/full",
            json=payload,
            headers={"Authorization": f"Bearer {china_token}"}
        )
        assert response.status_code == 200, f"China application failed: {response.text}"
        app_id = response.json()["id"]

        # Verify China fields persisted - use china_token (user owns the application)
        get_response = requests.get(
            f"{BASE_URL}/api/applications/{app_id}",
            headers={"Authorization": f"Bearer {china_token}"}
        )
        assert get_response.status_code == 200
        data = get_response.json()
        assert data.get("inChinaNow") == True, f"inChinaNow should be True: {data.get('inChinaNow')}"
        assert data.get("chinaSchool") == "Beijing Language and Culture University"
        assert data.get("chinaVisaType") == "X1"
        assert data.get("chinaVisaNo") == "CN-VISA-12345"
        print(f"China fields verified for application {app_id}: inChinaNow=True, school={data.get('chinaSchool')}")
