window.onload = () => {
  const socket = io.connect('http://localhost:4444');
  const messageBlock = document.querySelector('.message-block');
  const inputField = document.querySelector('textarea');
  const sendBtn = document.getElementById('sendBtn');

  let currentUserName = 'Anonymous';
  let history;

  socket.emit('user_connected');
  socket.on('user_data', (data) => {
    currentUserName = data.username;
    history = data.history;
    document.querySelector('.greeting').append(`Hi, ${currentUserName}`);
    showHistory();
  });

  function showHistory() {
    history.forEach(msg => drawMessage({
      message: msg[0], username: msg[1], datetime: msg[2],
    }));
  }

  function submitMessage() {
    socket.emit('new_message', {
      message: inputField.value,
      username: currentUserName,
    });
    inputField.value = '';
  }

  sendBtn.addEventListener('click', () => {
    submitMessage();
  });

  window.addEventListener('keypress', (e) => {
    if (e.keyCode === 13 && e.shiftKey) {
      submitMessage();
    }
  })

  const moveScroll = () => {
    messageBlock.scrollTop = messageBlock.scrollHeight;
  };
  const isInformerExist = () => document.querySelector('.informer') !== null;


  socket.on('add_mess', (data) => {
    if (isInformerExist()) {
      document.querySelector('.informer').remove();
    }
    drawMessage(data);
  });

  function drawMessage(msg) {
    const datetime = new Date(msg.datetime);
    const datetimeFormated = `${datetime.getDate()}.${datetime.getMonth()}.${datetime.getFullYear()} ${datetime.getHours()}:${datetime.getMinutes()}:${datetime.getSeconds()}`;
    const newMessage = document.createElement('p');
    newMessage.classList.add(msg.username === currentUserName ? 'from-me' : 'from-them');
    newMessage.innerHTML = `<b>${msg.username}:</b>\n${msg.message}`;
    newMessage.innerHTML += `<span class="badge badge-pill badge-light">${datetimeFormated}</span>`;
    messageBlock.append(newMessage);
    moveScroll();
  }

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