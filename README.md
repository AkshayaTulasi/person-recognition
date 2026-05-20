# Person Details Image Recognition Website

A web application that uses face recognition to identify people from uploaded images and display their details.

## Features

✅ **Face Recognition** - Upload an image and identify people from your database
✅ **Add Persons** - Register new people with their details (name, email, phone, age)
✅ **Person Database** - View all registered persons and manage them
✅ **Responsive UI** - Clean, modern interface with Bootstrap
✅ **High Accuracy** - Uses industry-standard face_recognition library

## Technology Stack

- **Backend**: Flask (Python web framework)
- **Face Recognition**: face_recognition library (OpenCV-based)
- **Frontend**: HTML5, CSS3, JavaScript (Bootstrap 5)
- **Database**: JSON file-based storage
- **Image Processing**: Pillow, OpenCV

## Installation

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Step 1: Install Dependencies

```bash
cd proj
pip install -r requirements.txt
```

**Note**: The `face_recognition` library requires:
- On Windows: Visual C++ Build Tools or Microsoft Visual Studio
- On macOS: Xcode Command Line Tools
- On Linux: cmake, dlib development libraries

If installation fails, try:
```bash
pip install face_recognition --no-binary dlib
```

### Step 2: Run the Application

```bash
python run.py
```

The application will start on `http://localhost:5000`

## Project Structure

```
proj/
├── run.py                          # Main Flask application
├── requirements.txt                # Python dependencies
├── templates/
│   └── index.html                 # Main UI template
├── static/
│   ├── css/
│   │   └── style.css             # Styling
│   ├── js/
│   │   └── script.js             # Frontend logic
│   └── uploads/                   # Uploaded images (temp)
└── data/
    └── persons_db.json            # Person database
```

## Usage

### 1. Recognize a Person

1. Go to the **"🔍 Recognize Person"** tab
2. Click "Choose Image" and select a photo
3. Click **"🔍 Recognize Person"** button
4. The app will detect faces and match them against registered persons
5. View the results with confidence scores

### 2. Add a New Person

1. Go to the **"➕ Add Person"** tab
2. Fill in the person's details:
   - Name (required)
   - Email (optional)
   - Phone (optional)
   - Age (optional)
3. Upload a clear, front-facing photo
4. Click **"➕ Add Person"** button
5. The person is now registered in the database

### 3. Manage Database

1. Go to the **"📊 Database"** tab
2. View all registered persons
3. Click **"🗑️ Delete"** to remove a person from the database

## API Endpoints

### POST `/api/upload`
Upload an image for face recognition

**Request**: multipart/form-data with `image` field
**Response**: JSON with detected faces and matches

```json
{
  "success": true,
  "total_faces": 1,
  "results": [
    {
      "face_number": 1,
      "match_found": true,
      "person": {
        "id": "person_1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "123-456-7890",
        "age": "30"
      },
      "confidence": 95.5
    }
  ]
}
```

### POST `/api/add-person`
Add a new person to the database

**Request**: JSON with person data and image path
**Response**: Success/error message

### GET `/api/persons`
Get all registered persons

**Response**: List of all persons (without face encodings)

### DELETE `/api/delete-person/<person_id>`
Delete a person from the database

## Important Notes

- **Face Encodings**: Stored as JSON arrays for fast comparison
- **Image Size**: Max 16MB per upload
- **Supported Formats**: PNG, JPG, JPEG, GIF
- **Database**: Stored in `data/persons_db.json`
- **Matching Algorithm**: Euclidean distance-based (tolerance: 0.6)

## Troubleshooting

### Installation Issues

**Problem**: `face_recognition` installation fails
**Solution**: 
- Install Visual C++ Build Tools (Windows)
- Use pre-built wheels: `pip install face_recognition --only-binary :all:`

### No Faces Detected

- Ensure the image has clear, visible faces
- Try images with front-facing faces
- Check image resolution (minimum 100x100 pixels per face)

### False Matches

- Adjust the tolerance parameter in `run.py` (line ~160)
- Lower tolerance = stricter matching
- Higher tolerance = more lenient matching

## Performance

- Face detection: ~1-2 seconds per image
- Database matching: ~10-50ms per face depending on database size
- Optimal: 10-100 registered persons for real-time performance

## Security Notes

- Face encodings are stored locally in `data/persons_db.json`
- No data is sent to external servers
- Running on localhost only by default
- For production, use HTTPS and proper authentication

## Future Enhancements

- [ ] Multiple face matching in single image
- [ ] Face detection visualization with bounding boxes
- [ ] Database export/import
- [ ] Batch image uploads
- [ ] User authentication
- [ ] Advanced analytics dashboard
- [ ] Support for video frame processing

## License

MIT License

## Support

For issues or questions, please check the troubleshooting section above.
