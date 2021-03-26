const socket = io();

const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const userList = document.getElementById('online-users');

const {username, roomName} = Qs.parse(location.search, {ignoreQueryPrefix: true});

socket.emit('joinRoom', {username, roomName});

socket.on('message', (message) => {
    printMessage(message);
    chatMessage.scrollTop = chatMessage.scrollHeight;
});

socket.on('roomUser', ({users}) => {
    printUsers(users);
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = e.target.elements.message.value;

    // Emit text inputted by the user to the server
    socket.emit('chatMessage', message);

    e.target.elements.message.value = '';
    e.target.elements.message.focus();
});

const printMessage = (message) => {
    const div = document.createElement('div');
    div.classList.add('message', 'container', 'bg-primary', 'chat-container', 'rounded', 'py-2', 'mb-2');
    div.innerHTML = `
                    <p class="meta mb-0">${message.username} <span>${message.time}</span></p>
                    <p class="text mb-0">${message.text}</p>
                    `;
    document.querySelector('.chat-messages').appendChild(div);
}

const printUsers = (users) => {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}