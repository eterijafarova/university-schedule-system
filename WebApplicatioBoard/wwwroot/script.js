// ===== STORAGE =====
console.log("SCRIPT LOADED");

let editMode = null; // { type: "student"/"teacher", id: number }
function init() {
    if (!localStorage.getItem("students"))
        localStorage.setItem("students", JSON.stringify(initialStudents));

    if (!localStorage.getItem("teachers"))
        localStorage.setItem("teachers", JSON.stringify(initialTeachers));

    if (!localStorage.getItem("schedule"))
        localStorage.setItem("schedule", JSON.stringify(initialSchedule));
}

// ===== HELPERS =====
function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ===== UI =====
function toggleRoleFields() {
    const role = document.getElementById("role").value;

    const studentFields = document.getElementById("studentFields");
    const teacherFields = document.getElementById("teacherFields");

    if (role === "teacher") {
        studentFields.style.display = "none";
        teacherFields.style.display = "block";
    } else {
        studentFields.style.display = "block";
        teacherFields.style.display = "none";
    }
}

// ===== USERS =====
function renderUsers() {
    const students = getData("students");
    const teachers = getData("teachers");

    let html = `<table>
<tr>
<th>Name</th><th>Role</th><th>Group</th><th>FIN</th><th>Action</th>
</tr>`;

    students.forEach(s => {
        html += `<tr>
<td>${s.fullName}</td>
<td>Student</td>
<td>${s.groupId}</td>
<td>${s.fin}</td>
<td>
    <button onclick="editStudent(${s.id})">Edit</button>
    <button class="delete" onclick="deleteStudent(${s.id})">Delete</button>
</td>
</tr>`;
    });

    teachers.forEach(t => {
        html += `<tr>
<td>${t.fullName}</td>
<td>Teacher</td>
<td>-</td>
<td>-</td>
<td>
    <button onclick="editTeacher(${t.id})">Edit</button>
    <button class="delete" onclick="deleteTeacher(${t.id})">Delete</button>
</td>
</tr>`;
    });

    html += "</table>";

    document.getElementById("usersTable").innerHTML = html;
}

// ===== ADD USER =====
function addUser() {
    const teacherId = localStorage.getItem("currentTeacherId");

    if (!teacherId) {
        alert("Please login as teacher first");
        return;
    }
    
    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const patronymic = document.getElementById("patronymic").value.trim();
    const role = document.getElementById("role").value;

    const group = document.getElementById("group")?.value.trim();
    const fin = document.getElementById("fin")?.value.trim();

    // ===== EDIT MODE =====
    if (editMode) {
        if (editMode.type === "student") {
            let students = getData("students");

            const index = students.findIndex(s => s.id === editMode.id);

            students[index] = {
                ...students[index],
                name,
                surname,
                patronymic,
                fullName: `${name} ${surname} ${patronymic}`,
                groupId: group,
                fin
            };

            setData("students", students);
        }

        if (editMode.type === "teacher") {
            let teachers = getData("teachers");

            const index = teachers.findIndex(t => t.id === editMode.id);

            const subjects = document.getElementById("subjects").value
                .split(",")
                .map(s => s.trim().toLowerCase());

            const password = document.getElementById("password").value;

            teachers[index] = {
                ...teachers[index],
                name,
                surname,
                patronymic,
                fullName: `${name} ${surname} ${patronymic}`,
                subjects,
                password
            };

            setData("teachers", teachers);
        }

        editMode = null;
        alert("User updated");

        renderUsers();
        loadTeachers();
        loadLoginTeachers();
        loadSubjects();

        return;
    }

    // ===== CREATE MODE =====
    if (!name || !surname || !patronymic)
        return alert("Fill all name fields");

    if (role === "student") {
        const students = getData("students");

        if (!group || !fin) {
            alert("Enter group and FIN");
            return;
        }

        if (students.some(s => s.fin === fin)) {
            alert("User with this FIN already exists");
            return;
        }

        students.push({
            id: Date.now(),
            name,
            surname,
            patronymic,
            fullName: `${name} ${surname} ${patronymic}`,
            fin,
            groupId: group
        });

        setData("students", students);
    } else {
        const subjectsInput = document.getElementById("subjects").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!subjectsInput || !password) {
            alert("Enter subjects and password");
            return;
        }

        const subjects = subjectsInput
            .split(",")
            .map(s => s.trim().toLowerCase());

        const teachers = getData("teachers");

        teachers.push({
            id: Date.now(),
            name,
            surname,
            patronymic,
            fullName: `${name} ${surname} ${patronymic}`,
            password,
            subjects
        });

        setData("teachers", teachers);
    }

    renderUsers();
    loadLoginTeachers();
    loadTeachers();
}


// ===== SEARCH =====
function searchStudent() {
    const query = document.getElementById("search").value.toLowerCase().trim();
    const students = getData("students");

    let result = !query
        ? students
        : students.filter(s =>
            s.fullName.toLowerCase().includes(query) ||
            s.fin.toLowerCase().includes(query)
        );

    if (result.length === 0) {
        document.getElementById("searchResult").innerHTML = "No students found";
        return;
    }

    let html = `
<table>
<tr><th>Full Name</th><th>FIN</th><th>Group</th></tr>
`;

    result.forEach(s => {
        html += `
<tr>
<td>${s.fullName}</td>
<td>${s.fin}</td>
<td>${s.groupId}</td>
</tr>`;
    });

    html += "</table>";

    document.getElementById("searchResult").innerHTML = html;
}

// ===== SCHEDULE =====
function renderSchedule() {
    const schedule = getData("schedule");
    renderFilteredSchedule(schedule);
}

// ===== ADD LESSON =====
function addLesson() {
    const schedule = getData("schedule");

    const day = document.getElementById("day").value;
    const time = document.getElementById("time").value;
    if (!time) {
        alert("Enter time");
        return;
    }
    const subject = document.getElementById("subject").value;
    if (!subject) {
        alert("Select subject");
        return;
    }
    const room = document.getElementById("room").value;
    const groupId = document.getElementById("groupId").value;

    if (!groupId) {
        alert("Select group");
        return;
    }
    const teacherId = Number(document.getElementById("teacherSelect").value);

    const teachers = getData("teachers");
    const teacher = teachers.find(t => t.id === teacherId);

    if (!teacher) return alert("Teacher not found");

    if (!teacher.subjects || !teacher.subjects.includes(subject.toLowerCase())) {
        alert("This teacher cannot teach this subject");
        return;
    }

    const toMinutes = t => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    };

    for (let l of schedule) {
        if (l.teacherId === teacherId && l.day === day) {
            if (l.time === time) {
                alert("You already have a lesson at this time");
                return;
            }

            if (Math.abs(toMinutes(l.time) - toMinutes(time)) < 90) {
                alert("Next lesson must be at least 1.5 hours later");
                return;
            }
        }
    }

    schedule.push({ day, time, subject, room, groupId, teacherId });
    setData("schedule", schedule);

    renderSchedule();
}

// ===== FILTER =====
function filterSchedule() {
    const day = document.getElementById("filterDay")?.value;
    const group = document.getElementById("groupSelect")?.value;

    let schedule = getData("schedule");

    if (day) schedule = schedule.filter(s => s.day === day);
    if (group) schedule = schedule.filter(s => s.groupId === group);

    renderFilteredSchedule(schedule);
}

// ===== RENDER FILTERED =====
function renderFilteredSchedule(data) {
    const teachers = getData("teachers");
    const students = getData("students");

    let html = `<table>
<tr>
<th>Day</th><th>Time</th><th>Subject</th>
<th>Room</th><th>Group</th><th>Teacher</th><th>Students</th>
</tr>`;

    data.forEach(l => {
        const teacher = teachers.find(t => t.id === l.teacherId);
        const count = students.filter(s => s.groupId === l.groupId).length;

        html += `<tr>
<td>${l.day}</td>
<td>${l.time}</td>
<td>${l.subject}</td>
<td>${l.room}</td>
<td>${l.groupId}</td>
<td>${teacher ? teacher.fullName : ""}</td>
<td>${count}</td>
</tr>`;
    });

    html += "</table>";

    document.getElementById("scheduleTable").innerHTML = html;
}

// ===== GROUPS =====
function loadGroups() {
    const students = getData("students");
    const select = document.getElementById("groupSelect");

    if (!select) return;

    const groups = [...new Set(students.map(s => s.groupId))];

    select.innerHTML =
        `<option value="">All Groups</option>` +
        groups.map(g => `<option>${g}</option>`).join("");
}

// ===== LOAD TEACHERS =====
function loadTeachers() {
    const teachers = getData("teachers");
    const select = document.getElementById("teacherSelect");

    if (!select) return;

    select.innerHTML = teachers.map(t =>
        `<option value="${t.id}">${t.fullName}</option>`
    ).join("");
}

// ===== LOGIN LIST =====
function loadLoginTeachers() {
    const teachers = getData("teachers");
    const select = document.getElementById("loginTeacher");

    if (!select) return;

    select.innerHTML = teachers.map(t =>
        `<option value="${t.id}">${t.fullName}</option>`
    ).join("");
}

// ===== LOGIN =====
function loginTeacher() {
    const teacherId = Number(document.getElementById("loginTeacher").value);
    const password = document.getElementById("loginPassword").value.trim();

    const teachers = getData("teachers");
    const teacher = teachers.find(t => t.id === teacherId);

    if (!teacher) return alert("Teacher not found");
    if (!teacher.password) return alert("No password");
    if (teacher.password !== password) return alert("Wrong password");

    localStorage.setItem("currentTeacherId", teacherId);

    document.getElementById("logoutBtn")?.classList.add("logout-btn");

    alert("Login successful");
}

// ===== LOGOUT =====
function logout() {
    localStorage.removeItem("currentTeacherId");
    document.getElementById("logoutBtn")?.classList.remove("logout-btn");
    alert("Logged out");
}


function loadGroupsToLesson() {
    const students = getData("students");
    const select = document.getElementById("groupId");

    if (!select) return;

    const groups = [...new Set(students.map(s => s.groupId))];

    if (groups.length === 0) {
        select.innerHTML = "<option>No groups</option>";
        return;
    }

    select.innerHTML =
        `<option value="">Select Group</option>` +
        groups.map(g => `<option>${g}</option>`).join("");
}


function loadSubjects() {
    const teachers = getData("teachers");
    const select = document.getElementById("subject");

    if (!select) return;
    
    let subjects = [];

    teachers.forEach(t => {
        if (t.subjects) {
            subjects = subjects.concat(t.subjects);
        }
    });
    
    subjects = [...new Set(subjects)];

    if (subjects.length === 0) {
        select.innerHTML = "<option>No subjects</option>";
        return;
    }

    select.innerHTML =
        `<option value="">Select Subject</option>` +
        subjects.map(s => `<option>${s}</option>`).join("");
}


function loadSubjectsByTeacher() {
    const teacherId = Number(document.getElementById("teacherSelect").value);
    const teachers = getData("teachers");
    const select = document.getElementById("subject");

    if (!select) return;

    const teacher = teachers.find(t => t.id === teacherId);
    
    select.innerHTML = `<option value="">Select Subject</option>`;

    if (!teacher || !teacher.subjects || teacher.subjects.length === 0) {
        return;
    }
    
    select.innerHTML += teacher.subjects
        .map(s => `<option>${s}</option>`)
        .join("");
}

/* DELETE */
function deleteStudent(id) {
    let students = getData("students");

    students = students.filter(s => s.id !== id);
    setData("students", students);

    renderUsers();
    loadGroups();
    loadGroupsToLesson();
}


function deleteTeacher(id) {
    const schedule = getData("schedule");
    
    const hasLessons = schedule.some(s => s.teacherId === id);

    if (hasLessons) {
        alert("Cannot delete teacher with assigned lessons");
        return;
    }

    let teachers = getData("teachers");
    teachers = teachers.filter(t => t.id !== id);

    setData("teachers", teachers);

    renderUsers();
    loadTeachers();
    loadLoginTeachers();
}


/* EDIT */
function editStudent(id) {
    const students = getData("students");
    const s = students.find(x => x.id === id);

    if (!s) return;

    editMode = { type: "student", id };

    document.getElementById("name").value = s.name;
    document.getElementById("surname").value = s.surname;
    document.getElementById("patronymic").value = s.patronymic;
    document.getElementById("group").value = s.groupId;
    document.getElementById("fin").value = s.fin;

    document.getElementById("role").value = "student";
    toggleRoleFields();
}


function editTeacher(id) {
    const teachers = getData("teachers");
    const t = teachers.find(x => x.id === id);

    if (!t) return;

    editMode = { type: "teacher", id };

    document.getElementById("name").value = t.name;
    document.getElementById("surname").value = t.surname;
    document.getElementById("patronymic").value = t.patronymic;
    document.getElementById("subjects").value = (t.subjects || []).join(",");
    document.getElementById("password").value = t.password || "";

    document.getElementById("role").value = "teacher";
    toggleRoleFields();
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
    init();

    if (document.getElementById("usersTable")) renderUsers();
    if (document.getElementById("scheduleTable")) renderSchedule();

    loadLoginTeachers();
    loadTeachers();
    loadGroups();
    loadGroupsToLesson();
    loadSubjectsByTeacher();

  
    if (document.getElementById("role")) {
        toggleRoleFields();
    }
});