## create testimonial

POST https://ai.alviongs.com/webhook/v1/nibog/testimonials/create

payload

{
  "name": "John Doe",
  "city": "Mumbai",
  "event_id": 11,
  "rating": 4,
  "testimonial": "Great experience!",
  "date": "2025-06-08",
  "status": "Published"
}

response

[
  {
    "id": 0,
    "name": "John Doe",
    "city": "Mumbai",
    "event_id": 11,
    "rating": 4,
    "testimonial": "Great experience!",
    "submitted_at": "2025-06-08T00:00:00.000Z",
    "status": "Published"
  }
]

## get testimonial by id  

POST https://ai.alviongs.com/webhook/v1/nibog/testimonials/get
{
    "id": 0
}

response

[
  {
    "id": 0,
    "name": "John Doe",
    "city": "Mumbai",
    "event_id": 11,
    "rating": 4,
    "testimonial": "Great experience!",
    "submitted_at": "2025-06-08T00:00:00.000Z",
    "status": "Published"
  }
]

## get all testimonials

GET https://ai.alviongs.com/webhook/v1/nibog/testimonials/get-all

response

[
  {
    "id": 0,
    "name": "John Doe",
    "city": "Mumbai",
    "event_id": 11,
    "rating": 4,
    "testimonial": "Great experience!",
    "submitted_at": "2025-06-08T00:00:00.000Z",
    "status": "Published"
  }
]

## update testimonial

POST https://ai.alviongs.com/webhook/v1/nibog/testimonials/update
{
  "name": "Uma",
  "city": "Mumbai",
  "event_id": 11,
  "rating": 4,
  "testimonial": "Great experience! updated testimonial",
  "date": "2025-06-08",
  "status": "Published"
}

response

[
  {
    "id": 1,
    "name": "Harikrishna",
    "city_id": 1,
    "event_id": 1,
    "rating": 5,    
    "testimonial": "The annual NIBOG game has been a huge hit with my kids. They love competing in different challenges and games, and it's been great for their confidence and self-esteem. I love that they're learning important life skills like perseverance and determination while they're having fun.",
    "status_id": 1,
    "date": "2025-10-15", 
    "created_at": "2025-10-15T10:00:00.000Z",
    "updated_at": "2025-10-15T10:00:00.000Z"
  }
] 

## delete testimonial

POST https://ai.alviongs.com/webhook/v1/nibog/testimonials/delete
{
    "id": 1
}

response

[
  {
    "success": true
  }
] 
