# Teacher Portal

A Flask-based web application for managing student records.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git (optional)
- Windows OS

## Project Structure

```
teacher-portal/
│
├── src/
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       └── main.js
│   │
│   ├── templates/
│   │   ├── base.html
│   │   ├── dashboard.html
│   │   └── login.html
│   │
│   ├── app.py
│   ├── models.py
│   └── database.py
│
├── requirements.txt
└── README.md
```

## Local Setup Guide

### 1. Create Virtual Environment

```batch
cd c:\Users\Arbaz Ahmad\Desktop\teacher_portal
python -m venv venv
venv\Scripts\activate
```

### 2. Install Dependencies

Create `requirements.txt`:
```text
flask==2.0.1
flask-sqlalchemy==2.5.1
werkzeug==2.0.1
flask-login==0.5.0
python-dotenv==0.19.0
```

Install packages:
```batch
pip install -r requirements.txt
```

### 3. Environment Setup

Create `.env` file:
```text
FLASK_APP=src/app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///students.db
```

Initialize database:
```batch
cd src
python
>>> from app import init_db
>>> init_db()
>>> exit()
```

### 4. Run Application
```batch
cd src
python app.py
```

Access at: `http://localhost:5000`

## Default Credentials
- Username: `admin`
- Password: `admin123`

## Features

### Dashboard
- View all students in a table format
- Add new students
- Edit existing student records
- Delete students
- Real-time updates

### Student Management
- **Add**: Click "Add" button and fill form
- **Edit**: Use action menu (⋮) → Edit
- **Delete**: Use action menu (⋮) → Delete
- **View**: All students listed in table

## Troubleshooting

### Reset Database
```batch
cd src
del students.db
python
>>> from app import init_db
>>> init_db()
>>> exit()
```

### Port Conflicts
Modify `app.py`:
```python
if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5001)  # Change port
```

## Development Notes

### Database Schema

**Teachers Table**
- id (INTEGER PRIMARY KEY)
- username (TEXT)
- password (TEXT)

**Students Table**
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- subject (TEXT)
- marks (INTEGER)

### Security Notes
- Change default admin password
- Use environment variables
- Debug mode for development only

## Support

If encountering issues:
1. Check console logs
2. Verify Flask debug page
3. Confirm database connection
4. Verify file locations and permissions
5. Check environment setup

## License

MIT License - See LICENSE file for details