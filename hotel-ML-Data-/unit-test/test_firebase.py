from app.firebase_service import send_push_notification

response = send_push_notification(
    fcm_token="sample_token_123",
    title="Price Alert",
    body="Price dropped to ₹7500"
)

print(response)