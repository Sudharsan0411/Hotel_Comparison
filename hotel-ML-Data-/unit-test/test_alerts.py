# test_alerts.py

from app.tasks import check_alerts_job

hotels_data = [
    {
        "id": 1,
        "name": "Taj Bangalore",
        "price": 7500,
        "rating": 4.8
    }
]

alerts = [
    {
        "user_id": 15,
        "hotel_id": 1,
        "target_price": 8000
    }
]

result = check_alerts_job.delay(
    hotels_data,
    alerts
)

print(
    result.get(timeout=10)
)