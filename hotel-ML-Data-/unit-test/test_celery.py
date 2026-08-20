from app.tasks import refresh_rankings

hotels_data = [
    {
        "id": 1,
        "name": "Taj Bangalore",
        "price": 7500,
        "rating": 4.8
    },
    {
        "id": 2,
        "name": "Leela Palace",
        "price": 12000,
        "rating": 4.9
    }
]

result = refresh_rankings.delay(
    hotels_data
)

print("Task ID:", result.id)

print(
    result.get(timeout=10)
)