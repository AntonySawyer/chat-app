window.onload = () => {
  const socket = io.connect('http://localhost:3000');
  const messageBlock = document.querySelector('.message-block');
  const inputField = document.querySelector('textarea');
  const sendBtn = document.getElementById('sendBtn');

  let currentUserName = 'Anonymous';
  let currentUserId = '0';

  socket.emit('user_connected');
  socket.on('user_data', (data) => {
    currentUserName = data.username;
    currentUserId = data.id;
    document.querySelector('a[href="/logout"]').before(`Hi, ${currentUserName}   `);
  });


  sendBtn.addEventListener('click', () => {
    socket.emit('new_message', {
      message: inputField.value,
    });
    inputField.value = '';
  });

  const moveScroll = () => {
    messageBlock.scrollTop = messageBlock.scrollHeight;
  };
  const isInformerExist = () => document.querySelector('.informer') !== null;


  socket.on('add_mess', (data) => {
    if (isInformerExist()) {
      document.querySelector('.informer').remove();
    }
    const newMessage = document.createElement('p');
    newMessage.classList.add(data.username === currentUserName ? 'from-me' : 'from-them');
    newMessage.innerHTML = `<b>${data.username}:</b>\n${data.message}`;
    messageBlock.append(newMessage);
    moveScroll();
  });

  inputField.addEventListener('keypress', () => {
    socket.emit('typing');
  });

  socket.on('typing', (data) => {
    if (!isInformerExist()) {
      const newInformer = document.createElement('p');
      newInformer.classList.add('from-them', 'informer');
      newInformer.innerHTML = `<i>${data.username} is typing...</i>`;
      messageBlock.append(newInformer);
      moveScroll();
    }
  });
};
