async function loadBookings() {
    try {
        const response = await fetch('/get_bookings');
        const bookings = await response.json();
        //console.log(bookings);
        const activeRoomButton = document.querySelector('.room-select.active');
        if (!activeRoomButton) {
            //console.warn("Không có phòng nào đang được chọn.");
            return; // Không load booking nếu không có phòng active
        }

        const activeRoomName = activeRoomButton.textContent.trim(); // Lấy tên phòng đang active từ nút
        //console.log(activeRoomName);
        bookings.forEach(booking => {
            if (booking.room_name !== activeRoomName) {

                //console.log("--Skip--");
                //console.log(booking.room_name);
                //console.log(activeRoomName);
                //console.log("-------");
                return; // Bỏ qua booking này nếu phòng không khớp
            }
            // Giả định bạn đã có hàm để tìm và chọn đúng các ô dựa trên thời gian
            const selectedCells = getCellsForBooking(booking.start_time, booking.end_time, booking.reservation_date);
            //console.log(selectedCells);
            //console.log(selectedCells.length);
            const bookingId = `booking_${booking.room_name}_${booking.reservation_date}_${booking.start_time}-${booking.end_time}`.replace(/[\s:-]/g, '_');
            const id = `<div style="display: none" class="booking-id" data-id="${booking.booking_id}"></div>`;
            //console.log("ID: " + booking.booking_id);
            const nameContent = `<div class="nameContent wrap-text"><strong>Cuộc họp:</strong> ${booking.booking_name}</div>`;
            const departmentContent = `<div class="department wrap-text" style="background-color: #07f407; color: black; font-weight: bold; padding: 5px;width: 100%; left: -5px;"><strong>Khối:</strong> ${booking.department}</div>`;
            const chairmanContent = `<div class="chairman wrap-text"><strong>Chủ trì:</strong> ${booking.chairman}</div>`;
            const timeContent = `<div><strong>Thời gian:</strong> ${booking.start_time} - ${booking.end_time}</div>`;
            const meetingContentText = `<div class="meetingContent wrap-text"><strong>Nội dung:</strong> ${booking.meeting_content}</div>`;
            //console.log(booking.username);
            //console.log(loggedInUser === booking.username);
            let parentTd = null;
            if(selectedCells.length >0 ){
                parentTd = selectedCells[0];
            }

            const hasInactiveClass = parentTd ? parentTd.classList.contains('inactive') : true;
            //console.log(hasInactiveClass);
            const closeButtonHTML = (loggedInUserRole === "Administrator" || loggedInUser === booking.username)
                        ? `<button class="close-btn" onclick="removeBooking('${bookingId}')">X</button>`
                        : ''; // Nếu không phải admin hoặc <td> chứa class inactive, không hiển thị nút
            // Sử dụng logic phân bổ nội dung tương tự như khi người dùng tạo mới
            if (selectedCells.length === 1) {
                selectedCells[0].innerHTML = `
                    <div class="booking-content" data-id="${bookingId}">
                        ${!hasInactiveClass ? closeButtonHTML : ''} 
                        ${id}
                        ${departmentContent}
                        ${nameContent}
                        ${chairmanContent}
                        ${timeContent}
                        ${meetingContentText}
                    </div>
                `;
            } else if (selectedCells.length === 2) {
                selectedCells[0].innerHTML = `
                    <div class="booking-content" data-id="${bookingId}_1">
                        ${!hasInactiveClass ? closeButtonHTML : ''} 
                        ${id}
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
            } else if (selectedCells.length === 3) {
                selectedCells[0].innerHTML = `
                    <div class="booking-content" data-id="${bookingId}_1">
                        ${!hasInactiveClass ? closeButtonHTML : ''} 
                        ${id}
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
            } else if (selectedCells.length === 4) {
                selectedCells[0].innerHTML = `
                    <div class="booking-content" data-id="${bookingId}_1">
                         ${!hasInactiveClass ? closeButtonHTML : ''} 
                         ${id}
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
            } else {
                const contentParts = [departmentContent, nameContent, chairmanContent, timeContent, meetingContentText];
                selectedCells.forEach((cell, index) => {
                    cell.classList.add('booked');
                    //cell.classList.remove('highlighted');

                    // Ô đầu tiên có nút "X", các ô sau không có
                    if (index === 0) {
                        cell.innerHTML = `
                            <div class="booking-content" data-id="${bookingId}">
                                ${!hasInactiveClass ? closeButtonHTML : ''} 
                                ${id}
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
            selectedCells.forEach(cell => cell.classList.add('booked'));
        });
    } catch (error) {
        console.error("Failed to load bookings:", error);
    }
}
    window.loadBookings = loadBookings;

// Hàm giả định để tìm các ô dựa trên thời gian và phòng
function getCellsForBooking(startTime, endTime, reservationDate) {
    const selectedCells = [];
    const daysOfWeek = {
        "Thứ 2": "monday",
        "Thứ 3": "tuesday",
        "Thứ 4": "wednesday",
        "Thứ 5": "thursday",
        "Thứ 6": "friday",
        "Thứ 7": "saturday",
    };

    // Chuyển `reservationDate` sang đối tượng Date để so sánh
    const reservationDateFormatted = reservationDate.split("/").reverse().join("-");  // Định dạng thành yyyy-mm-dd để tạo đối tượng Date
    const targetDate = new Date(reservationDateFormatted);

    // Tìm cột khớp với `reservationDate`
    const columns = document.querySelectorAll("th");
    let columnPrefix = null;

    columns.forEach((column, index) => {
        const dateSpan = column.querySelector("span");

        if (dateSpan) {
            const columnDate = new Date(dateSpan.textContent.split("/").reverse().join("-"));  // Định dạng thành yyyy-mm-dd
            if (columnDate.getTime() === targetDate.getTime()) {
                columnPrefix = Object.values(daysOfWeek)[index - 1];
            }
        }
    });

    if (!columnPrefix) {
        //console.error("Không tìm thấy cột ngày cho reservation_date:", reservationDate);
        return [];
    }

    // Định dạng startTime và endTime
    const formattedStartTime = startTime.replace(":", "");
    const formattedEndTime = endTime.replace(":", "");

    // Lấy tất cả các ô trong cột xác định
    const allCells = document.querySelectorAll(`[id^="${columnPrefix}_"]`);
    let startFound = false;

    allCells.forEach(cell => {
        const timeRange = cell.id.split("_")[1];  // Lấy khoảng thời gian từ id, ví dụ: "08300900"
        const cellStartTime = timeRange.slice(0, 4);  // Giờ bắt đầu của ô, ví dụ: "0830"
        const cellEndTime = timeRange.slice(4, 8);    // Giờ kết thúc của ô, ví dụ: "0900"

        // Kiểm tra nếu thời gian của ô trùng với `start_time` hoặc đã tìm thấy thời gian bắt đầu
        if (cellStartTime === formattedStartTime || startFound) {
            startFound = true;
            selectedCells.push(cell);

            // Dừng lại khi đã đạt đến `end_time`
            if (cellEndTime === formattedEndTime) {
                startFound = false;
            }
        }
    });

    return selectedCells;
}




// Gọi loadBookings khi tải trang để hiển thị booking từ database
document.addEventListener('DOMContentLoaded', loadBookings);

document.addEventListener('DOMContentLoaded', function () {
    // Lấy tất cả các nút phòng và gắn sự kiện click
    const roomButtons = document.querySelectorAll('.room-select');
    roomButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Bỏ active khỏi tất cả các nút và chỉ đặt active cho nút được nhấn
            roomButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Xóa các booking cũ trước khi load lại
            clearAllBookings();
            clearHighlightedCells();
            // Gọi lại loadBookings để load dữ liệu cho phòng đã chọn
            loadBookings();
        });
    });

    // Gọi loadBookings lần đầu tiên khi trang được tải
    loadBookings();
});

function clearAllBookings() {
    // Lấy tất cả các ô có class 'booked' và xóa nội dung
    const bookedCells = document.querySelectorAll('.booked');
    bookedCells.forEach(cell => {
        cell.innerHTML = ''; // Xóa nội dung của ô
        cell.classList.remove('booked'); // Xóa class 'booked' để không nhầm lẫn với booking mới
    });
}

function clearHighlightedCells() {
    document.querySelectorAll('.schedule-table td.highlighted').forEach(cell => {
        cell.classList.remove('highlighted');
    });
    document.querySelectorAll('.schedule-table td.tmpDisable').forEach(cell => {
        cell.classList.remove('tmpDisable');
    });
    document.querySelectorAll('.schedule-table th.tmpDisable').forEach(cell => {
        cell.classList.remove('tmpDisable');
    });
}

function parseDate(dateString) {
    // Tách ngày, tháng, năm từ chuỗi
    const [day, month, year] = dateString.split('/');
    // Tạo đối tượng Date (tháng trong JavaScript bắt đầu từ 0)
    return new Date(year, month - 1, day);
}