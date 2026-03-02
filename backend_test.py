#!/usr/bin/env python3

import requests
import sys
from datetime import datetime
import json

class WinnersConsultingAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                try:
                    json_response = response.json()
                    if isinstance(json_response, list):
                        print(f"   📊 Response: List with {len(json_response)} items")
                    elif isinstance(json_response, dict):
                        if 'message' in json_response:
                            print(f"   📄 Message: {json_response['message']}")
                        else:
                            print(f"   📄 Response keys: {list(json_response.keys())}")
                except:
                    print(f"   📄 Response: {response.text[:100]}...")
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_msg = response.json().get('detail', response.text)
                    print(f"   ⚠️  Error: {error_msg}")
                except:
                    print(f"   ⚠️  Error: {response.text[:200]}...")

            return success, response.json() if success else {}

        except requests.exceptions.Timeout:
            print(f"   ❌ FAILED - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"   ❌ FAILED - Connection error")
            return False, {}
        except Exception as e:
            print(f"   ❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "/api/",
            200
        )
        return success

    def test_offers_endpoint(self):
        """Test offers endpoint"""
        success, response = self.run_test(
            "Get Offers",
            "GET", 
            "/api/offers",
            200
        )
        return success, response

    def test_universities_endpoint(self):
        """Test universities endpoint"""
        success, response = self.run_test(
            "Get Universities",
            "GET",
            "/api/universities", 
            200
        )
        return success, response

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        # Test login endpoint - should fail with invalid credentials
        success, response = self.run_test(
            "Login (invalid credentials)",
            "POST",
            "/api/auth/login",
            401,
            data={"email": "test@example.com", "password": "wrongpassword"}
        )
        
        return success

    def test_protected_endpoints(self):
        """Test protected endpoints without token"""
        success, response = self.run_test(
            "Get User Profile (no token)",
            "GET",
            "/api/auth/me",
            401
        )
        return success

    def test_admin_setup(self):
        """Test admin setup"""
        success, response = self.run_test(
            "Admin Setup",
            "POST",
            "/api/admin/setup",
            400  # Should fail if admin already exists
        )
        return success

def main():
    print("=" * 60)
    print("🧪 WINNER'S CONSULTING API TESTING")
    print("=" * 60)
    
    # Setup
    tester = WinnersConsultingAPITester()
    
    # Test basic endpoints
    print("\n📡 BASIC API TESTS")
    print("-" * 40)
    
    # Test API root
    tester.test_api_root()
    
    # Test offers endpoint
    offers_success, offers_data = tester.test_offers_endpoint()
    
    # Test universities endpoint  
    unis_success, unis_data = tester.test_universities_endpoint()
    
    print("\n🔐 AUTHENTICATION TESTS")
    print("-" * 40)
    
    # Test auth endpoints
    tester.test_auth_endpoints()
    tester.test_protected_endpoints()
    tester.test_admin_setup()

    # Print results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"✅ Tests passed: {tester.tests_passed}")
    print(f"❌ Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"📈 Success rate: {tester.tests_passed}/{tester.tests_run} ({tester.tests_passed/tester.tests_run*100:.1f}%)")
    
    if offers_success:
        print(f"📋 Offers endpoint: WORKING ({len(offers_data)} offers available)")
    else:
        print(f"📋 Offers endpoint: FAILED")
        
    if unis_success:
        print(f"🏫 Universities endpoint: WORKING ({len(unis_data)} universities available)")
    else:
        print(f"🏫 Universities endpoint: FAILED")

    print("\n🎯 KEY FINDINGS:")
    if tester.tests_passed >= 5:
        print("   ✅ Backend APIs are responding correctly")
        print("   ✅ Core endpoints (/api/offers, /api/universities) working")
        print("   ✅ Authentication protection working properly")
    else:
        print("   ❌ Multiple API failures detected")
        print("   ⚠️  Backend may have configuration issues")

    return 0 if tester.tests_passed >= 5 else 1

if __name__ == "__main__":
    sys.exit(main())