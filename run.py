import os
import shutil

# Create project directories if they don't exist
os.makedirs('templates', exist_ok=True)
os.makedirs('static', exist_ok=True)
os.makedirs('static/uploads', exist_ok=True)
os.makedirs('static/css', exist_ok=True)
os.makedirs('static/js', exist_ok=True)
os.makedirs('data', exist_ok=True)

# Move files to correct locations if they exist
if os.path.exists('templates_index.html'):
    shutil.move('templates_index.html', 'templates/index.html')
if os.path.exists('static_style.css'):
    shutil.move('static_style.css', 'static/css/style.css')
if os.path.exists('static_script.js'):
    shutil.move('static_script.js', 'static/js/script.js')

from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image
import json
import os
import hashlib

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
PERSONS_DB_FILE = 'data/persons_db.json'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_persons_db():
    if os.path.exists(PERSONS_DB_FILE):
        with open(PERSONS_DB_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_persons_db(data):
    os.makedirs('data', exist_ok=True)
    with open(PERSONS_DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def get_image_hash(image_path):
    """Get a simple hash of image for comparison"""
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')
        img = img.resize((50, 50))
        pixels = list(img.getdata())
        signature = [sum(p) // 3 for p in pixels]
        return signature
    except:
        return None

def compare_images(hash1, hash2):
    """Simple image similarity comparison"""
    if not hash1 or not hash2 or len(hash1) != len(hash2):
        return 0
    
    diff = sum(abs(h1 - h2) for h1, h2 in zip(hash1, hash2))
    max_diff = 255 * len(hash1)
    similarity = max(0, 100 - (diff / max_diff * 100))
    return similarity

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'success': False, 'error': 'Invalid file'}), 400
    
    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        img_hash = get_image_hash(filepath)
        if not img_hash:
            return jsonify({'success': False, 'error': 'Could not process image'}), 400
        
        persons_db = load_persons_db()
        results = []
        
        best_match = None
        best_score = 0
        
        for person_id, person_data in persons_db.items():
            stored_hash = person_data.get('image_hash')
            if stored_hash:
                score = compare_images(stored_hash, img_hash)
                if score > best_score:
                    best_score = score
                    if score > 70:
                        best_match = person_data
        
        if best_match:
            results.append({
                'face_number': 1,
                'match_found': True,
                'person': best_match,
                'confidence': best_score
            })
        else:
            results.append({
                'face_number': 1,
                'match_found': False,
                'confidence': 0
            })
        
        return jsonify({
            'success': True,
            'total_faces': 1,
            'results': results,
            'image_path': filepath
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/add-person', methods=['POST'])
def add_person():
    data = request.get_json()
    
    if 'name' not in data or 'image_path' not in data:
        return jsonify({'success': False, 'error': 'Missing name or image_path'}), 400
    
    try:
        img_hash = get_image_hash(data['image_path'])
        
        if not img_hash:
            return jsonify({'success': False, 'error': 'Could not process image'}), 400
        
        persons_db = load_persons_db()
        person_id = f"person_{len(persons_db) + 1}"
        
        persons_db[person_id] = {
            'id': person_id,
            'name': data['name'],
            'email': data.get('email', ''),
            'phone': data.get('phone', ''),
            'age': data.get('age', ''),
            'image_hash': img_hash
        }
        
        save_persons_db(persons_db)
        
        return jsonify({
            'success': True,
            'message': f'Person {data["name"]} added successfully',
            'person_id': person_id
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/persons', methods=['GET'])
def get_persons():
    persons_db = load_persons_db()
    persons_list = []
    
    for person_id, person_data in persons_db.items():
        person_info = {k: v for k, v in person_data.items() if k != 'image_hash'}
        persons_list.append(person_info)
    
    return jsonify({'success': True, 'persons': persons_list}), 200

@app.route('/api/delete-person/<person_id>', methods=['DELETE'])
def delete_person(person_id):
    try:
        persons_db = load_persons_db()
        
        if person_id in persons_db:
            del persons_db[person_id]
            save_persons_db(persons_db)
            return jsonify({'success': True, 'message': 'Person deleted successfully'}), 200
        else:
            return jsonify({'success': False, 'error': 'Person not found'}), 404
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    print("✅ Starting Person Recognition System...")
    print("📱 Visit: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
