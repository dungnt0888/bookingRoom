const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'] // Cho phép cả websocket và polling
});

// Gửi tin nhắn
document.getElementById('send-btn').addEventListener('click', function () {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    console.log(loggedInUserRole);
    if (message) {
        const data = {
            sender: loggedInUser && loggedInUser.trim() !== '' ? loggedInUser : 'Guest',
            content: message,
            timestamp: new Date().toLocaleTimeString(),
            sender_role: loggedInUserRole
        };
        socket.emit('send_message', data); // Gửi tin nhắn tới server
        messageInput.value = ""; // Xóa input
    }
});

// Nhận tin nhắn mới
socket.on('receive_message', function (data) {
    const chatMessages = document.getElementById('chat-messages');
    const right = data.sender_role === 'Administrator' ? 'left' : 'right';
    console.log(right, data.sender_role);
    const msgHtml = `
        <div class="direct-chat-msg ${data.sender_role === 'Administrator' ? 'left' : 'right'}">
            <div class="direct-chat-infos clearfix">
                <span class="direct-chat-name ${data.sender_role === 'Administrator' ? 'float-left' : 'float-right'}">${data.sender}</span>
                <span class="direct-chat-timestamp ${data.sender_role === 'Administrator' ? 'float-right' : 'float-left'}">${data.timestamp}</span>
            </div>
            <img class="direct-chat-img" src="https://via.placeholder.com/40" alt="${data.sender} Image">
            <div class="direct-chat-text">${data.content}</div>
        </div>`;

    chatMessages.innerHTML += msgHtml;
    chatMessages.scrollTop = chatMessages.scrollHeight; // Cuộn xuống cuối
});
