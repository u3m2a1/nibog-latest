## create social media

POST https://ai.alviongs.com/webhook/v1/nibog/socialmedia/create

Payload

{
  "facebook_url": "https://facebook.com/nibog",
  "instagram_url": "https://instagram.com/nibog",
  "twitter_url": "https://twitter.com/nibog",
  "youtube_url": "https://youtube.com/nibog"
}

Response

[
  {
    "id": 1,
    "facebook_url": "https://facebook.com/nibog",
    "instagram_url": "https://instagram.com/nibog",
    "twitter_url": "https://twitter.com/nibog",
    "youtube_url": "https://youtube.com/nibog",
    "created_at": "2025-05-05T07:42:19.317Z",
    "updated_at": "2025-05-05T07:42:19.317Z"
  }
]

## get social media

GET https://ai.alviongs.com/webhook/v1/nibog/socialmedia/get


Response

[
  {
    "id": 1,
    "facebook_url": "https://facebook.com/nibog",
    "instagram_url": "https://instagram.com/nibog",
    "twitter_url": "https://twitter.com/nibog",
    "youtube_url": "https://youtube.com/nibog",
    "created_at": "2025-05-05T07:42:19.317Z",
    "updated_at": "2025-05-05T07:42:19.317Z"
  }
]
