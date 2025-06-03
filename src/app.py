from flask import Flask, render_template, request, redirect, session, jsonify
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# DB Initialization
DATABASE = 'students.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    with conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS teachers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                subject TEXT NOT NULL,
                marks INTEGER NOT NULL
            );
        ''')

        cur = conn.execute("SELECT * FROM teachers WHERE username = ?", ("admin",))
        if not cur.fetchone():
            hashed = generate_password_hash("admin123")
            conn.execute("INSERT INTO teachers (username, password) VALUES (?, ?)", ("admin", hashed))
    conn.close()

@app.route('/')
def index():
    return redirect('/login')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        conn = get_db_connection()
        # Check if username exists
        user = conn.execute("SELECT * FROM teachers WHERE username = ?", (username,)).fetchone()
        if not user:
            return render_template('login.html', error='Invalid username')
        
        # Check password
        if not check_password_hash(user['password'], password):
            return render_template('login.html', error='Invalid password')
        
        # Success - set session and redirect
        session['user_id'] = user['id']
        return redirect('/dashboard')
    
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect('/login')
    return render_template('dashboard.html')

@app.route('/api/students/<int:id>', methods=['GET'])
def get_student(id):
    conn = get_db_connection()
    student = conn.execute('SELECT * FROM students WHERE id = ?', (id,)).fetchone()
    conn.close()
    if student is None:
        return jsonify({'error': 'Student not found'}), 404
    return jsonify({
        'id': student['id'],
        'name': student['name'],
        'subject': student['subject'],
        'marks': student['marks']
    })

@app.route('/api/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    conn = get_db_connection()
    student = conn.execute('SELECT * FROM students WHERE id = ?', (id,)).fetchone()
    if student is None:
        return jsonify({'error': 'Student not found'}), 404
    conn.execute('DELETE FROM students WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student deleted successfully'})

@app.route('/api/students', methods=['PUT'])
def update_student():
    data = request.get_json()
    conn = get_db_connection()
    student = conn.execute('SELECT * FROM students WHERE id = ?', (data['id'],)).fetchone()
    if student is None:
        return jsonify({'error': 'Student not found'}), 404
    conn.execute('UPDATE students SET name = ?, subject = ?, marks = ? WHERE id = ?', 
                (data['name'], data['subject'], data['marks'], data['id']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student updated successfully'})

@app.route('/api/students', methods=['POST'])
def create_student():
    data = request.get_json()
    conn = get_db_connection()
    conn.execute('INSERT INTO students (name, subject, marks) VALUES (?, ?, ?)', 
                 (data['name'], data['subject'], data['marks']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student created successfully'})

@app.route('/api/students', methods=['GET'])
def get_students():
    conn = get_db_connection()
    students = conn.execute('SELECT * FROM students').fetchall()
    conn.close()
    return jsonify([{
        'id': student['id'],
        'name': student['name'],
        'subject': student['subject'],
        'marks': student['marks']
    } for student in students])

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

if __name__ == '__main__':
    init_db()
    app.run(debug=True)