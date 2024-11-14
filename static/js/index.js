document.addEventListener('DOMContentLoaded', function () {
    let isDragging = false;  // Trạng thái kéo
    let activeColumn = null; // Cột đang kéo
    const selectedCells = [];  // Các ô được chọn

    const bookRoomButton = document.getElementById('bookRoomButton');
    const roomButtons = document.querySelectorAll('.room-select');
    const bookingForm = document.getElementById('booking-form');
    const roomNameInput = document.getElementById('roomName');
    const timeInput = document.getElementById('time');

    // Kiểm tra nếu ô nằm trong giờ nghỉ trưa
    function isLunchBreakRow(cell) {
        return cell.parentElement.classList.contains("time-break");
    }

    // Hàm bật/tắt sáng một ô và kiểm tra khoảng trống
    function toggleCellHighlight(cell) {
        const column = cell.cellIndex;
        if (cell.classList.contains('highlighted')) {
            cell.classList.remove('highlighted');
            const index = selectedCells.indexOf(cell);
            if (index > -1) selectedCells.splice(index, 1);
        } else {
            cell.classList.add('highlighted');
            selectedCells.push(cell);
        }
        checkAndClearColumn(column);
    }

    // Kiểm tra nếu có khoảng trống trong nhóm ô được chọn trong cột
    function checkAndClearColumn(column) {
        const cells = Array.from(document.querySelectorAll(`.schedule-table tbody tr td:nth-child(${column + 1})`));
        const selectedCellsInColumn = cells.filter(cell => cell.classList.contains('highlighted'));

        if (selectedCellsInColumn.length < 2) return;

        let start = cells.indexOf(selectedCellsInColumn[0]);
        let end = cells.indexOf(selectedCellsInColumn[selectedCellsInColumn.length - 1]);

        // Nếu phát hiện khoảng trống giữa ô đầu và ô cuối được chọn, bỏ chọn tất cả
        for (let i = start; i <= end; i++) {
            if (!cells[i].classList.contains('highlighted')) {
                cells.forEach(cell => cell.classList.remove('highlighted'));
                selectedCells.length = 0;
                break;
            }
        }
    }

    // Khi bắt đầu nhấn chuột xuống
    function startHighlight(cell, event) {
        if (event.button !== 0 || isLunchBreakRow(cell) || cell.cellIndex === 0) return;

        isDragging = true;
        activeColumn = cell.cellIndex;

        // Bật/tắt sáng ô hiện tại và kiểm tra khoảng trống
        toggleCellHighlight(cell);
        toggleBookRoomButton();
    }

    // Khi kéo qua các ô
    function dragHighlight(cell) {
        if (!isDragging || cell.cellIndex !== activeColumn || cell.cellIndex === 0) return;

        // Dừng kéo nếu gặp ô trong giờ nghỉ trưa
        if (isLunchBreakRow(cell)) {
            isDragging = false;
            return;
        }

        // Bật sáng ô nếu chưa được chọn
        if (!cell.classList.contains('highlighted')) {
            cell.classList.add('highlighted');
            selectedCells.push(cell);
            checkAndClearColumn(cell.cellIndex);
        }
    }

    // Kết thúc kéo khi nhả chuột
    document.addEventListener('mouseup', function () {
        isDragging = false;
        activeColumn = null;
    });

    // Hàm kiểm tra nếu có một phòng được chọn và ít nhất một ô thời gian đã được chọn
    function toggleBookRoomButton() {
        const selectedRoom = document.querySelector('.room-select.active');
        const highlightedTimeSlot = selectedCells.length > 0;
        bookRoomButton.disabled = !(selectedRoom && highlightedTimeSlot);
    }

    // Thêm sự kiện cho các ô thời gian (trừ cột đầu tiên)
    document.querySelectorAll('.schedule-table td').forEach(cell => {
        if (cell.cellIndex > 0) {
            cell.addEventListener('mousedown', function (event) {
                event.preventDefault();
                startHighlight(cell, event);
            });

            cell.addEventListener('mouseover', function () {
                dragHighlight(cell);
            });
        }
    });

    // Hàm bỏ chọn tất cả các nút phòng
    function resetRoomSelection() {
        roomButtons.forEach(button => {
            button.classList.remove('active');
            button.disabled = false;
        });
    }

    // Thêm sự kiện click cho mỗi nút phòng
    roomButtons.forEach(button => {
        button.addEventListener('click', function () {
            resetRoomSelection();
            button.classList.add('active');
            button.disabled = true;
            toggleBookRoomButton();
        });
    });

    // Khi nhấn nút "Đặt phòng"

bookRoomButton.addEventListener('click', function () {
    const selectedRoom = document.querySelector('.room-select.active');
    if (selectedRoom && selectedCells.length > 0) {
        // Lấy danh sách các cột đã chọn
        const columnsSelected = [...new Set(selectedCells.map(cell => cell.cellIndex))];

        // Mở form đặt phòng cho mỗi ngày
        columnsSelected.forEach(columnIndex => {
            // Lấy tên phòng
            const roomName = selectedRoom.textContent;

            // Lấy các ô đã chọn trong cột này
            const cellsInColumn = selectedCells.filter(cell => cell.cellIndex === columnIndex);
            cellsInColumn.sort((a, b) => a.id.localeCompare(b.id));

            // Lấy thời gian
            const startTime = formatTimeStart(cellsInColumn[0].id.split('_')[1]);
            const endTime = formatTimeEnd(cellsInColumn[cellsInColumn.length - 1].id.split('_')[1]);
            const timeRange = `${startTime} - ${endTime}`;

            // Lấy ngày từ <span> bên trong <th>
            const bookingDate = document.querySelectorAll(".schedule-table thead th")[columnIndex].querySelector("span").textContent;

            // Tạo form đặt phòng tại vị trí của cột này
            createBookingForm(roomName, timeRange, bookingDate);
        });
    }
});

function createBookingForm(roomName, timeRange, bookingDate) {
    const maxPopups = 6;
    const spacing = 20;
    const existingPopups = document.querySelectorAll('.booking-form-content').length + 1;
    if (existingPopups > maxPopups) {
        alert("Chỉ được hiển thị tối đa 6 popup cùng lúc.");
        return;
    }

    const maxTotalWidth = window.innerWidth * 0.9;
    const popupWidth = Math.min(300, (maxTotalWidth - spacing * (existingPopups - 1)) / existingPopups);
    const totalPopupWidth = (popupWidth + spacing) * existingPopups - spacing;
    const startLeft = (window.innerWidth - totalPopupWidth) / 2;

    const formContainer = document.createElement('div');
    formContainer.className = 'booking-form-content';
    formContainer.style.width = `${popupWidth}px`;
    formContainer.style.top = '50%';
    formContainer.style.left = `${startLeft + (existingPopups - 1) * (popupWidth + spacing)}px`;

    formContainer.innerHTML = `
        <div class="booking-form-header">Đặt Phòng</div>
        <div>
            <h4>Ngày: <span>${bookingDate}</span></h4>
            <p><strong>Tên phòng:</strong> ${roomName}</p>
            <p><strong>Thời gian:</strong> ${timeRange}</p>
            <form id="booking-form-content">
                <label for="chairman">Người chủ trì:</label>
                <input type="text" name="chairman" id="chairman" placeholder="Nhập tên người chủ trì"><br>
                <label for="department">Khối phòng ban:</label>
                <input type="text" name="department" id="department" placeholder="Nhập tên phòng ban"><br>
                <label for="meetingContent">Nội dung cuộc họp:</label>
                <textarea name="meetingContent" id="meetingContent" placeholder="Nhập nội dung cuộc họp" rows="4"></textarea><br>
                <button type="submit">Xác nhận</button>
                <button type="button" onclick="this.closest('.booking-form-content').remove()">Tắt</button>
            </form>
        </div>
    `;

    document.body.appendChild(formContainer);
    console.log("Form created:", document.getElementById("booking-form-content"));

    document.getElementById("booking-form-content").addEventListener("submit", function(event) {
        event.preventDefault();

        const chairman = document.getElementById("chairman").value;
        const department = document.getElementById("department").value;
        const meetingContent = document.getElementById("meetingContent").value;
        // Log thông tin lấy được từ form
        console.log("Chairman:", chairman);
        console.log("Department:", department);
        console.log("Meeting Content:", meetingContent);
        // Nội dung chỉ hiển thị một lần
    const bookingInfo = `
            <div class="booking-content">
            <button class="close-btn" onclick="removeBooking(this)">X</button>
            <div><strong>Phòng ban:</strong> ${department}</div>
            <div><strong>Chủ trì:</strong> ${chairman}</div>
            <div><strong>Thời gian:</strong> ${timeRange}</div>
            <div><strong>Nội dung:</strong> ${meetingContent}</div>
            </div>
    `;

    // Hiển thị bookingInfo cho ô đầu tiên
    if (selectedCells.length > 0) {
        selectedCells[0].innerHTML = bookingInfo;
        selectedCells[0].classList.add('booked'); // Thêm models đánh dấu ô đầu tiên
    }

    // Đánh dấu các ô khác mà không hiển thị nội dung
    selectedCells.slice(1).forEach(cell => {
        cell.classList.add('booked'); // Chỉ thêm models mà không gán nội dung
        cell.classList.remove('highlighted');
    });

    // Đóng popup sau khi lưu
    document.querySelector(".booking-form-content").remove();
    });

    dragElement(formContainer);

    function dragElement(el) {
        const header = el.querySelector(".booking-form-header");
        let offsetX = 0, offsetY = 0, startX = 0, startY = 0;

        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            startX = e.clientX;
            startY = e.clientY;

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            offsetX = startX - e.clientX;
            offsetY = startY - e.clientY;
            startX = e.clientX;
            startY = e.clientY;

            el.style.top = (el.offsetTop - offsetY) + "px";
            el.style.left = (el.offsetLeft - offsetX) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}



    });

    // Hàm chuyển đổi thời gian bắt đầu từ định dạng id
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

    // Hàm đóng form đặt phòng
    window.closeBookingForm = function () {
        bookingForm.classList.add('hidden');
    };
//------------------------------------
function removeBooking(button) {
    const bookingCell = button.closest('.booking-content').parentElement; // Lấy ô chứa nội dung
    const columnIndex = bookingCell.cellIndex; // Lấy chỉ số cột của ô
    const table = bookingCell.closest('table'); // Tìm bảng chứa ô

    if (table && typeof columnIndex === "number") {
        // Lấy tất cả các ô trong cùng cột
        const columnCells = Array.from(table.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`));

        // Xóa nội dung và models trong các ô cùng cột
        columnCells.forEach(cell => {
            cell.innerHTML = ''; // Xóa nội dung
            cell.classList.remove('booked', 'highlighted'); // Xóa models
        });
    }
}

