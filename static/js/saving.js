// saving.js
function createBookingForm(roomName, timeRange, bookingDate) {
    const roomName1 = roomName;
    const timeRange1 = timeRange;
    const bookingDate1 = bookingDate;
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
    const selectedCells = window.getSelectedCells();
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
                <label for="booking_name">Cuộc họp:</label>
                <input type="text" name="booking_name" id="booking_name" placeholder="Nhập tên cuộc họp"><br>
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

    document.getElementById("booking-form-content").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Lấy giá trị từ form
    const chairman = document.getElementById("chairman").value;
    const bookingName = document.getElementById("booking_name").value;
    const department = document.getElementById("department").value;
    const meetingContent = document.getElementById("meetingContent").value;

    console.log("Chairman:", chairman);
    console.log("Booking Name:", bookingName);
    console.log("Department:", department);
    console.log("Meeting Content:", meetingContent);

    // Thêm thông tin phòng, thời gian và ngày từ các tham số
    const roomName = roomName1;
    const bookingDate = bookingDate1;
    const timeRange = timeRange1.split(" - ");
    const startTime = timeRange[0];
    const endTime = timeRange[1];

    const data = {
        booking_name: bookingName,
        department: department,
        chairman: chairman,
        meeting_content: meetingContent,
        room_name: roomName,
        reservation_date: bookingDate,
        start_time: startTime,
        end_time: endTime
    };
    console.log(data);

    const bookingId = `booking_${roomName}_${bookingDate}_${timeRange}`.replace(/[\s:-]/g, '_');

    // Chuẩn bị nội dung cho các phần booking
    const nameContent = `<div><strong>Cuộc họp:</strong> ${bookingName}</div>`;
    const departmentContent = `
    <div style="background-color: #07f407; color: black; font-weight: bold; padding: 5px; width: 100%;">
        <strong>Khối:</strong> ${department}
    </div>
    `;
    const chairmanContent = `<div><strong>Chủ trì:</strong> ${chairman}</div>`;
    const timeContent = `<div><strong>Thời gian:</strong> ${timeRange}</div>`;
    const meetingContentText = `<div><strong>Nội dung:</strong> ${meetingContent}</div>`;

    // Xử lý các trường hợp theo số lượng ô đã chọn
    if (selectedCells.length === 1) {
        // Nếu chỉ có 1 ô, hiển thị tất cả nội dung trong ô đó
        selectedCells[0].innerHTML = `
            <div class="booking-content" data-id="${bookingId}">
                <button class="close-btn" onclick="removeBooking('${bookingId}')">X</button> 
                ${departmentContent}
                ${nameContent}
                ${chairmanContent}
                ${timeContent}
                ${meetingContentText}
            </div>
        `;
        selectedCells[0].classList.add('booked');
        selectedCells[0].classList.remove('highlighted');
    } else if (selectedCells.length === 2) {
        // Nếu có 2 ô, phân bố nội dung vào cả hai ô
        selectedCells[0].innerHTML = `
            <div class="booking-content" data-id="${bookingId}_1">
                <button class="close-btn" onclick="removeBooking('${bookingId}')">X</button>
                ${departmentContent}
                ${nameContent}
            </div>
        `;
        selectedCells[1].innerHTML = `
            <div class="booking-content" data-id="${bookingId}_2">
                ${chairmanContent}
                ${timeContent}
                ${meetingContentText}
            </div>
        `;
        selectedCells[0].classList.add('booked');
        selectedCells[1].classList.add('booked');
        selectedCells[0].classList.remove('highlighted');
        selectedCells[1].classList.remove('highlighted');
    } else if (selectedCells.length === 3) {
        // Nếu có 3 ô, phân bố nội dung vào từng ô
        selectedCells[0].innerHTML = `
            <div class="booking-content" data-id="${bookingId}_1">
                <button class="close-btn" onclick="removeBooking('${bookingId}')">X</button>
                ${departmentContent}
            </div>
        `;
        selectedCells[1].innerHTML = `
            <div class="booking-content" data-id="${bookingId}_2">
                ${nameContent}
            </div>
        `;
        selectedCells[2].innerHTML = `
            <div class="booking-content" data-id="${bookingId}_3">
                ${chairmanContent}
                ${timeContent}
                ${meetingContentText}
            </div>
        `;
        selectedCells.forEach(cell => {
            cell.classList.add('booked');
            cell.classList.remove('highlighted');
        });
    } else if (selectedCells.length === 4) {
        // Nếu có 4 ô, phân bố từng phần nội dung vào từng ô
        selectedCells[0].innerHTML = `
            <div class="booking-content" data-id="${bookingId}_1">
                <button class="close-btn" onclick="removeBooking('${bookingId}')">X</button>
                ${departmentContent}
            </div>
        `;
        selectedCells[1].innerHTML = `
            <div class="booking-content" data-id="${bookingId}_2">
                ${nameContent}
            </div>
        `;
        selectedCells[2].innerHTML = `
            <div class="booking-content" data-id="${bookingId}_3">
                ${chairmanContent}
            </div>
        `;
        selectedCells[3].innerHTML = `
            <div class="booking-content" data-id="${bookingId}_4">
                ${timeContent}
                ${meetingContentText}
            </div>
        `;
        selectedCells.forEach(cell => {
            cell.classList.add('booked');
            cell.classList.remove('highlighted');
        });
    } else {
        // Nếu có nhiều hơn 4 ô, phân bố nội dung vào các ô theo thứ tự
        const contentParts = [departmentContent, nameContent, chairmanContent, timeContent, meetingContentText];

        selectedCells.forEach((cell, index) => {
            cell.classList.add('booked');
            cell.classList.remove('highlighted');

            // Ô đầu tiên có nút "X", các ô sau không có
            if (index === 0) {
                cell.innerHTML = `
                    <div class="booking-content" data-id="${bookingId}">
                        <button class="close-btn" onclick="removeBooking('${bookingId}')">X</button>
                        ${contentParts[index]}
                    </div>
                `;
            } else if (index < contentParts.length) {
                cell.innerHTML = `
                    <div class="booking-content" data-id="${bookingId}_${index}">
                        ${contentParts[index]}
                    </div>
                `;
            } else {
                cell.innerHTML = `<div class="booking-content" data-id="${bookingId}_${index}"></div>`;
            }
        });
    }

    // Gửi yêu cầu đến Flask
    try {
        const response = await fetch('/submit_booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        //alert(result.message);  // Hiển thị thông báo từ Flask
    } catch (error) {
        console.error("Error saving booking:", error);
        alert("Failed to save booking. Please try again.");
    }

    // Đóng popup sau khi lưu
    document.querySelector(".booking-form-content").remove();

    // Gọi enableAllColumns để xóa tmpDisable sau khi đặt phòng
    if (typeof window.enableAllColumns === 'function') {
        window.enableAllColumns();
    }

    // Xóa selectedCells sau khi save xong
    if (typeof window.clearSelectedCells === 'function') {
        window.clearSelectedCells();
    }
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

function removeBooking(bookingId) {
    // Lấy tất cả phần tử có cùng bookingId trong các ô
    const bookingElements = document.querySelectorAll(`[data-id^="${bookingId}"]`);

    bookingElements.forEach(bookingElement => {
        const bookingCell = bookingElement.closest('td'); // Xác định ô chứa booking
        bookingElement.remove(); // Xóa phần tử booking-content

        // Nếu không còn nội dung nào trong ô, xóa models 'booked'
        if (bookingCell && bookingCell.querySelectorAll('.booking-content').length === 0) {
            bookingCell.classList.remove('booked', 'highlighted');
        }
    });

    // Kích hoạt lại các cột nếu hàm enableAllColumns tồn tại
    if (typeof window.enableAllColumns === 'function') {
        window.enableAllColumns();
    }

    // Xóa các ô đã chọn sau khi hoàn thành
    if (typeof window.clearSelectedCells === 'function') {
        window.clearSelectedCells();
    }
}


