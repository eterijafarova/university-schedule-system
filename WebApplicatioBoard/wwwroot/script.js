// ===== STORAGE =====
console.log("SCRIPT LOADED");
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

// ===== USERS PAGE =====
function renderUsers() {
    const students = getData("students");
    const teachers = getData("teachers");

    let html = `<table>
  <tr><th>Name</th><th>Role</th><th>Group</th><th>FIN</th></tr>`;

    students.forEach(s => {
        html += `<tr>
      <td>${s.fullName || s.name}</td>
      <td>Student</td>
      <td>${s.groupId}</td>
      <td>${s.fin}</td>
    </tr>`;
    });

    teachers.forEach(t => {
        html += `<tr>
      <td>${t.fullName || t.name}</td>
      <td>Teacher</td>
      <td>-</td>
      <td>-</td>
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
    const group = document.getElementById("group").value.trim();
    const fin = document.getElementById("fin").value.trim();
    const selectedRole = document.getElementById("role").value;

    if (!name || !surname || !patronymic)
        return alert("Fill all name fields");

    if (selectedRole === "student") {
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
        const teachers = getData("teachers");

        teachers.push({
            id: Date.now(),
            name,
            surname,
            patronymic,
            fullName: `${name} ${surname} ${patronymic}`,
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

    let result;
    
    if (!query) {
        result = students;
    } else {
        result = students.filter(s =>
            (s.fullName && s.fullName.toLowerCase().includes(query)) ||
            (s.fin && s.fin.toLowerCase().includes(query))
        );
    }

    if (result.length === 0) {
        document.getElementById("searchResult").innerHTML = "No students found";
        return;
    }

    let html = `
        <table>
            <tr>
                <th>Full Name</th>
                <th>FIN</th>
                <th>Group</th>
            </tr>
    `;

    result.forEach(s => {
        html += `
            <tr>
                <td>${s.fullName}</td>
                <td>${s.fin}</td>
                <td>${s.groupId}</td>
            </tr>
        `;
    });

    html += "</table>";

    document.getElementById("searchResult").innerHTML = html;
}

// ===== SCHEDULE =====
function renderSchedule() {
    const schedule = getData("schedule");
    const teachers = getData("teachers");
    const students = getData("students");

    let html = `<table>
  <tr>
  <th>Day</th><th>Time</th><th>Subject</th>
  <th>Room</th><th>Group</th><th>Teacher</th><th>Students</th>
  </tr>`;

    schedule.forEach(l => {
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

// ===== ADD LESSON =====
function addLesson() {
    const schedule = getData("schedule");

    const day = document.getElementById("day").value;
    const time = document.getElementById("time").value;
    const subject = document.getElementById("subject").value;
    const room = document.getElementById("room").value;
    const groupId = document.getElementById("groupId").value;
    const teacherId = Number(document.getElementById("teacherSelect").value);

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

    if (!teacher) {
        alert("Teacher not found");
        return;
    }

    if (!teacher.password) {
        alert("This teacher has no password");
        return;
    }

    if (teacher.password !== password) {
        alert("Wrong password");
        return;
    }

    localStorage.setItem("currentTeacherId", teacherId);
    
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.classList.add("logout-btn");

    alert("Login successful");
}

// ===== LOGOUT =====
function logout() {
    const btn = document.getElementById("logoutBtn");
    if (btn) btn.classList.remove("logout-btn");

    localStorage.setItem("currentUserRole", "student");
    alert("Logged out");
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    init();

    if (document.getElementById("usersTable")) renderUsers();
    if (document.getElementById("scheduleTable")) renderSchedule();

    loadLoginTeachers();
    loadTeachers();
});