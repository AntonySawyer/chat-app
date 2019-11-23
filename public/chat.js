window.onload = () => {
  const socket = io.connect('http://localhost:3000');
  const messageBlock = document.querySelector('.message-block');
  const inputField = document.querySelector('textarea');
  const sendBtn = document.getElementById('sendBtn');

  sendBtn.addEventListener('click', () => {
    socket.emit('new_message', {
      message: inputField.value,
    });
  });

  const moveScroll = () => {
    messageBlock.scrollTop = messageBlock.scrollHeight;
  };
  const isInformerExist = () => document.querySelector('.informer') !== null;


  socket.on('add_mess', (data) => {
    inputField.value = '';
    if (isInformerExist()) {
      document.querySelector('.informer').remove();
    }
    const newMessage = document.createElement('p');
    newMessage.classList.add(data.username === 'Anonymous' ? 'from-me' : 'from-them');
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
