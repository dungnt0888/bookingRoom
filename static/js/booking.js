// booking.js
document.addEventListener('DOMContentLoaded', function () {
    const bookRoomButton = document.getElementById('bookRoomButton');
    const roomButtons = document.querySelectorAll('.room-select');
    const isLoggedIn = loggedInUser !== "";
    function toggleBookRoomButton() {
        const selectedRoom = document.querySelector('.room-select.active');
        const highlightedTimeSlot = getSelectedCells().length > 0;
        bookRoomButton.disabled = !(selectedRoom && highlightedTimeSlot && isLoggedIn);
    }
    window.toggleBookRoomButton = toggleBookRoomButton;

    function resetRoomSelection() {
        roomButtons.forEach(button => {
            button.classList.remove('active');
            button.disabled = false;
        });
    }

    roomButtons.forEach(button => {
        button.addEventListener('click', function () {
            resetRoomSelection();
            button.classList.add('active');
            button.disabled = true;
            saveSelectedRoom(button.textContent.trim()); // Lưu tên phòng
            toggleBookRoomButton();
        });
    });

    bookRoomButton.addEventListener('click', function () {
        const selectedRoom = document.querySelector('.room-select.active');
        const selectedCells = getSelectedCells();
        if (selectedRoom && selectedCells.length > 0) {
            const columnIndex = selectedCells[0].cellIndex;
            const roomName = selectedRoom.textContent;

            const cellsInColumn = selectedCells.filter(cell => cell.cellIndex === columnIndex);
            cellsInColumn.sort((a, b) => a.id.localeCompare(b.id));

            const startTime = formatTimeStart(cellsInColumn[0].id.split('_')[1]);
            const endTime = formatTimeEnd(cellsInColumn[cellsInColumn.length - 1].id.split('_')[1]);
            const timeRange = `${startTime} - ${endTime}`;
            const bookingDate = document.querySelectorAll(".schedule-table thead th")[columnIndex].querySelector("span").textContent;

            createBookingForm(roomName, timeRange, bookingDate);
        }

    });
     function formatTimeStart(time) {
        const hour = time.slice(0, 2);
        const minute = time.slice(2, 4);
        return `${hour}:${minute}`;
    }

    // Hàm chuyển đổi thời gian kết thúc từ định dạng id
    function formatTimeEnd(time) {
        const endHour = time.slice(4, 6);
        const endMinute = time.slice(6, 8);
        return `${endHour}:${endMinute}`;
    }
// Hàm lưu trạng thái nút được chọn vào LocalStorage
function saveSelectedRoom(roomName) {
    localStorage.setItem('selectedRoom', roomName);
}

// Hàm khôi phục trạng thái từ LocalStorage
function restoreSelectedRoom() {
    const selectedRoom = localStorage.getItem('selectedRoom');
    if (selectedRoom) {
        roomButtons.forEach(button => {
            if (button.textContent.trim() === selectedRoom) {
                button.classList.add('active');
                button.disabled = true;
            }
        });
    }
}

restoreSelectedRoom();
});

