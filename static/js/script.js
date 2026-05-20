// Image preview for recognition
document.getElementById('recognizeImage').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('imagePreview').innerHTML = 
                `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Image preview for add person
document.getElementById('personImage').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('personImagePreview').innerHTML = 
                `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Handle recognition form submission
document.getElementById('recognizeForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const recognizeBtn = document.getElementById('recognizeBtn');
    const recognizeLoader = document.getElementById('recognizeLoader');
    
    // Show loader
    recognizeBtn.style.display = 'none';
    recognizeLoader.style.display = 'inline';
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayResults(data.results);
            document.getElementById('recognitionError').style.display = 'none';
        } else {
            showError(data.error, 'recognitionError');
            document.getElementById('recognitionResults').style.display = 'none';
        }
    } catch (error) {
        showError('Error uploading image: ' + error.message, 'recognitionError');
        document.getElementById('recognitionResults').style.display = 'none';
    } finally {
        // Hide loader
        recognizeBtn.style.display = 'inline';
        recognizeLoader.style.display = 'none';
    }
});

// Display recognition results
function displayResults(results) {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';
    
    results.forEach(result => {
        let html = `
            <div class="result-item ${result.match_found ? 'found' : 'not-found'}">
                <strong>Face ${result.face_number}:</strong>
        `;
        
        if (result.match_found) {
            const person = result.person;
            const confidence = result.confidence;
            const confidenceClass = confidence > 80 ? 'confidence-high' : 
                                   confidence > 60 ? 'confidence-medium' : 'confidence-low';
            
            html += `
                <p class="mb-2">
                    <span class="badge bg-success">MATCH FOUND</span>
                </p>
                <p><strong>Name:</strong> ${person.name}</p>
                ${person.email ? `<p><strong>Email:</strong> ${person.email}</p>` : ''}
                ${person.phone ? `<p><strong>Phone:</strong> ${person.phone}</p>` : ''}
                ${person.age ? `<p><strong>Age:</strong> ${person.age}</p>` : ''}
                <p>
                    <span class="confidence-badge ${confidenceClass}">
                        Confidence: ${confidence.toFixed(2)}%
                    </span>
                </p>
            `;
        } else {
            html += `
                <p class="mb-2">
                    <span class="badge bg-warning">NO MATCH</span>
                </p>
                <p>This person is not in the database.</p>
            `;
        }
        
        html += '</div>';
        resultsList.innerHTML += html;
    });
    
    document.getElementById('recognitionResults').style.display = 'block';
}

// Handle add person form submission
document.getElementById('addPersonForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const name = document.getElementById('personName').value;
    const email = document.getElementById('personEmail').value;
    const phone = document.getElementById('personPhone').value;
    const age = document.getElementById('personAge').value;
    const imageFile = document.getElementById('personImage').files[0];
    
    if (!imageFile) {
        showError('Please select an image', 'addPersonError');
        return;
    }
    
    // First upload the image
    const uploadFormData = new FormData();
    uploadFormData.append('image', imageFile);
    
    const addPersonBtn = document.getElementById('addPersonBtn');
    const addPersonLoader = document.getElementById('addPersonLoader');
    
    // Show loader
    addPersonBtn.style.display = 'none';
    addPersonLoader.style.display = 'inline';
    
    try {
        // Upload image first
        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData
        });
        
        const uploadData = await uploadResponse.json();
        
        if (!uploadData.success) {
            showError('Error: ' + uploadData.error, 'addPersonError');
            document.getElementById('addPersonSuccess').style.display = 'none';
            return;
        }
        
        // Then add person with image path
        const response = await fetch('/api/add-person', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                age: age,
                image_path: uploadData.image_path
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('addPersonSuccess').innerHTML = data.message;
            document.getElementById('addPersonSuccess').style.display = 'block';
            document.getElementById('addPersonError').style.display = 'none';
            
            // Reset form
            document.getElementById('addPersonForm').reset();
            document.getElementById('personImagePreview').innerHTML = '';
            
            // Load updated database
            setTimeout(loadPersonsDatabase, 1000);
        } else {
            showError(data.error, 'addPersonError');
            document.getElementById('addPersonSuccess').style.display = 'none';
        }
    } catch (error) {
        showError('Error: ' + error.message, 'addPersonError');
        document.getElementById('addPersonSuccess').style.display = 'none';
    } finally {
        // Hide loader
        addPersonBtn.style.display = 'inline';
        addPersonLoader.style.display = 'none';
    }
});

// Load and display persons database
async function loadPersonsDatabase() {
    try {
        const response = await fetch('/api/persons');
        const data = await response.json();
        
        if (data.success && data.persons.length > 0) {
            const tbody = document.getElementById('personsTableBody');
            tbody.innerHTML = '';
            
            data.persons.forEach(person => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${person.name}</td>
                    <td>${person.email || '-'}</td>
                    <td>${person.phone || '-'}</td>
                    <td>${person.age || '-'}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deletePerson('${person.id}')">
                            🗑️ Delete
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            document.getElementById('personsTableContainer').style.display = 'block';
            document.getElementById('noPersonsMsg').style.display = 'none';
        } else {
            document.getElementById('personsTableContainer').style.display = 'none';
            document.getElementById('noPersonsMsg').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading persons:', error);
    }
}

// Delete person from database
async function deletePerson(personId) {
    if (!confirm('Are you sure you want to delete this person?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/delete-person/${personId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Person deleted successfully');
            loadPersonsDatabase();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Show error message
function showError(message, elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.innerHTML = message;
    errorElement.style.display = 'block';
}

// Load persons on page load
document.addEventListener('DOMContentLoaded', function () {
    // Load database when database tab is clicked
    document.getElementById('database-tab').addEventListener('click', loadPersonsDatabase);
});
