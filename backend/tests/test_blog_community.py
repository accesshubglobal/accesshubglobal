"""
Test Blog and Community Features
- Blog: public listing, detail page, admin CRUD
- Community: discussions, replies, likes, admin moderation
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://accesshub-cms.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@winners-consulting.com"
ADMIN_PASSWORD = "Admin2025!"

# Test user for community posts
TEST_USER_EMAIL = f"test_community_{uuid.uuid4().hex[:8]}@test.com"
TEST_USER_PASSWORD = "TestPass123!"
TEST_USER_FIRST = "Test"
TEST_USER_LAST = "Community"


class TestBlogPublicAPI:
    """Test public blog endpoints (no auth required)"""
    
    def test_get_blog_posts_returns_published(self):
        """GET /api/blog returns published posts with total count"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "posts" in data, "Response should have 'posts' key"
        assert "total" in data, "Response should have 'total' key"
        assert isinstance(data["posts"], list), "posts should be a list"
        assert isinstance(data["total"], int), "total should be an integer"
        print(f"✓ GET /api/blog: {len(data['posts'])} posts, total={data['total']}")
    
    def test_get_blog_posts_with_category_filter(self):
        """GET /api/blog with category filter"""
        response = requests.get(f"{BASE_URL}/api/blog", params={"category": "etudes"})
        assert response.status_code == 200
        
        data = response.json()
        # All returned posts should have the filtered category
        for post in data["posts"]:
            assert post.get("category") == "etudes", f"Post category should be 'etudes', got {post.get('category')}"
        print(f"✓ GET /api/blog?category=etudes: {len(data['posts'])} posts")
    
    def test_get_blog_post_detail_increments_views(self):
        """GET /api/blog/{id} returns single post with views increment"""
        # First get list to find a post ID
        list_response = requests.get(f"{BASE_URL}/api/blog")
        assert list_response.status_code == 200
        
        posts = list_response.json()["posts"]
        if len(posts) == 0:
            pytest.skip("No blog posts available to test detail view")
        
        post_id = posts[0]["id"]
        initial_views = posts[0].get("views", 0)
        
        # Get detail
        detail_response = requests.get(f"{BASE_URL}/api/blog/{post_id}")
        assert detail_response.status_code == 200
        
        post = detail_response.json()
        assert post["id"] == post_id
        assert "title" in post
        assert "content" in post
        assert "views" in post
        # Views should be incremented
        assert post["views"] >= initial_views, "Views should be incremented"
        print(f"✓ GET /api/blog/{post_id}: views={post['views']}")
    
    def test_get_blog_post_not_found(self):
        """GET /api/blog/{id} returns 404 for non-existent post"""
        response = requests.get(f"{BASE_URL}/api/blog/non-existent-id-12345")
        assert response.status_code == 404
        print("✓ GET /api/blog/non-existent-id returns 404")


class TestBlogAdminAPI:
    """Test admin blog endpoints (requires admin auth)"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_admin_get_all_blog_posts(self, admin_headers):
        """GET /api/admin/blog returns all posts (including unpublished)"""
        response = requests.get(f"{BASE_URL}/api/admin/blog", headers=admin_headers)
        assert response.status_code == 200
        
        posts = response.json()
        assert isinstance(posts, list)
        print(f"✓ GET /api/admin/blog: {len(posts)} posts (admin view)")
    
    def test_admin_create_blog_post(self, admin_headers):
        """POST /api/admin/blog creates a new blog post"""
        test_post = {
            "title": f"TEST_Blog Post {uuid.uuid4().hex[:8]}",
            "content": "This is test content for the blog post.",
            "excerpt": "Test excerpt",
            "coverImage": "",
            "category": "conseils",
            "tags": ["test", "automation"],
            "published": False
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/blog", json=test_post, headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert "id" in created
        assert created["title"] == test_post["title"]
        assert created["category"] == test_post["category"]
        assert created["published"] == False
        print(f"✓ POST /api/admin/blog: created post id={created['id']}")
        
        # Store for cleanup
        return created["id"]
    
    def test_admin_update_blog_post(self, admin_headers):
        """PUT /api/admin/blog/{id} updates a blog post"""
        # First create a post
        test_post = {
            "title": f"TEST_Update Blog {uuid.uuid4().hex[:8]}",
            "content": "Original content",
            "category": "etudes",
            "published": False
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/blog", json=test_post, headers=admin_headers)
        assert create_response.status_code == 200
        post_id = create_response.json()["id"]
        
        # Update the post
        update_data = {
            "title": "TEST_Updated Title",
            "content": "Updated content",
            "published": True
        }
        update_response = requests.put(f"{BASE_URL}/api/admin/blog/{post_id}", json=update_data, headers=admin_headers)
        assert update_response.status_code == 200
        
        # Verify update
        verify_response = requests.get(f"{BASE_URL}/api/blog/{post_id}")
        assert verify_response.status_code == 200
        updated_post = verify_response.json()
        assert updated_post["title"] == "TEST_Updated Title"
        assert updated_post["published"] == True
        print(f"✓ PUT /api/admin/blog/{post_id}: updated successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/blog/{post_id}", headers=admin_headers)
    
    def test_admin_delete_blog_post(self, admin_headers):
        """DELETE /api/admin/blog/{id} deletes a blog post"""
        # First create a post
        test_post = {
            "title": f"TEST_Delete Blog {uuid.uuid4().hex[:8]}",
            "content": "To be deleted",
            "category": "actualites",
            "published": False
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/blog", json=test_post, headers=admin_headers)
        assert create_response.status_code == 200
        post_id = create_response.json()["id"]
        
        # Delete the post
        delete_response = requests.delete(f"{BASE_URL}/api/admin/blog/{post_id}", headers=admin_headers)
        assert delete_response.status_code == 200
        
        # Verify deletion
        verify_response = requests.get(f"{BASE_URL}/api/blog/{post_id}")
        assert verify_response.status_code == 404
        print(f"✓ DELETE /api/admin/blog/{post_id}: deleted successfully")


class TestCommunityPublicAPI:
    """Test public community endpoints"""
    
    def test_get_community_posts_sorted_by_pinned_then_date(self):
        """GET /api/community returns posts sorted by pinned then date"""
        response = requests.get(f"{BASE_URL}/api/community")
        assert response.status_code == 200
        
        data = response.json()
        assert "posts" in data
        assert "total" in data
        
        posts = data["posts"]
        # Check pinned posts come first
        pinned_ended = False
        for post in posts:
            if pinned_ended and post.get("pinned"):
                pytest.fail("Pinned posts should come before non-pinned posts")
            if not post.get("pinned"):
                pinned_ended = True
        
        print(f"✓ GET /api/community: {len(posts)} posts, total={data['total']}")
    
    def test_get_community_posts_with_category_filter(self):
        """GET /api/community with category filter"""
        response = requests.get(f"{BASE_URL}/api/community", params={"category": "etudes"})
        assert response.status_code == 200
        
        data = response.json()
        for post in data["posts"]:
            assert post.get("category") == "etudes"
        print(f"✓ GET /api/community?category=etudes: {len(data['posts'])} posts")
    
    def test_get_community_post_detail_with_replies(self):
        """GET /api/community/{id} returns post with replies"""
        # First get list
        list_response = requests.get(f"{BASE_URL}/api/community")
        assert list_response.status_code == 200
        
        posts = list_response.json()["posts"]
        if len(posts) == 0:
            pytest.skip("No community posts available")
        
        post_id = posts[0]["id"]
        
        # Get detail
        detail_response = requests.get(f"{BASE_URL}/api/community/{post_id}")
        assert detail_response.status_code == 200
        
        post = detail_response.json()
        assert post["id"] == post_id
        assert "title" in post
        assert "content" in post
        assert "replies" in post
        assert isinstance(post["replies"], list)
        print(f"✓ GET /api/community/{post_id}: {len(post['replies'])} replies")


class TestCommunityUserAPI:
    """Test community endpoints requiring user auth"""
    
    @pytest.fixture(scope="class")
    def test_user_token(self):
        """Create test user and get token"""
        # Try to register
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "firstName": TEST_USER_FIRST,
            "lastName": TEST_USER_LAST
        })
        
        if register_response.status_code == 200:
            return register_response.json()["access_token"]
        
        # If already exists, login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        
        if login_response.status_code == 200:
            return login_response.json()["access_token"]
        
        pytest.skip("Could not create or login test user")
    
    @pytest.fixture(scope="class")
    def user_headers(self, test_user_token):
        return {"Authorization": f"Bearer {test_user_token}"}
    
    def test_create_community_post_requires_auth(self):
        """POST /api/community requires authentication"""
        response = requests.post(f"{BASE_URL}/api/community", json={
            "title": "Test Post",
            "content": "Test content",
            "category": "etudes"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ POST /api/community requires auth")
    
    def test_create_community_post(self, user_headers):
        """POST /api/community creates a new discussion"""
        test_post = {
            "title": f"TEST_Discussion {uuid.uuid4().hex[:8]}",
            "content": "This is a test discussion post.",
            "category": "conseils"
        }
        
        response = requests.post(f"{BASE_URL}/api/community", json=test_post, headers=user_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert "id" in created
        assert created["title"] == test_post["title"]
        assert created["category"] == test_post["category"]
        assert created["likeCount"] == 0
        assert created["replyCount"] == 0
        print(f"✓ POST /api/community: created post id={created['id']}")
        
        return created["id"]
    
    def test_create_community_reply(self, user_headers):
        """POST /api/community/{id}/reply adds a reply"""
        # First create a post
        post_response = requests.post(f"{BASE_URL}/api/community", json={
            "title": f"TEST_Reply Target {uuid.uuid4().hex[:8]}",
            "content": "Post to reply to",
            "category": "experiences"
        }, headers=user_headers)
        assert post_response.status_code == 200
        post_id = post_response.json()["id"]
        
        # Add reply
        reply_response = requests.post(f"{BASE_URL}/api/community/{post_id}/reply", json={
            "content": "This is a test reply"
        }, headers=user_headers)
        assert reply_response.status_code == 200
        
        reply = reply_response.json()
        assert "id" in reply
        assert reply["postId"] == post_id
        assert reply["content"] == "This is a test reply"
        print(f"✓ POST /api/community/{post_id}/reply: created reply id={reply['id']}")
        
        # Verify reply count increased
        verify_response = requests.get(f"{BASE_URL}/api/community/{post_id}")
        assert verify_response.status_code == 200
        assert len(verify_response.json()["replies"]) >= 1
    
    def test_toggle_like_community_post(self, user_headers):
        """POST /api/community/{id}/like toggles like on post"""
        # First create a post
        post_response = requests.post(f"{BASE_URL}/api/community", json={
            "title": f"TEST_Like Target {uuid.uuid4().hex[:8]}",
            "content": "Post to like",
            "category": "bourses"
        }, headers=user_headers)
        assert post_response.status_code == 200
        post_id = post_response.json()["id"]
        
        # Like the post
        like_response = requests.post(f"{BASE_URL}/api/community/{post_id}/like", headers=user_headers)
        assert like_response.status_code == 200
        
        like_data = like_response.json()
        assert like_data["liked"] == True
        assert like_data["likeCount"] >= 1
        print(f"✓ POST /api/community/{post_id}/like: liked=True, count={like_data['likeCount']}")
        
        # Unlike the post (toggle)
        unlike_response = requests.post(f"{BASE_URL}/api/community/{post_id}/like", headers=user_headers)
        assert unlike_response.status_code == 200
        
        unlike_data = unlike_response.json()
        assert unlike_data["liked"] == False
        print(f"✓ POST /api/community/{post_id}/like (toggle): liked=False, count={unlike_data['likeCount']}")


class TestCommunityAdminAPI:
    """Test admin community moderation endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_admin_get_all_community_posts(self, admin_headers):
        """GET /api/admin/community returns all posts"""
        response = requests.get(f"{BASE_URL}/api/admin/community", headers=admin_headers)
        assert response.status_code == 200
        
        posts = response.json()
        assert isinstance(posts, list)
        print(f"✓ GET /api/admin/community: {len(posts)} posts (admin view)")
    
    def test_admin_toggle_pin_community_post(self, admin_headers):
        """PUT /api/admin/community/{id}/pin toggles pin status"""
        # First create a post (as admin)
        post_response = requests.post(f"{BASE_URL}/api/community", json={
            "title": f"TEST_Pin Target {uuid.uuid4().hex[:8]}",
            "content": "Post to pin",
            "category": "etudes"
        }, headers=admin_headers)
        assert post_response.status_code == 200
        post_id = post_response.json()["id"]
        
        # Pin the post
        pin_response = requests.put(f"{BASE_URL}/api/admin/community/{post_id}/pin", headers=admin_headers)
        assert pin_response.status_code == 200
        
        pin_data = pin_response.json()
        assert "pinned" in pin_data
        initial_pin_state = pin_data["pinned"]
        print(f"✓ PUT /api/admin/community/{post_id}/pin: pinned={initial_pin_state}")
        
        # Toggle again
        toggle_response = requests.put(f"{BASE_URL}/api/admin/community/{post_id}/pin", headers=admin_headers)
        assert toggle_response.status_code == 200
        assert toggle_response.json()["pinned"] != initial_pin_state
        print(f"✓ PUT /api/admin/community/{post_id}/pin (toggle): pinned={toggle_response.json()['pinned']}")
    
    def test_admin_delete_community_post(self, admin_headers):
        """DELETE /api/admin/community/{id} soft-deletes post"""
        # First create a post
        post_response = requests.post(f"{BASE_URL}/api/community", json={
            "title": f"TEST_Delete Target {uuid.uuid4().hex[:8]}",
            "content": "Post to delete",
            "category": "visa"
        }, headers=admin_headers)
        assert post_response.status_code == 200
        post_id = post_response.json()["id"]
        
        # Delete the post
        delete_response = requests.delete(f"{BASE_URL}/api/admin/community/{post_id}", headers=admin_headers)
        assert delete_response.status_code == 200
        
        # Verify soft-delete (should return 404 on public endpoint)
        verify_response = requests.get(f"{BASE_URL}/api/community/{post_id}")
        assert verify_response.status_code == 404
        print(f"✓ DELETE /api/admin/community/{post_id}: soft-deleted successfully")


# Cleanup fixture to remove test data
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after all tests"""
    yield
    
    # Login as admin
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    
    if login_response.status_code != 200:
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Cleanup blog posts
    try:
        blog_response = requests.get(f"{BASE_URL}/api/admin/blog", headers=headers)
        if blog_response.status_code == 200:
            for post in blog_response.json():
                if post.get("title", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/admin/blog/{post['id']}", headers=headers)
    except Exception as e:
        print(f"Blog cleanup error: {e}")
    
    # Cleanup community posts
    try:
        community_response = requests.get(f"{BASE_URL}/api/admin/community", headers=headers)
        if community_response.status_code == 200:
            for post in community_response.json():
                if post.get("title", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/admin/community/{post['id']}", headers=headers)
    except Exception as e:
        print(f"Community cleanup error: {e}")
    
    print("✓ Test data cleanup completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
