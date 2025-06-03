import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

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
        # Create a default teacher if not exists
        cur = conn.execute("SELECT * FROM teachers WHERE username = ?", ("admin",))
        if not cur.fetchone():
            hashed = generate_password_hash("admin123")
            conn.execute("INSERT INTO teachers (username, password) VALUES (?, ?)", ("admin", hashed))
    conn.close()

def add_student(name, subject, marks):
    conn = get_db_connection()
    conn.execute('INSERT INTO students (name, subject, marks) VALUES (?, ?, ?)', (name, subject, marks))
    conn.commit()
    conn.close()

def get_students():
    conn = get_db_connection()
    students = conn.execute('SELECT * FROM students').fetchall()
    conn.close()
    return students

def update_student(student_id, name, subject, marks):
    conn = get_db_connection()
    conn.execute('UPDATE students SET name = ?, subject = ?, marks = ? WHERE id = ?', (name, subject, marks, student_id))
    conn.commit()
    conn.close()

def delete_student(student_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM students WHERE id = ?', (student_id,))
    conn.commit()
    conn.close()