var saveUser = function (arr) {
    localStorage.user = JSON.stringify(arr);
}
var saveCurrentUser = function (user) {
    localStorage.current_user = JSON.stringify(user);
}
var loadUser = function () {
    var arr = JSON.parse(localStorage.user || '[]');
    return arr;
}
var loadCurrentUser = function () {
    var user = JSON.parse(localStorage.current_user || '{}');
    return user;
}

function register() {
    let user = [];
    let usernameStr = document.getElementById("username1").value;
    let passwordStr = document.getElementById("pwd1").value;
    if (localStorage.user != null) {
        user = loadUser();
    }
    if (usernameStr == "") {
        msg1.style.display = "block";
        msg1.innerText = "Username can't be empty!";
        return;
    }
    if (passwordStr == "") {
        msg1.style.display = "block";
        msg1.innerText = "Password can't be empty!";
        return;
    }
    for (let i = 0; i < user.length; i++) {
        if (user[i].username == usernameStr) {
            msg1.style.display = "block";
            msg1.innerText = "That username has been registered!";
            return;
        }
    }
    msg1.style.display = "block";
    msg1.style.color = "green";
    msg1.innerText = "Successfully registered!";
    let this_user = {
        username: usernameStr,
        password: passwordStr,
        students: []
    };
    user.push(this_user);
    saveUser(user);
    setTimeout(function () {
        window.location.href = "../index.html?username=" + usernameStr + "&pws=" + passwordStr + "";
    }, 1000);
    return;
}

function login() {
    let user = [];
    let usernameStr = document.getElementById("username").value;
    let passwordStr = document.getElementById("pwd").value;
    if (localStorage.user != null) {
        user = loadUser();
    }
    if (usernameStr == "") {
        msg.style.display = "block";
        msg.innerText = "Username can't be empty!";
        return;
    }
    if (passwordStr == "") {
        msg.style.display = "block";
        msg.innerText = "Password can't be empty!";
        return;
    }
    for (let i = 0; i < user.length; i++) {
        if (usernameStr == user[i].username && passwordStr == user[i].password) {
            msg.style.display = "block";
            msg.style.color = "green";
            msg.innerText = "Login successfully!";
            saveCurrentUser(user[i]);
            setTimeout(function () {
                window.location.href = "./html/main.html";
            }, 1000);
            return;
        }
    }
    msg.style.display = "block";
    msg.innerText = "Username or password is wrong!";
    return;
}

function quit() {
    let current_user = loadCurrentUser();
    if (localStorage.user != null) {
        user = loadUser();
    }
    for (let i = 0; i < user.length; i++) {
        if (current_user.username == user[i].username && current_user.password == user[i].password) {
            // console.log('Current User:', current_user);
            user[i].students=current_user.students;
            break;
        }
    }
    saveUser(user);
    localStorage.removeItem("current_user");
    alert("Successfully logged out!");
    window.location.href = "../index.html";
    return;
}

function showUserName() {
    if (localStorage.current_user != null) {
        let current_user = loadCurrentUser();
        un.innerText = current_user.username;
    }
}
function addStudent(studentName, score) {
    let currentUser = loadCurrentUser();
    console.log('Current User:', currentUser);

    if (!currentUser || !Array.isArray(currentUser.students)) {
        currentUser.students = [];
    }

    if (!currentUser.students.some(student => student.name === studentName)) {
        currentUser.students.push({ name: studentName, score: score });
        saveCurrentUser(currentUser);
        console.log('Added Student:', studentName);
        return true;
    }
    console.log('Student already exists:', studentName);
    return false;
}

function showStudentsList() {
    let currentUser = loadCurrentUser();
    let studentsBody = document.getElementById('studentsBody');
    studentsBody.innerHTML = '';

    if (currentUser && Array.isArray(currentUser.students)) {
        currentUser.students.forEach(student => {
            const tr = document.createElement('tr');
            const tdName = document.createElement('td');
            const tdScore = document.createElement('td');
            const tdActions = document.createElement('td');

            tdName.textContent = student.name;
            tdScore.textContent = student.score;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete';
            deleteButton.textContent = 'delete';
            deleteButton.addEventListener('click', function() {
                deleteStudent(student.name);
                showStudentsList();
            });
            const scoreSelect = document.createElement('select');
            scoreSelect.className = 'score-select';
            scoreSelect.innerHTML = `
                <option value="add">add</option>
                <option value="subtract">deduct</option>
            `;
            scoreSelect.addEventListener('change', function() {
                const action = this.value;
                const inputScore = tr.querySelector('.score-input');
                const reasonInput = tr.querySelector('.reason-input');
                if (action === 'add' || action === 'subtract') {
                    inputScore.disabled = false;
                    reasonInput.disabled = false;
                    inputScore.style.display = 'inline-block';
                    reasonInput.style.display = 'inline-block';
                } else {
                    inputScore.disabled = true;
                    reasonInput.disabled = true;
                    inputScore.style.display = 'none';
                    reasonInput.style.display = 'none';
                }
            });
            const inputScore = document.createElement('input');
            inputScore.type = 'number';
            inputScore.placeholder = 'points';
            inputScore.className = 'score-input';
            const reasonInput = document.createElement('input');
            reasonInput.type = 'text';
            reasonInput.placeholder = 'reason';
            reasonInput.className = 'reason-input';
            const submitButton = document.createElement('button');
            submitButton.textContent = 'submit';
            submitButton.addEventListener('click', function() {
                const action = scoreSelect.value;
                const delta = parseInt(inputScore.value);
                const reason = reasonInput.value;
                if (isNaN(delta)) {
                    alert('Please input valid number!');
                    location.reload();
                    return;
                }
                modifyScore(student.name, action === 'add' ? delta : -delta, reason);
                alert('Success！');
                location.reload();
            });
            const historyButton = document.createElement('button');
            historyButton.textContent = 'show history';
            historyButton.addEventListener('click', function() {
                showHistory(student.name, student.history);
            });

            tdActions.appendChild(deleteButton);
            tdActions.appendChild(scoreSelect);
            tdActions.appendChild(inputScore);
            tdActions.appendChild(reasonInput);
            tdActions.appendChild(submitButton);
            tdActions.appendChild(historyButton);

            tr.appendChild(tdName);
            tr.appendChild(tdScore);
            tr.appendChild(tdActions);
            studentsBody.appendChild(tr);
        });
    }
}

function deleteStudent(studentName) {
    let currentUser = loadCurrentUser();
    currentUser.students = currentUser.students.filter(student => student.name !== studentName);
    saveCurrentUser(currentUser);
    console.log('Deleted Student:', studentName);
}

function modifyScore(studentName, delta, reason) {
    let currentUser = loadCurrentUser();
    const student = currentUser.students.find(student => student.name === studentName);
    if (student) {
        student.score += delta;
        if (!Array.isArray(student.history)) {
            student.history = []; 
        }
        student.history.push({ delta: delta, reason: reason, timestamp: new Date().toLocaleString() });
        saveCurrentUser(currentUser);
        console.log('Modified Score:', student.score);
        updateScoreDisplay(studentName, student.score); 
    }
}

function updateScoreDisplay(studentName, newScore) {
    const row = document.querySelector(`[data-student-name="${studentName}"]`);
    if (row) {
        row.querySelector('.score').textContent = newScore;
    }
}

function showScoreMenu(studentName, score, tr) 
{
    const dropdownMenu = document.querySelector(`.dropdown-menu[data-student-name="${studentName}"]`);
    dropdownMenu.style.display = 'block';

    function hideMenu() {
        dropdownMenu.style.display = 'none';
    }
    window.addEventListener('click', function(event) {
        if (!dropdownMenu.contains(event.target)) {
            hideMenu();
        }
    });
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', function() {
            hideMenu();
        });
    });
}

function showHistory(studentName, history) {
    if (Array.isArray(history)) {
        alert(`${studentName}'s history:\n${history.map(item => `${item.timestamp}: ${item.delta} points (Reason: ${item.reason})`).join('\n')}`);
    } else {
        alert(`${studentName} 's history not found.`);
    }
}