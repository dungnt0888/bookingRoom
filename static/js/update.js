document.body.addEventListener("click", function (event) {
    // Nếu event.target là .department hoặc nằm trong .department
    if (event.target.classList.contains("department") || event.target.closest(".department")) {
        const departmentElement = event.target.closest(".department") || event.target; // Lấy phần tử .department
        //console.log("Clicked on department or inside department:", departmentElement);
        //openEditForm(departmentElement); // Gọi hàm chỉnh sửa với phần tử .department
        if(departmentElement){
            const bookingContent = departmentElement.closest(".booking-content");
            //console.log("bookingContent:", bookingContent);
            const user = bookingContent.querySelector(".username");
            //console.log("user:", user);
            const userId = user.getAttribute("data-id").trim();
            //console.log("user:", userId === loggedInUser);
            // Lấy nội dung văn bản và kiểm tra điều kiện
            if (userId === loggedInUser.trim() || loggedInUserRole.trim() === 'Administrator') {
                const checkInactive = bookingContent.closest(".inactive");
                if (bookingContent && !checkInactive) {
                    // Lấy giá trị `data-id` từ `.booking-content`
                    const bookingId = bookingContent.getElementsByClassName("booking-id")[0].dataset.id;
                    console.log("Booking ID:", bookingId);
                    openEditForm(bookingId);
                    //console.log("Booking ID:", bookingId);
                }
            }
        }
        event.stopPropagation(); // Ngăn sự kiện lan đến các thành phần cha
        return;
    }
});


async function openEditForm(bookingId) {

     try {
        // Load danh sách time slots trước
        loadTimeSlots();

        // Gọi API để lấy dữ liệu booking
        const data = await getBookingJSON(bookingId);

        if (!data) {
            console.error("Không tìm thấy dữ liệu booking.");
            return;
        }

        // Điền dữ liệu vào form Edit
        document.getElementById("edit-booking-id").innerText = bookingId;
        document.getElementById('edit-booking-date').innerText = data.reservation_date || '';
        document.getElementById('edit-room-name').innerText = `Tên phòng: ${data.room_name || ''}`;
        document.getElementById('edit-chairman').value = data.chairman || '';
        document.getElementById('edit-booking_name').value = data.booking_name || '';
        document.getElementById('edit-department').value = data.department || '';
        document.getElementById('edit-meetingContent').value = data.meeting_content || '';
        document.getElementById('edit-start-time').value = data.start_time || '';
        document.getElementById('edit-end-time').value = data.end_time || '';
        document.getElementById('edit-booking-username').innerText = data.role || '';
        document.getElementById('edit-booking-username').setAttribute("data-id", data.username);
        // Hiển thị modal chỉnh sửa
        document.getElementById('edit-modal').style.display = 'block';

    } catch (error) {
        console.error("Lỗi khi mở form chỉnh sửa:", error);
    }
}




async function getBookingJSON(bookingID){
    try{
        const response = await  fetch(`api/booking/get_booking/${bookingID}`);
         if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        return data;
    }
    catch (error) {
        console.error("Failed to load bookings:", error);
        return null;
    }
}

const timeSlots = [
    "7:00", "7:30", "8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00"
];

// Hàm load time slots vào dropdown
function loadTimeSlots() {
    const startTimeDropdown = document.getElementById('edit-start-time');
    const endTimeDropdown = document.getElementById('edit-end-time');

    // Xóa các option cũ
    startTimeDropdown.innerHTML = '<option value="" disabled selected>-- Chọn giờ bắt đầu --</option>';
    endTimeDropdown.innerHTML = '<option value="" disabled selected>-- Chọn giờ kết thúc --</option>';

    // Thêm time slots vào dropdown
    timeSlots.forEach(time => {
        const startOption = document.createElement('option');
        startOption.value = time;
        startOption.textContent = time;
        startTimeDropdown.appendChild(startOption);

        const endOption = document.createElement('option');
        endOption.value = time;
        endOption.textContent = time;
        endTimeDropdown.appendChild(endOption);
    });
}

document.getElementById("edit-booking-form-content").addEventListener("submit", async function (e) {
    e.preventDefault(); // Ngăn chặn form reload trang

    const bookingID = document.getElementById("edit-booking-id").innerText;

    // Lấy dữ liệu từ form
    const formData = {
        chairman: document.getElementById('edit-chairman').value.trim(),
        booking_name: document.getElementById('edit-booking_name').value.trim(),
        department: document.getElementById('edit-department').value.trim(),
        meeting_content: document.getElementById('edit-meetingContent').value.trim(),
        start_time: document.getElementById('edit-start-time').value,
        end_time: document.getElementById('edit-end-time').value,
        reservation_date:  document.getElementById('edit-booking-date').innerText.trim()
    };
     //console.log(formData);
    // Kiểm tra dữ liệu (validate)
    const startTime = new Date(`1970-01-01T${formData.start_time}:00`);
    const endTime = new Date(`1970-01-01T${formData.end_time}:00`);
    const [day, month, year] = formData.reservation_date.split('/'); // Tách chuỗi ngày
    const combinedDateTime = new Date(`${year}-${month}-${day}T${formData.start_time}`);
    const currentDateTime = new Date(new Date().toISOString());
    const gmt7DateTime = new Date(currentDateTime.getTime() + (7 * 60 * 60 * 1000));
    if (!formData.start_time || !formData.end_time || startTime >= endTime) {
        console.log("start_time ", startTime >= endTime);
        console.log("start_time ", formData.start_time);
        console.log("end_time ", formData.end_time);
        //console.log("Vui lòng chọn thời gian hợp lệ. Thời gian kết thúc phải lớn hơn thời gian bắt đầu");
        alert("Vui lòng chọn thời gian hợp lệ. Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
        return;
    }
    console.log("combinedDateTime ", combinedDateTime);
    console.log("gmt7DateTime ", gmt7DateTime);
    if (combinedDateTime < gmt7DateTime) {
        alert("Không thể sửa vào khoảng thời gian đã qua.");
        event.preventDefault();
        return;
    }

    if(formData.booking_name === "Họp giao ban" && !(formData.start_time ==="8:30" || formData.start_time ==="17:00")){
         alert("Vui lòng chọn thời gian hợp lệ. Thời gian họp giao ban chỉ đầu giờ cuối giờ.");
         return;
    }

    try {
        await updateBooking(bookingID, formData);
        window.location.reload();
    } catch (error) {
        console.error("Lỗi khi gửi dữ liệu:", error);
        alert("Có lỗi xảy ra trong quá trình cập nhật.");
    }
});


async function updateBooking(bookingID, formData) {
    try {
        const response = await fetch(`/api/booking/edit_booking/${bookingID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);

            window.loadBookings();
            window.hideForm();// Cập nhật thành công
        } else {
            alert(`Lỗi: ${result.message}`); // Thời gian trùng lặp hoặc lỗi khác
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật booking:", error);
        alert("Có lỗi xảy ra khi gửi yêu cầu.");
    }
}
