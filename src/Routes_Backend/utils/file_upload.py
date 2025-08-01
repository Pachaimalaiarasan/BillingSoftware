import os
from werkzeug.utils import secure_filename
from flask import current_app

def upload_product_image(file, product_id):
    """
    Uploads a product image to public/ProductImages/
    """
    if not file or file.filename == '':
        return None

    filename = secure_filename(file.filename)
    _, ext = os.path.splitext(filename)
    new_filename = f"product_{product_id}{ext}"

    # Get full path images /public/ProductImages/
    project_root = os.path.abspath(os.path.join(current_app.root_path, '..'))
    upload_folder = os.path.join(project_root, 'public', 'ProductImages')
    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, new_filename)
    try:
        file.save(file_path)
        return new_filename
    except Exception as e:
        current_app.logger.error(f"Error uploading file: {e}")
        return None

def get_product_image_path(filename):
    if not filename:
        return None
    project_root = os.path.abspath(os.path.join(current_app.root_path, '..'))
    upload_folder = os.path.join(project_root, 'public', 'ProductImages')
    return os.path.join(upload_folder, filename)
