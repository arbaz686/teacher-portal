// Add this at the top of your main.js file
function initTheme() {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    if (theme === 'dark') {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// Load students when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    
    initTheme();
    
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
});

function loadStudents() {
    fetch('/api/students')
        .then(response => response.json())
        .then(students => renderStudents(students))
        .catch(error => showError('Error loading students'));
}

function renderStudents(students) {
    const tbody = document.getElementById('studentsList');
    tbody.innerHTML = '';
    
    students.forEach((student) => {
        const initial = student.name.charAt(0).toUpperCase();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="name-cell">
                <div class="initial-circle">${initial}</div>
                ${student.name}
            </td>
            <td>${student.subject}</td>
            <td>${student.marks}</td>
            <td class="action-cell">
                <div class="action-dropdown">
                    <button class="action-btn" onclick="event.stopPropagation(); toggleDropdown(${student.id})">
                        <i class="fas fa-ellipsis-vertical"></i>
                    </button>
                    <div id="dropdown-${student.id}" class="dropdown-content">
                        <a href="#" onclick="event.preventDefault(); handleEdit(${student.id})">
                            <i class="fas fa-edit"></i> Edit
                        </a>
                        <a href="#" onclick="event.preventDefault(); handleDelete(${student.id})">
                            <i class="fas fa-trash"></i> Delete
                        </a>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleDropdown(studentId) {
    // Close all other dropdowns first
    const dropdowns = document.getElementsByClassName("dropdown-content");
    Array.from(dropdowns).forEach(dropdown => {
        if (dropdown.id !== `dropdown-${studentId}` && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    });
    
    // Toggle the clicked dropdown
    const dropdown = document.getElementById(`dropdown-${studentId}`);
    dropdown.classList.toggle("show");
}

function handleEdit(studentId) {
    // Close dropdown and edit
    const dropdown = document.getElementById(`dropdown-${studentId}`);
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    editStudent(studentId);
}

function handleDelete(studentId) {
    // Close dropdown and delete
    const dropdown = document.getElementById(`dropdown-${studentId}`);
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    deleteStudent(studentId);
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.matches('.action-btn') && !event.target.matches('.fa-ellipsis-vertical')) {
        closeAllDropdowns();
    }
});

function openAddModal() {
    const modal = document.getElementById('studentModal');
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('studentModal');
    modal.classList.remove('show');
    
    // Reset form when closing
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Student';
    document.querySelector('#studentForm .btn').textContent = 'Add';
}

document.getElementById('studentForm').onsubmit = function(e) {
    e.preventDefault();
    const studentId = document.getElementById('studentId').value;
    const data = {
        name: document.getElementById('name').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        marks: parseInt(document.getElementById('marks').value)
    };

    // If editing existing student, proceed with PUT request
    if (studentId) {
        data.id = parseInt(studentId);
        updateStudent(data);
        return;
    }

    // For new students, check for duplicates first
    checkAndHandleDuplicate(data);
};

function checkAndHandleDuplicate(newData) {
    fetch('/api/students')
        .then(response => response.json())
        .then(students => {
            const existingStudent = students.find(s => 
                s.name.toLowerCase() === newData.name.toLowerCase() && 
                s.subject.toLowerCase() === newData.subject.toLowerCase()
            );

            if (existingStudent) {
                // Calculate new total marks
                const existingMarks = parseInt(existingStudent.marks);
                const newMarks = parseInt(newData.marks);
                const totalMarks = existingMarks + newMarks;

                // Show confirmation with clear calculation
                const confirmMessage = 
                    `Found existing student record:\n` +
                    `Name: ${existingStudent.name}\n` +
                    `Subject: ${existingStudent.subject}\n` +
                    `Current Marks: ${existingMarks}\n\n` +
                    `New marks to add: ${newMarks}\n` +
                    `Total after update will be: ${totalMarks}\n\n` +
                    `Do you want to update the marks?`;

                if (confirm(confirmMessage)) {
                    const updatedData = {
                        id: existingStudent.id,
                        name: existingStudent.name,
                        subject: existingStudent.subject,
                        marks: totalMarks
                    };
                    
                    // Call update function with total marks
                    updateExistingStudentMarks(updatedData);
                }
            } else {
                createNewStudent(newData);
            }
        })
        .catch(error => showError('Error checking for duplicates'));
}

function createNewStudent(data) {
    fetch('/api/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(result => {
        closeModal();
        loadStudents();
        showSuccess('Student added successfully');
    })
    .catch(error => showError('Error adding student'));
}

function editStudent(id) {
    console.log('Editing student:', id);
    fetch(`/api/students/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(student => {
            console.log('Student data:', student);
            // Populate form
            document.getElementById('studentId').value = student.id;
            document.getElementById('name').value = student.name;
            document.getElementById('subject').value = student.subject;
            document.getElementById('marks').value = student.marks;
            
            // Update modal title and button
            document.getElementById('modalTitle').textContent = 'Edit Student';
            document.querySelector('#studentForm .btn').textContent = 'Update';
            
            // Show modal using the correct class
            const modal = document.getElementById('studentModal');
            modal.classList.add('show');
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Error loading student details');
        });
}

function updateStudent(data) {
    // Ensure marks is a number
    data.marks = Number(data.marks);
    
    // Get original student data to compare changes
    fetch(`/api/students/${data.id}`)
        .then(response => response.json())
        .then(originalStudent => {
            // Make the update request
            fetch('/api/students', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(result => {
                closeModal();
                loadStudents();
                
                // Create update message based on what changed
                let changes = [];
                if (originalStudent.name !== data.name) {
                    changes.push(`name from "${originalStudent.name}" to "${data.name}"`);
                }
                if (originalStudent.subject !== data.subject) {
                    changes.push(`subject from "${originalStudent.subject}" to "${data.subject}"`);
                }
                if (originalStudent.marks !== data.marks) {
                    changes.push(`marks from ${originalStudent.marks} to ${data.marks}`);
                }
                
                // Show appropriate success message
                if (changes.length > 0) {
                    showSuccess(`Updated student's ${changes.join(', ')}`);
                } else {
                    showSuccess('No changes made to student record');
                }
                
                // Reset the form
                document.getElementById('studentForm').reset();
                document.getElementById('studentId').value = '';
            })
            .catch(error => showError('Error updating student'));
        })
        .catch(error => showError('Error fetching original student data'));
}

function updateExistingStudentMarks(data) {
    fetch('/api/students', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(result => {
        closeModal();
        loadStudents();
        showSuccess(`Updated ${data.name}'s marks to ${data.marks} in ${data.subject}`);
    })
    .catch(error => showError('Error updating student marks'));
}

function deleteStudent(id) {
    console.log('Deleting student:', id); // Debug log
    if (confirm('Are you sure you want to delete this student?')) {
        fetch(`/api/students/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(() => {
            loadStudents();
            showSuccess('Student deleted successfully');
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Error deleting student');
        });
    }
}

// Add success message function
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${message}
    `;
    
    const content = document.querySelector('.content');
    content.insertBefore(successDiv, content.firstChild);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Add these helper functions if not already present
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${message}
    `;
    
    const content = document.querySelector('.content');
    content.insertBefore(errorDiv, content.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('studentModal');
    if (event.target === modal) {
        closeModal();
    }
}