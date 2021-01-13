let taskField;
let buttonAdd;
let taskList;
let stored;

// Return the parsed JSON of tasks stored is local storage
function getStorage() {
    return JSON.parse(localStorage.getItem('tasks'));
}

// Store locally a task list in json format
function setStorage(json) {
    console.log(json);
    localStorage.setItem('tasks', JSON.stringify(json));
}


/* Set attributes and innerText of a list item given 
   task description and task status (done or not) */
function newListItem(description, done) {
    let newListItem = document.createElement('li');
    newListItem.setAttribute('data-selected', false);
    newListItem.setAttribute('data-done', done);
    newListItem.setAttribute('class', 'task');
    newListItem.innerText = description;
    taskList.appendChild(newListItem);

    newListItem.addEventListener('click', function () {
        toggleSelect(this);
    });
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
        console.log(index);
    }
    taskField.value = '';
}

function toggleSelect(task) {
    if (task.getAttribute('data-selected') == 'true')
        task.setAttribute('data-selected', false);
    else
        task.setAttribute('data-selected', true);

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
    stored = getStorage();
    stored.list.length = 0;
    setStorage(stored);
    taskList.innerHTML = '';
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
        for (let task of taskList.children)
            task.setAttribute('data-selected', 'false');
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