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
                <label>Tần suất:</label>
                <div style="display: flex; gap: 20px; align-items: center;">
                    <label>
                        <input type="radio" id="frequency-once" name="frequency" value="once" checked>
                        Một lần
                    </label>
                    <label>
                        <input type="radio" id="frequency-weekly" name="frequency" value="weekly">
                        Hàng tuần
                    </label>
                </div>
                <br>
                <button type="submit">Xác nhận</button>
                <button type="button" onclick="this.closest('.booking-form-content').remove()">Tắt</button>
            </form>
        </div>
    `;

    //document.body.appendChild(formContainer);
    document.getElementById("booking-date").textContent = bookingDate;
    document.getElementById("room-name").textContent = roomName;
    document.getElementById("time-range").textContent = 'Thời gian ' + timeRange;
    const modal = document.getElementById("saving-modal");
    //console.log(modal);
    modal.style.display = "flex";
    //console.log("Form created:", document.getElementById("booking-form-content"));

    document.getElementById("booking-form-content").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Lấy giá trị từ form
    const chairman = document.getElementById("chairman").value;
    const bookingName = document.getElementById("booking_name").value;
    const department = document.getElementById("department").value;
    const meetingContent = document.getElementById("meetingContent").value;
    const selectedFrequency = document.querySelector('input[name="frequency"]:checked').value;

    console.log("Chairman:", chairman);
    console.log("Booking Name:", bookingName);
    console.log("Department:", department);
    console.log("Meeting Content:", meetingContent);
    console.log("Tuần suất :", selectedFrequency);
    console.log("Đặt ngày :", bookingDate1);

    console.log("Checked element:", selectedFrequency);

    if (selectedFrequency) {
        console.log("Tần suất:", selectedFrequency.value);
    } else {
        console.error("Không tìm thấy giá trị radio button được chọn.");
    }
    //return;
    // Thêm thông tin phòng, thời gian và ngày từ các tham số
    const roomName = roomName1;
    const bookingDate = bookingDate1;
    const timeRange = timeRange1.split(" - ");
    const startTime = timeRange[0];
    const endTime = timeRange[1];
    //const user_booking = loggedInUser;
    const [day, month, year] = bookingDate1.split('/').map(Number);
    //console.log("ngày :", day);
    //console.log("tháng :", month);
    //console.log("year :", year);
    const bookingWeekly = new Date(year, month - 1, day);
    //console.log("w :", bookingWeekly);
    const currentDay = bookingWeekly.getDay();
    //console.log("thứ :", currentDay);
    const remainingDays = getRemainingDaysInMonth(year, month -1, currentDay, bookingWeekly);
    //console.log(remainingDays);
    //for (const date in remainingDays){
        //if(remainingDays > 0)
            //console.log(`Đặt phòng cho ngày: ${date}`);
    //}

    const data = {
        booking_name: bookingName,
        department: department,
        chairman: chairman,
        meeting_content: meetingContent,
        room_name: roomName,
        reservation_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        username: loggedInUser
    };
    console.log(data);

    const bookingId = `booking_${roomName}_${bookingDate}_${timeRange}`.replace(/[\s:-]/g, '_');

    // Chuẩn bị nội dung cho các phần booking
    const nameContent = `<div class="nameContent wrap-text"><strong>Cuộc họp:</strong> ${bookingName}</div>`;
    const departmentContent = `
    <div class="department wrap-text" style="background-color: #07f407; color: black; font-weight: bold; padding: 0px; width: 100%;">
        <strong>Khối:</strong> ${department}
    </div>
    `;
    const chairmanContent = `<div class="chairman wrap-text"><strong>Chủ trì:</strong> ${chairman}</div>`;
    const timeContent = `<div><strong>Thời gian:</strong> ${timeRange}</div>`;
    const meetingContentText = `<div class="meetingContent wrap-text"><strong>Nội dung:</strong> ${meetingContent}</div>`;
    let id = null;

    const closeButtonHTML = (loggedInUserRole === "Administrator" || loggedInUser === booking.username)
                ? `<button class="close-btn" onclick="removeBooking('${bookingId}')">X</button>`
                : ''; // Nếu không phải admin hoặc <td> chứa class inactive, không hiển thị nút
            // Sử dụng logic phân bổ nội dung tương tự như khi

    try {
        if (selectedFrequency === 'weekly' && remainingDays.length >0) {

            // Tạo danh sách các bản ghi
            const data2 = remainingDays.map(date => ({
                booking_name: bookingName,
                department: department,
                chairman: chairman,
                meeting_content: meetingContent,
                room_name: roomName,
                reservation_date: date,
                start_time: startTime,
                end_time: endTime,
                username: loggedInUser,
            }));

            // Gửi tất cả các yêu cầu đồng thời
            const responses = await Promise.all(
                data2.map(async (data) => {
                    const response = await fetch('/api/booking/submit_booking', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    return response.json(); // Trả về kết quả từ API
                })
            );

            // Xử lý kết quả từ tất cả các yêu cầu
            responses.forEach((result, index) => {
                if (result.booking_id) {
                    console.log(
                        `Booking ${index + 1} saved successfully with ID: ${result.booking_id}`
                    );
                    // Cập nhật DOM với từng booking_id
                    // updateBookingUI(result.booking_id, data2[index]);
                } else {
                    console.error(`Failed to save booking ${index + 1}:`, result.message);
                }
            });
            }
            else {
            // Gửi một yêu cầu nếu không phải weekly
            const response = await fetch('/api/booking/submit_booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();

            if (result.booking_id) {
                console.log("Booking saved successfully with ID:", result.booking_id);

                // Cập nhật DOM với booking_id từ server
                // updateBookingUI(result.booking_id, data);
            } else {
                console.error("Failed to save booking:", result.message);
                alert("Failed to save booking. Please try again.");
            }
        }
    } catch (error) {
        console.error("Error saving booking:", error);
        alert("Failed to save booking. Please try again.");
    }
    const book_id = `<div style="display: none" class="booking-id" data-id="${id}"></div>`;
    // Xử lý các trường hợp theo số lượng ô đã chọn
    //console.log(hasInactiveClass);
    if (selectedCells.length === 1) {
        // Nếu chỉ có 1 ô, hiển thị tất cả nội dung trong ô đó
        selectedCells[0].innerHTML = `
            <div class="booking-content" data-id="${bookingId}">
                ${closeButtonHTML} 
                ${book_id}
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
                ${closeButtonHTML} 
                ${book_id}
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
                ${closeButtonHTML} 
                ${book_id}
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
                ${closeButtonHTML} 
                ${book_id}
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
                        ${closeButtonHTML} 
                        ${book_id}
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

    // Đóng popup sau khi lưu
    //document.querySelector(".booking-form-content").remove();
    hideForm();

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

async function removeBooking(bookingId) {
    // Lấy tất cả phần tử có cùng bookingId trong các ô
    const bookingElements = document.querySelectorAll(`[data-id^="${bookingId}"]`);
    /*const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa booking này không?");
    if (!confirmDelete) {
        console.log("Hủy thao tác xóa booking.");
        return; // Hủy bỏ xóa nếu người dùng nhấn "Cancel"
    }*/
    const confirmDelete = await showConfirmModal("Bạn có chắc chắn muốn xóa lịch đặt này không?");
    if (!confirmDelete) {
        console.log("Hủy thao tác xóa booking.");
        return; // Hủy bỏ nếu người dùng chọn "Hủy"
    }

    bookingElements.forEach(bookingElement => {

        const bookingIdDiv = bookingElement.querySelector('.booking-id');
        //console.log(bookingIdDiv);
        if (bookingIdDiv) {
            // Lấy giá trị `data-id` của `booking_id`
            const innerBookingId = bookingIdDiv.dataset.id;
            console.log(`Inner Booking ID: ${innerBookingId}`);
            deleteBookingFromDatabase(innerBookingId)
                .catch(() => {
                    hasError = true; // Đánh dấu nếu có lỗi
                });

        }
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

async function deleteBookingFromDatabase(bookingId) {
    try {
        const response = await fetch('/delete_booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ booking_id: bookingId }),
        });

        const result = await response.json();
        if (result.success) {
            console.log(`Booking ID ${bookingId} đã được soft delete.`);
        } else {
            console.error(`Lỗi khi soft delete Booking ID ${bookingId}:`, result.error);
        }
    } catch (error) {
        console.error('Đã xảy ra lỗi:', error);
    }
}


function showConfirmModal(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById("confirmModal");
        const confirmYes = document.getElementById("confirmYes");
        const confirmNo = document.getElementById("confirmNo");
        const modalContent = modal.querySelector(".modal-content p");

        // Gán thông điệp cho modal
        modalContent.textContent = message;

        // Hiển thị modal
        modal.style.display = "flex";

        // Xử lý khi người dùng nhấn "Đồng ý"
        confirmYes.onclick = () => {
            modal.style.display = "none"; // Ẩn modal
            resolve(true); // Trả về true
        };

        // Xử lý khi người dùng nhấn "Hủy"
        confirmNo.onclick = () => {
            modal.style.display = "none"; // Ẩn modal
            resolve(false); // Trả về false
        };
    });
}

function getRemainingDaysInMonth(year, month, dayOfWeek, startDate) {
    // Kiểm tra startDate hợp lệ
    if (startDate.getFullYear() !== year || startDate.getMonth() !== month) {
        throw new Error("startDate không thuộc tháng hoặc năm được cung cấp.");
    }

    // Lấy ngày bắt đầu và thứ trong tuần từ startDate
    const currentDayOfMonth = startDate.getDate();
    const startDayOfWeek = startDate.getDay();

    if (startDayOfWeek !== dayOfWeek) {
        throw new Error(
            `startDate không phải là ngày thuộc thứ ${dayOfWeek}.`
        );
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Số ngày trong tháng
    const matchingDays = [];

    // Lặp từ ngày hiện tại đến cuối tháng
    for (let day = currentDayOfMonth; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);

        // Kiểm tra nếu đúng thứ trong tuần
        if (date.getDay() === dayOfWeek) {
            // Dùng định dạng local để tránh lỗi múi giờ
            const formattedDate = date.toLocaleDateString("en-GB");
            matchingDays.push(formattedDate); // Định dạng YYYY-MM-DD
        }
    }

    return matchingDays;
}

document.querySelectorAll('input[name="frequency"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
        console.log("Tần suất được thay đổi:", event.target.value);
    });
});

function hideForm() {
    const modal = document.getElementById("saving-modal");
    modal.style.display = "none";
}