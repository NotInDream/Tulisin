import unittest


class TestHistoryAPI(unittest.TestCase):
    def setUp(self):
        # Set up any necessary test data or configurations
        pass

    def tearDown(self):
        # Clean up after tests
        pass

    def test_get_history(self):
        # Test the GET /history endpoint
        response = self.client.get("/history")
        self.assertEqual(response.status_code, 200)
        self.assertIn("history", response.json)

    def test_post_history(self):
        # Test the POST /history endpoint
        data = {"action": "test_action", "timestamp": "2024-06-01T12:00:00Z"}
        response = self.client.post("/history", json=data)
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.json)

    def test_delete_history(self):
        # Test the DELETE /history endpoint
        history_id = 1  # Assuming this ID exists for testing
        response = self.client.delete(f"/history/{history_id}")
        self.assertEqual(response.status_code, 204)
