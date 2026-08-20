import os
import pandas as pd

# =====================================================
# CSV DATA LOADER
# Loads hotel CSV dataset into ML pipeline format
# =====================================================

CSV_PATH = os.environ.get(
    "HOTEL_CSV_PATH",
    os.path.join(
        os.path.dirname(__file__),
        "raw_hotel_dataset.csv"
    )
)


def clean_value(value, default=""):
    if pd.isna(value):
        return default
    return value


def load_hotels_from_csv(csv_path=None):
    path = csv_path or CSV_PATH

    try:
        df = pd.read_csv(path)

        price_col = (
            "price_per_night_INR"
            if "price_per_night_INR" in df.columns
            else "price_per_night_inr"
        )

        required_columns = [
            "hotel_id",
            "hotel_name",
            price_col,
            "user_rating"
        ]

        df = df.dropna(subset=required_columns)
        df = df.drop_duplicates(subset=["hotel_id"])

        df = df[df[price_col] > 0]
        df = df[df["user_rating"] > 0]

        hotels = []

        for _, row in df.iterrows():
            price = float(row[price_col])
            platform = str(row.get("platform", "")).lower()

            # Agoda prices below 1000 look like USD, convert to INR
            if platform == "agoda" and price < 1000:
                price = price * 83

            hotels.append({
                "id": clean_value(row["hotel_id"]),
                "name": clean_value(row["hotel_name"]),
                "price": round(price, 2),
                "rating": float(row["user_rating"]),

                "city": clean_value(row.get("city", "")),
                "area": clean_value(row.get("area", "")),
                "platform": clean_value(row.get("platform", "")),
                "star_rating": clean_value(row.get("star_rating", "")),
                "hotel_type": clean_value(row.get("hotel_type", "")),
                "total_reviews": clean_value(row.get("total_reviews", "")),

                "image": clean_value(row.get("photo_url", "")),
                "photo_url": clean_value(row.get("photo_url", "")),
                "url": clean_value(row.get("url", ""))
            })

        print(f"Loaded {len(hotels)} hotels from CSV.")
        return hotels

    except FileNotFoundError:
        print(f"CSV file not found at: {path}")
        return []

    except Exception as e:
        print(f"Error loading CSV: {e}")
        return []