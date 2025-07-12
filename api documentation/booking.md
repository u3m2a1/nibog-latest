## create booking 

POST https://ai.alviongs.com/webhook/v1/nibog/bookingsevents/create

payload

{
  "user_id": 4,
  "parent": {
    "parent_name": "Sarah Johnson",
    "email": "sarah@example.com",
    "additional_phone": "+916303727148"
  },
  "child": {
    "full_name": "Emma Johnson",
    "date_of_birth": "2020-05-12",
    "school_name": "Little Stars Academy",
    "gender": "Female"
  },
  "booking": {
    "event_id": 11,
    "total_amount": 1240.50,
    "payment_method": "PhonePe",
    "payment_status": "successful",
    "terms_accepted": true
  },
  "booking_games": [
    {
      "game_id": 2,
      "game_price": 590
    },
    {
      "game_id": 4,
      "game_price": 450
    }
  ],
  "booking_addons": [
    {
      "addon_id": 6,
      "variants": [
        { "variant_id": 4, "quantity": 2 },
        { "variant_id": 5, "quantity": 1 }
      ]
    },
    {
      "addon_id": 2,
      "quantity": 2
    }
  ],
  "promo_code": "NIBOG25UP"
}

Response

{
  success: true,
  message: "Booking created successfully",
  booking_id: 31
}

## get all bookings

GET https://ai.alviongs.com/webhook/v1/nibog/bookingsevents/get-all


response

[
    {
        "booking_id": 2,
        "booking_ref": "nibog",
        "booking_status": "Pending",
        "total_amount": "120.00",
        "payment_method": "Credit Card",
        "payment_status": "Paid",
        "terms_accepted": true,
        "booking_is_active": true,
        "booking_created_at": "2025-05-07T17:20:17.060Z",
        "booking_updated_at": "2025-05-07T17:20:17.060Z",
        "cancelled_at": null,
        "completed_at": null,
        "parent_id": 5,
        "parent_name": "John Doe",
        "parent_email": "johndoe@example.com",
        "parent_additional_phone": "+916303727148",
        "parent_is_active": true,
        "parent_created_at": "2025-05-07T17:20:17.041Z",
        "parent_updated_at": "2025-05-07T17:20:17.041Z",
        "child_id": 5,
        "child_full_name": "Alice Doe",
        "child_date_of_birth": "2018-05-12T00:00:00.000Z",
        "child_school_name": "Little Stars Academy",
        "child_gender": "Female",
        "child_is_active": true,
        "child_created_at": "2025-05-07T17:20:17.050Z",
        "child_updated_at": "2025-05-07T17:20:17.050Z",
        "game_name": "Running race",
        "game_description": "asdf",
        "game_min_age": 5,
        "game_max_age": 32,
        "game_duration_minutes": 60,
        "game_categories": [
            "asdf",
            "dsafsa",
            "dsafasdgfa"
        ],
        "game_is_active": true,
        "game_created_at": "2025-05-05T06:32:07.614Z",
        "game_updated_at": "2025-05-05T06:32:07.614Z",
        "event_title": "Spring Carnival",
        "event_description": "A fun-filled day with games and activities.",
        "event_event_date": "2025-05-10T00:00:00.000Z",
        "event_status": "Published",
        "event_created_at": "2025-05-05T10:15:15.750Z",
        "event_updated_at": "2025-05-05T10:15:15.750Z",
        "user_full_name": "sunil",
        "user_email": "pittisunilkumar3@gmail.com",
        "user_phone": "6303727148",
        "user_city_id": 1,
        "user_accepted_terms": false,
        "user_terms_accepted_at": null,
        "user_is_active": true,
        "user_is_locked": false,
        "user_locked_until": null,
        "user_deactivated_at": null,
        "user_created_at": "2025-05-07T06:24:04.167Z",
        "user_updated_at": "2025-05-07T06:24:04.167Z",
        "user_last_login_at": null,
        "city_name": "Hyderbad",
        "city_state": "AP",
        "city_is_active": true,
        "city_created_at": "2025-05-05T06:30:15.838Z",
        "city_updated_at": "2025-05-05T06:30:15.838Z",
        "venue_name": "KPHB",
        "venue_address": "218 North Texas blvd",
        "venue_capacity": 3000,
        "venue_is_active": true,
        "venue_created_at": "2025-05-05T06:31:00.910Z",
        "venue_updated_at": "2025-05-05T06:31:00.910Z"
    },
    {
        "booking_id": 3,
        "booking_ref": "nibog",
        "booking_status": "Pending",
        "total_amount": "120.00",
        "payment_method": "Credit Card",
        "payment_status": "Paid",
        "terms_accepted": true,
        "booking_is_active": true,
        "booking_created_at": "2025-05-07T17:20:33.831Z",
        "booking_updated_at": "2025-05-07T17:20:33.831Z",
        "cancelled_at": null,
        "completed_at": null,
        "parent_id": 6,
        "parent_name": "John Doe",
        "parent_email": "johndoe@example.com",
        "parent_additional_phone": "+916303727148",
        "parent_is_active": true,
        "parent_created_at": "2025-05-07T17:20:33.818Z",
        "parent_updated_at": "2025-05-07T17:20:33.818Z",
        "child_id": 6,
        "child_full_name": "Alice Doe",
        "child_date_of_birth": "2018-05-12T00:00:00.000Z",
        "child_school_name": "Little Stars Academy",
        "child_gender": "Female",
        "child_is_active": true,
        "child_created_at": "2025-05-07T17:20:33.824Z",
        "child_updated_at": "2025-05-07T17:20:33.824Z",
        "game_name": "Running race",
        "game_description": "asdf",
        "game_min_age": 5,
        "game_max_age": 32,
        "game_duration_minutes": 60,
        "game_categories": [
            "asdf",
            "dsafsa",
            "dsafasdgfa"
        ],
        "game_is_active": true,
        "game_created_at": "2025-05-05T06:32:07.614Z",
        "game_updated_at": "2025-05-05T06:32:07.614Z",
        "event_title": "Spring Carnival",
        "event_description": "A fun-filled day with games and activities.",
        "event_event_date": "2025-05-10T00:00:00.000Z",
        "event_status": "Published",
        "event_created_at": "2025-05-05T10:15:15.750Z",
        "event_updated_at": "2025-05-05T10:15:15.750Z",
        "user_full_name": "sunil",
        "user_email": "pittisunilkumar3@gmail.com",
        "user_phone": "6303727148",
        "user_city_id": 1,
        "user_accepted_terms": false,
        "user_terms_accepted_at": null,
        "user_is_active": true,
        "user_is_locked": false,
        "user_locked_until": null,
        "user_deactivated_at": null,
        "user_created_at": "2025-05-07T06:24:04.167Z",
        "user_updated_at": "2025-05-07T06:24:04.167Z",
        "user_last_login_at": null,
        "city_name": "Hyderbad",
        "city_state": "AP",
        "city_is_active": true,
        "city_created_at": "2025-05-05T06:30:15.838Z",
        "city_updated_at": "2025-05-05T06:30:15.838Z",
        "venue_name": "KPHB",
        "venue_address": "218 North Texas blvd",
        "venue_capacity": 3000,
        "venue_is_active": true,
        "venue_created_at": "2025-05-05T06:31:00.910Z",
        "venue_updated_at": "2025-05-05T06:31:00.910Z"
    }
]

## update booking status

POST https://ai.alviongs.com/webhook/v1/nibog/bookingsevents/update-status

payload

{
    "booking_id": 2,
    "status": "Confirmed"
}

response

[
  {
    "booking_id": 2,
    "booking_ref": "nibog",
    "user_id": 4,
    "parent_id": 5,
    "event_id": 11,
    "status": "Confirmed",
    "total_amount": "120.00",
    "payment_method": "Credit Card",
    "payment_status": "Paid",
    "terms_accepted": true,
    "is_active": true,
    "created_at": "2025-05-07T17:20:17.060Z",
    "updated_at": "2025-06-13T15:36:41.455Z",
    "cancelled_at": null,
    "completed_at": null
  }
]




















