let taskField;
let buttonAdd;
let taskList;
let stored;
let touchDevice = (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement);

// Return the parsed JSON of tasks stored is local storage
function getStorage() {
    return JSON.parse(localStorage.getItem('tasks'));
}

// Store locally a task list in json format
function setStorage(json) {
    console.log(json);
    localStorage.setItem('tasks', JSON.stringify(json));
}

/* Save the list item in memory after edit
   The argument must be some child of taskList
   This function should be called whenever some
   item in the taskList is changed */
function saveTask(task) {
    let child = task;
    let index = Array.from(child.parentNode.children).indexOf(child);
    stored = getStorage();
    stored.list[index].description = task.innerText;
    setStorage(stored);
}

/* Set attributes and innerText of a list item given 
   task description and task status (done or not)
   Create all event listeners the new task needs  */
function newListItem(description, done) {
    let newListItem = document.createElement('li');

    newListItem.setAttribute('data-selected', false);
    newListItem.setAttribute('data-done', done);
    newListItem.setAttribute('class', 'task');
    newListItem.innerText = description;
    taskList.appendChild(newListItem);

    let copyIcon = document.createElement('button');
    let editIcon = document.createElement('button');

    copyIcon.setAttribute('class', 'taskIcon');
    copyIcon.setAttribute('contenteditable', 'false');
    copyIcon.innerHTML = '<img src="./images/clipboard.svg">';
    editIcon.setAttribute('class', 'taskIcon');
    editIcon.setAttribute('contenteditable', 'false');
    editIcon.innerHTML = '<img src="./images/edit.svg">';

    newListItem.appendChild(copyIcon);
    newListItem.appendChild(editIcon);

    newListItem.addEventListener('click', function () {
        toggleSelect(this);
    });

    // Toggle edit when edit icon is clicked
    editIcon.addEventListener('click', function (event) {
        if (this.parentElement.getAttribute('contenteditable') != 'true') {
            this.parentElement.setAttribute('contenteditable', 'true');
            let range = document.createRange();
            range.selectNodeContents(this.parentElement);
            let selection = getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            saveTask(this.parentElement);
            this.parentElement.setAttribute('contenteditable', 'false');
        }
        event.stopPropagation();
    });

    // Save edit when enter is pressed
    newListItem.addEventListener('keydown', function (event) {
        if (this.getAttribute('contenteditable') == 'true') {
            if (event.key !== 'Enter') return;
            saveTask(this);
            this.setAttribute('contenteditable', 'false');
            taskField.focus();
        }
        event.preventDefault();
    });

    // Save edit when user click out of edited task
    window.addEventListener('click', function (event) {
        if (newListItem.getAttribute('contenteditable') == 'true') {
            let target = event.target;
            do {
                if (target == newListItem) return;
                target = target.parentNode;
            } while (target);
            saveTask(newListItem);
            newListItem.setAttribute('contenteditable', 'false');
            taskField.focus();
        }
    });

    // Copy task to clipboard when copy icon is pressed
    copyIcon.addEventListener('click', function (event) {
        navigator.clipboard.writeText(this.parentElement.innerText);
        let toast = document.getElementById('toast');
        let opacity = 1.0;
        toast.style.display = 'block';
        setTimeout(() => {
            let interval = setInterval(() => {
                opacity -= 0.01
                toast.style.opacity = opacity.toString();
            }, 30);
            setTimeout(() => {
                toast.style.display = 'none';
                toast.style.opacity = 'unset';
                clearInterval(interval);
            }, 3000);
        }, 3000);
        event.stopPropagation();
    });

    if (touchDevice) {
        // Show all icons
        let icons = document.getElementsByClassName('taskIcon');
        for (let icon of icons)
            icon.style.display = 'inline-block';
    } else {
        // Displaying copy and edit buttons when hovering task
        newListItem.addEventListener('mouseenter', function () {
            for (let button of this.children)
                button.style.display = 'unset';
        });

        // Hidding when not
        newListItem.addEventListener('mouseleave', function () {
            for (let button of this.children)
                button.style.display = 'none';
        });
    }
}

let index = 0;

function addTask() {
    let newTask = taskField.value;
    let placeholders = [
        'Digite aqui tarefas por fazer',
        'Escreva aqui uma nova ideia, para não esquecer',
        'Digite aqui uma meta para o dia de hoje'
    ];

    // Add the new task only if value is not a bunch of spaces
    if (newTask.trim()) {
        stored = getStorage();
        stored.list.push({
            "description": newTask,
            "done": false
        });
        setStorage(stored);
        newListItem(newTask, false);
        index %= placeholders.length;
        taskField.setAttribute('placeholder', placeholders[index]);
        index++;
    }
    taskField.value = '';
}

function toggleSelect(task) {
    if (task.getAttribute('contenteditable') != 'true') {
        if (task.getAttribute('data-selected') == 'true')
            task.setAttribute('data-selected', false);
        else
            task.setAttribute('data-selected', true);
    }
}

function toggleDone() {
    let tasks = taskList.children;
    for (let index = 0; index < tasks.length; index++) {
        console.log(tasks[index]);
        if (tasks[index].getAttribute('data-selected') == 'true') {
            stored = getStorage();
            let done;
            let attributeValue = tasks[index].getAttribute('data-done');
            if (attributeValue == 'true')
                done = true;
            if (attributeValue == 'false')
                done = false;
            tasks[index].setAttribute('data-done', !done);
            stored.list[index].done = !done;
            setStorage(stored);
        }
    }
}

function deleteTasks() {
    let tasks = taskList.children;
    for (let index = tasks.length - 1; index >= 0; index--) {
        stored = getStorage();
        if (tasks[index].getAttribute('data-selected') == 'true') {
            taskList.removeChild(tasks[index]);
            stored.list.splice(index, 1);
            setStorage(stored);
        }
    }
    stored = getStorage();
}

function deleteAll() {
    if (window.confirm('Deseja realmente limpar a lista?')) {
        stored = getStorage();
        stored.list.length = 0;
        setStorage(stored);
        taskList.innerHTML = '';
    }
}

window.onload = function () {
    taskField = document.getElementById('taskField');
    buttonAdd = document.getElementById('buttonAdd');
    taskList = document.getElementById('taskList');

    // Add input value to list when Enter key is pressed
    taskField.addEventListener('keyup', function (event) {
        if (event.key !== 'Enter') return;
        buttonAdd.click();
        event.preventDefault();
    });

    // Unselect every task if Esc is pressed
    window.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        for (let task of taskList.children) {
            task.setAttribute('data-selected', 'false');
            task.setAttribute('contenteditable', 'false');
        }
    });

    // Unselect every task if click outside task window
    window.addEventListener('click', function (event) {
        let target = event.target;
        do {
            if (target == taskList) return;
            target = target.parentNode;
        } while (target);
        for (let task of taskList.children)
            task.setAttribute('data-selected', 'false');
    });

    // Read tasks stored in local storage and update html
    stored = getStorage();
    if (stored) {
        if (Array.isArray(stored.list) === true) {
            for (let task of stored.list)
                newListItem(task.description, task.done);
        }
    } else {
        let empty = {
            'list': []
        };
        setStorage(empty);
        stored = getStorage();
    }
}