import requests
import sys
import json
import io
from datetime import datetime
from pathlib import Path

class FormAssistantAPITester:
    def __init__(self, base_url="http://127.0.0.1:5000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        if files is None:
            headers['Content-Type'] = 'application/json'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, params=params, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    self.log_test(name, True)
                    return True, response_data
                except:
                    print(f"   Response: {response.text[:200]}...")
                    self.log_test(name, True)
                    return True, response.text
            else:
                error_details = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_response = response.json()
                    error_details += f" - {error_response}"
                except:
                    error_details += f" - {response.text[:100]}"
                
                self.log_test(name, False, error_details)
                return False, {}

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   Error: {error_msg}")
            self.log_test(name, False, error_msg)
            return False, {}

    def test_form_templates(self):
        """Test form templates endpoint"""
        success, response = self.run_test(
            "Get Form Templates - General",
            "GET",
            "form-templates",
            200,
            params={"form_type": "general"}
        )
        
        if success:
            # Test different form types
            for form_type in ["government", "job_application", "university"]:
                self.run_test(
                    f"Get Form Templates - {form_type}",
                    "GET", 
                    "form-templates",
                    200,
                    params={"form_type": form_type}
                )
        
        return success

    def test_explain_field(self):
        """Test field explanation endpoint"""
        success, response = self.run_test(
            "Explain Field - Full Name",
            "POST",
            "explain-field",
            200,
            params={
                "field_name": "full_name",
                "form_type": "general",
                "language": "english"
            }
        )
        
        if success:
            # Test different languages
            for lang in ["hindi", "tamil", "kannada"]:
                self.run_test(
                    f"Explain Field - {lang}",
                    "POST",
                    "explain-field", 
                    200,
                    params={
                        "field_name": "email",
                        "form_type": "job_application",
                        "language": lang
                    }
                )
        
        return success

    def test_chat_functionality(self):
        """Test AI chat endpoint"""
        chat_messages = [
            {
                "message": "How do I fill the date of birth field?",
                "language": "english",
                "form_context": "general"
            },
            {
                "message": "What documents do I need for government forms?",
                "language": "english", 
                "form_context": "government"
            },
            {
                "message": "मुझे नाम का फील्ड कैसे भरना है?",
                "language": "hindi",
                "form_context": "general"
            }
        ]
        
        all_success = True
        for i, chat_data in enumerate(chat_messages):
            success, response = self.run_test(
                f"Chat Message {i+1} - {chat_data['language']}",
                "POST",
                "chat",
                200,
                data=chat_data
            )
            if not success:
                all_success = False
        
        return all_success

    def test_file_upload(self):
        """Test form upload endpoint with mock file"""
        # Create a mock image file
        mock_image_content = b"Mock image content for testing"
        
        files = {
            'file': ('test_form.jpg', io.BytesIO(mock_image_content), 'image/jpeg')
        }
        
        success, response = self.run_test(
            "Upload Form - Image File",
            "POST",
            "upload-form",
            200,
            files=files
        )
        
        if success:
            # Test PDF upload
            files_pdf = {
                'file': ('test_form.pdf', io.BytesIO(b"Mock PDF content"), 'application/pdf')
            }
            
            self.run_test(
                "Upload Form - PDF File",
                "POST",
                "upload-form",
                200,
                files=files_pdf
            )
        
        return success

    def test_autofill_suggestions(self):
        """Test autofill suggestions endpoint"""
        field_names = ["full_name", "email", "phone", "date_of_birth"]
        
        success, response = self.run_test(
            "Get Autofill Suggestions",
            "POST",
            "autofill-suggestions",
            200,
            data=field_names
        )
        
        return success

    def test_invalid_endpoints(self):
        """Test error handling for invalid requests"""
        # Test invalid file type
        files = {
            'file': ('test.txt', io.BytesIO(b"text content"), 'text/plain')
        }
        
        success, response = self.run_test(
            "Upload Invalid File Type",
            "POST",
            "upload-form",
            400,
            files=files
        )
        
        # Test missing parameters
        success2, response2 = self.run_test(
            "Explain Field - Missing Parameters",
            "POST",
            "explain-field",
            422,  # FastAPI validation error
            params={}
        )
        
        return success and success2

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting FormBuddy AI API Tests")
        print(f"   Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test all endpoints
        self.test_form_templates()
        self.test_explain_field()
        self.test_chat_functionality()
        self.test_file_upload()
        self.test_autofill_suggestions()
        self.test_invalid_endpoints()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return 1

def main():
    tester = FormAssistantAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())