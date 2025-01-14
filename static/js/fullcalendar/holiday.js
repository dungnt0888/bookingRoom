let calendar;
document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
        initialView: 'dayGridYear',
        locale: 'vi', // Ngôn ngữ tiếng Việt
        selectable: true, // Cho phép chọn ngày
        events: function (fetchInfo, successCallback, failureCallback) {
            fetch('/holiday/list')
                .then(response => response.json())
                .then(data => {
                    if (data.length === 0) {
                        alert('Không có ngày nghỉ lễ nào!');
                    }
                    successCallback(data);
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Đã xảy ra lỗi',
                        text: error.message || 'Lỗi không xác định!',
                        confirmButtonText: 'OK'
                    });
                    failureCallback(error);
                });
        }, // API lấy danh sách ngày lễ
        displayEventTime: false, // Không hiển thị thời gian
        displayEventEnd: false, // Không hiển thị thời gian kết thúc
        select: function (info) {
             const events = calendar.getEvents();

            // Kiểm tra xem ngày được chọn đã có sự kiện chưa
            const hasEvent = events.some(event => event.startStr === info.startStr);

            if (hasEvent) {
                // Nếu ngày đã có sự kiện, hiển thị thông báo hoặc bỏ qua hành động
                Swal.fire({
                    icon: 'warning',
                    title: 'Ngày đã có sự kiện',
                    text: 'Bạn không thể thêm sự kiện vào ngày này.',
                    confirmButtonText: 'OK'
                });
                return; // Dừng xử lý nếu ngày đã có sự kiện
            }
            // Khi chọn ngày, hiển thị modal thêm ngày lễ
            const [year, month, day] = info.startStr.split('-');
            const displayDate = `${day}/${month}/${year}`;
            Swal.fire({
                title: 'Thêm ngày nghỉ lễ',
                html: `
                    <div class="form-group text-left">
                        <label for="swal-holidayDate">Ngày:</label>
                        <input type="text" id="swal-holidayDate" class="form-control" value="${displayDate}" readonly>
                    </div>
                    <div class="form-group text-left">
                        <label for="swal-holidayName">Tên:</label>
                        <input type="text" id="swal-holidayName" class="form-control" required>
                    </div>
                    <div class="form-group text-left">
                        <label for="swal-holidayDescription">Mô tả:</label>
                        <input type="text" id="swal-holidayDescription" class="form-control">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Lưu',
                cancelButtonText: 'Hủy',
                preConfirm: () => {
                    const date = info.startStr;
                    const name = document.getElementById('swal-holidayName').value.trim();
                    const description = document.getElementById('swal-holidayDescription').value.trim();

                    if (!name || !description) {
                        Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin');
                        return false;
                    }

                    return { date, name, description };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const { date, name, description } = result.value;

                    // Gửi dữ liệu đến server
                    fetch('/holiday/add', {
                        method: 'POST',
                        body: JSON.stringify({ date, name, description }),
                        headers: { 'Content-Type': 'application/json' }
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.message) {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Thành công',
                                    text: data.message,
                                    timer: 1000
                                });
                                calendar.refetchEvents(); // Làm mới lịch
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Lỗi',
                                    text: data.error || 'Không thể thêm ngày nghỉ lễ!'
                                });
                            }
                        })
                        .catch(error => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Lỗi kết nối',
                                text: 'Không thể kết nối đến server: ' + error.message
                            });
                        });
                }
            });
        },
        eventClick: function (info){
            const event = info.event;
            const { title, startStr, extendedProps } = event;
            const [year, month, day] = startStr.split('-');
            Swal.fire({
                    title: 'Chi tiết ngày nghỉ lễ',
                    html: `
                        <div class="form-group text-left">
                            <label for="swal-holidayDate">Ngày:</label>
                            <input type="text" id="swal-holidayDate" class="form-control" value="${day}/${month}/${year}" readonly>
                        </div>
                        <div class="form-group text-left">
                            <label for="swal-holidayName">Tên:</label>
                            <input type="text" id="swal-holidayName" class="form-control" value="${title}" readonly>
                        </div>
                        <div class="form-group text-left">
                            <label for="swal-holidayDescription">Mô tả:</label>
                            <input type="text" id="swal-holidayDescription" class="form-control" value="${extendedProps.description || ''}" readonly>
                        </div>
                    `,
                    showCancelButton: true,
                    showDenyButton: true,
                    confirmButtonText: 'Sửa',
                    denyButtonText: 'Xóa',
                    cancelButtonText: 'Đóng',
                }).then((result) => {
                    if (result.isConfirmed) {
                        editHoliday(event);
                    } else if (result.isDenied) {
                        deleteHoliday(event);
                    }
            });
        },
    });

    calendar.render();
});

function editHoliday(event) {
    const { title, startStr, extendedProps } = event;

    Swal.fire({
        title: 'Sửa ngày nghỉ lễ',
        html: `
            <div class="form-group text-left">
                <label for="swal-holidayDate">Ngày:</label>
                <input type="text" id="swal-holidayDate" class="form-control" value="${startStr}" readonly>
            </div>
            <div class="form-group text-left">
                <label for="swal-holidayName">Tên:</label>
                <input type="text" id="swal-holidayName" class="form-control" value="${title}" required>
            </div>
            <div class="form-group text-left">
                <label for="swal-holidayDescription">Mô tả:</label>
                <input type="text" id="swal-holidayDescription" class="form-control" value="${extendedProps.description || ''}" required>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Lưu',
        cancelButtonText: 'Hủy',
        preConfirm: () => {
            const name = document.getElementById('swal-holidayName').value.trim();
            const description = document.getElementById('swal-holidayDescription').value.trim();

            if (!name || !description) {
                Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin');
                return false;
            }

            return { date: startStr, name, description };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { date, name, description } = result.value;

            fetch('/holiday/update', {
                method: 'POST',
                body: JSON.stringify({ date, name, description }),
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        Swal.fire('Thành công', data.message, 'success');
                        calendar.refetchEvents(); // Làm mới lịch
                    } else {
                        Swal.fire('Lỗi', data.error || 'Không thể cập nhật ngày lễ!', 'error');
                    }
                })
                .catch(error => {
                    Swal.fire('Lỗi kết nối', 'Không thể kết nối đến server: ' + error.message, 'error');
                });
        }
    });
}


function deleteHoliday(event) {
    const { startStr } = event;

    Swal.fire({
        title: 'Xóa ngày nghỉ lễ',
        text: 'Bạn có chắc chắn muốn xóa ngày nghỉ lễ này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/holiday/delete', {
                method: 'POST',
                body: JSON.stringify({ date: startStr }),
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        Swal.fire('Đã xóa!', data.message, 'success');
                        calendar.refetchEvents(); // Làm mới lịch
                    } else {
                        Swal.fire('Lỗi', data.error || 'Không thể xóa ngày lễ!', 'error');
                    }
                })
                .catch(error => {
                    Swal.fire('Lỗi kết nối', 'Không thể kết nối đến server: ' + error.message, 'error');
                });
        }
    });
}
