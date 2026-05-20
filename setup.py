import os
import shutil

# Create directory structure
dirs = ['templates', 'static/css', 'static/js', 'static/uploads', 'data']
for dir_path in dirs:
    os.makedirs(dir_path, exist_ok=True)

# Move files to correct locations
if os.path.exists('templates_index.html'):
    shutil.move('templates_index.html', 'templates/index.html')
    
if os.path.exists('static_style.css'):
    shutil.move('static_style.css', 'static/css/style.css')
    
if os.path.exists('static_script.js'):
    shutil.move('static_script.js', 'static/js/script.js')

print("Project structure created successfully!")
print("Directories created: templates/, static/, static/css/, static/js/, static/uploads/, data/")
