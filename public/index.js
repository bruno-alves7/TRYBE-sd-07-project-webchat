const socket = window.io();

const usersOnline = document.getElementById('usersOnline');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessage = document.getElementById('sendMessage');
const sendNick = document.getElementById('nicknameBtn');
const nick = document.getElementById('nickname');

sendMessage.addEventListener('click', () => {
  socket.emit('message', { nickname: nick.value, chatMessage: messageInput.value });
  messageInput.value = '';
});

sendNick.addEventListener('click', () => {
  const localUser = sessionStorage.getItem('user');
  socket.emit('changeNick', { nickname: nick.value, id: localUser });
  chatMessages.insertAdjacentHTML('beforeend', `<li>${nick.value} alterou seu nick.</li>`);
});

socket.on('message', (message) => {
    chatMessages.insertAdjacentHTML('beforeend', `<li data-testid="message"> ${message}</li>`);
}); 

window.addEventListener('load', async () => {
  const dbMessages = await (await fetch('http://localhost:3000/messages')).json();

  dbMessages.forEach((e) => {
    const message = ` ${e.message} ${e.nickname} ${e.timestamp}`;
    chatMessages.insertAdjacentHTML('beforeend', `<li data-testid="message"> ${message}</li>`);
  });
});

socket.on('newUser', (newUser) => {
  usersOnline.innerHTML = '';
  const localUser = sessionStorage.getItem('user');
  console.log('como chegou', newUser);
  const result = newUser.map((arrey) => arrey.id).indexOf(localUser);
  usersOnline
  .insertAdjacentHTML(
    'beforeend', `<li data-testid="online-user">${newUser[result].userName}</li>`,
    );
  console.log('antes de excluir', newUser);
  newUser.splice(result, 1);
  console.log('depois de excluir', newUser);
  newUser.forEach((e) => {
    const user = `${e.userName}`;
    usersOnline.insertAdjacentHTML('beforeend', `<li data-testid="online-user"> ${user}</li>`);
  });
  // nick.value = newUser;
  // chatMessages.insertAdjacentHTML('beforeend', `<li>${newUser} entrou no chat.</li>`);
});

socket.on('localUser', (user) => {
  sessionStorage.setItem('user', user);
});