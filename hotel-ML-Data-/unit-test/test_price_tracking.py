from app.tasks import track_prices_job

hotels_data = [
    {
        "id": 1,
        "name": "Taj Bangalore",
        "price": 7500,
        "rating": 4.8
    }
]

result = track_prices_job.delay(
    hotels_data
)

print(result.get(timeout=10))