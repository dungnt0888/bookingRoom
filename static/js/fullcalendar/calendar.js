const roomColors = {
  'Phòng họp nhỏ lầu 1': '#FF5733',
  'Phòng họp dài lầu 1': '#33FF57',
  'Phòng họp lầu 2': '#e0f44f',
  'Phòng giải trí lầu 9': '#4ce1f3',
};
let calendar;
document.addEventListener('DOMContentLoaded', function() {
    const legendContainer = document.getElementById('legend-container');
    legendContainer.style.display = 'flex';
    legendContainer.style.flexWrap = 'wrap';
    legendContainer.style.marginBottom = '10px';

    for (const [room, color] of Object.entries(roomColors)) {
        const legendItem = document.createElement('div');
        legendItem.style.display = 'flex';
        legendItem.style.alignItems = 'center';
        legendItem.style.marginRight = '20px';

        const colorBox = document.createElement('div');
        colorBox.style.width = '15px';
        colorBox.style.height = '15px';
        colorBox.style.backgroundColor = color;
        colorBox.style.marginRight = '5px';

        const label = document.createElement('span');
        label.textContent = room;

        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    }

    //==================================================
    const calendarEl = document.getElementById('calendar')
      calendar = new FullCalendar.Calendar(calendarEl, {
      schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
      initialView: 'timeGridWeek', // Chế độ xem mặc định
      editable: true, // Cho phép kéo thả
      selectable: true, // Cho phép chọn vùng
      eventResizableFromStart: true, // Resize từ đầu
      allDaySlot: false, // Ẩn dòng All-day
      contentHeight: 'auto',
      slotMinTime: '07:00:00', // Bắt đầu hiển thị từ 7h sáng
      slotMaxTime: '20:00:00', // Kết thúc hiển thị vào 8h tối
      //plugins: [ 'resourceTimeGridPlugin' ], // Sử dụng plugin Premium
      resources: [ // Danh sách phòng họp
          { id: 'Phòng họp nhỏ lầu 1', title: 'Phòng họp nhỏ lầu 1' },
          { id: 'Phòng họp dài lầu 1', title: 'Phòng họp dài lầu 1' },
          { id: 'Phòng họp lầu 2', title: 'Phòng họp lầu 2' },
          { id: 'Phòng giải trí lầu 9', title: 'Phòng giải trí lầu 9' },
        ],
      headerToolbar: {
        left: 'prev,next today', // Các nút điều hướng
        center: 'title', // Tiêu đề
        right: 'resourceTimeGridDay,timeGridWeek,dayGridMonth,resourceTimelineDay',
      },
      views: {
        dayGridMonth: { buttonText: 'Tháng' }, // Nút hiển thị là "Tháng"
        timeGridWeek: { buttonText: 'Tuần' }, // Nút hiển thị là "Tuần"
        resourceTimeGridDay: { buttonText: 'Ngày' }, // Nút hiển thị là "Ngày"
        resourceTimelineDay: {buttonText: 'Timeline'}
      },
      eventAllow: function (dropInfo, draggedEvent) {
        // Kiểm tra nếu chế độ xem hiện tại là 'timeGridDay'
        const currentView = calendar.view.type;
        if (currentView !== 'resourceTimeGridDay') {
          return false; // Không cho chỉnh sửa nếu không phải chế độ ngày
        }
        // Kiểm tra thời gian mới
        const start = new Date(dropInfo.start);
        const end = new Date(dropInfo.end);

        const restrictedStart = new Date(start);
        restrictedStart.setHours(12, 0, 0, 0); // 12:00:00
        const restrictedEnd = new Date(start);
        restrictedEnd.setHours(13, 30, 0, 0); // 13:30:00

        // Kiểm tra nếu sự kiện giao với khoảng bị hạn chế
        return !(start < restrictedEnd && end > restrictedStart);

         // Cho phép chỉnh sửa
         // Không cho chỉnh sửa
      },
        selectAllow: function(selectInfo) {
              const currentView = calendar.view.type;
              if (currentView !== 'resourceTimeGridDay' &&  currentView !== 'timeGridDay') {
                return; // Chỉ cho phép chọn trong chế độ Ngày
              }
              const start = new Date(selectInfo.start);
              const end = new Date(selectInfo.end);

              const restrictedStart = new Date(start);
              restrictedStart.setHours(12, 0, 0, 0); // 12:00:00
              const restrictedEnd = new Date(start);
              restrictedEnd.setHours(13, 30, 0, 0); // 13:30:00

              // 1. Kiểm tra nếu thời gian rơi vào khoảng 12:00 - 13:30
              const isRestrictedTime = (start < restrictedEnd && end > restrictedStart);

              // 2. Kiểm tra nếu ngày nhỏ hơn ngày hiện tại
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Chỉ so sánh ngày
              const isPastDate = start < today;

              // 3. Kiểm tra nếu đã có sự kiện trong khoảng thời gian
              const events = calendar.getEvents(); // Lấy tất cả các sự kiện trong lịch
              const isOverlappingEvent = events.some(event => {
                  //console.log(event._def.resourceIds[0]);
                  //console.log(selectInfo.resource._resource.id);
                  const rId = event._def.resourceIds[0]? event._def.resourceIds[0] : ''
                  if (rId === selectInfo.resource._resource.id) {
                      return (
                          event.start < end && event.end > start // Chồng lấn thời gian
                      );
                    }
              });
              // Chặn nếu bất kỳ điều kiện nào đúng
              return !(isRestrictedTime || isPastDate || isOverlappingEvent);

          },
      select: function(info) {
          // Thời gian bắt đầu và kết thúc
          const currentView = calendar.view.type;
          //console.log("Current view type:", currentView);
          //console.log("Resources:", calendar.getResources());
          //console.log("Select Info:", info);
          if (currentView !== 'resourceTimeGridDay' &&  currentView !== 'timeGridDay') {
            return; // Chỉ cho phép chọn trong chế độ Ngày
          }

          //console.log(info.resource._resource.id);
          //console.log(info.start);
          //console.log(info.end);
          savingMeetingModal(info);

      },
      dayHeaderFormat: { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' },
      eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false, // Đặt thành false để dùng 24h format
        },
        locale: 'vi',
      visibleRange: function (currentDate) {
        // Tìm ngày đầu tuần (Thứ Hai)
        const start = currentDate.startOf('week').add(1, 'day'); // Bỏ qua Chủ Nhật
        // Tìm ngày cuối (Thứ Bảy)
        const end = start.add(5, 'day'); // Thứ Hai + 5 ngày = Thứ Bảy
        return { start, end };
    },
      hiddenDays: [0], // Ẩn Chủ Nhật (0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy)
      eventOverlap: false,
      events: {
          url: 'api/booking/get_bookings',
          failure: function() {
            Swal.fire({
              title: 'Lỗi',
              text: 'Không thể tải dữ liệu sự kiện!',
              icon: 'error',
              confirmButtonText: 'Đóng'
            });
          }
        }, // API endpoint để lấy dữ liệu
        eventDataTransform: function(eventData) {
      // Chuyển đổi định dạng dữ liệu
        const [day, month, year] = eventData.reservation_date.split('/');
        const color = roomColors[eventData.room_name] || '#3357FF'; // Màu mặc định nếu không khớp phòng
        let borderColor;
        if (new Date() < new Date(`${year}-${month}-${day}T${eventData.start_time}`)) {
        borderColor = '#c9e318'; // Sự kiện sắp diễn ra (xanh lá)
        } else if (new Date() > new Date(`${year}-${month}-${day}T${eventData.end_time}`)) {
        borderColor = '#0ff451'; // Sự kiện đã kết thúc (đỏ)
        } else {
        borderColor = '#ffc107'; // Sự kiện đang diễn ra (vàng)
        }

  // Đặt màu sắc dựa trên phòng

      return {
        id: eventData.booking_id,
        title: eventData.booking_name || "Không có tiêu đề",
        start: `${year}-${month}-${day}T${eventData.start_time}`,
        end: `${year}-${month}-${day}T${eventData.end_time}`,
        allDay: false, // Đánh dấu sự kiện không phải cả ngày
        backgroundColor: color, // Màu nền
        borderColor: borderColor,     // Màu viền
        textColor: '#ffffff',   // Màu chữ
        resourceId: eventData.room_name.trim(),
        extendedProps: {
          chairman: eventData.chairman,
          department: eventData.department,
          room_name: eventData.room_name,
          meeting_content: eventData.meeting_content,
          username: eventData.username,
          role: eventData.role,
          start_time: eventData.start_time, // Thêm start_time vào extendedProps
          end_time: eventData.end_time      // Thêm end_time vào extendedProps
        }
      };
},
    eventClick: function(info) {
      const props = info.event.extendedProps;
      Swal.fire({
        title: info.event.title,
        html: `
          <p><strong>Người chủ trì:</strong> ${props.chairman}</p>
          <p><strong>Bộ phận:</strong> ${props.department}</p>
          <p><strong>Phòng:</strong> ${props.room_name}</p>
          <p><strong>Nội dung:</strong> ${props.meeting_content}</p>
          <p><strong>Thời gian:</strong> ${props.start_time} - ${props.end_time}</p>
        `,
        icon: 'info',
        confirmButtonText: 'Đóng'
      });
    },
        datesSet: function () {
      // Lắng nghe sự kiện click trên tiêu đề ngày
      setTimeout(() => {
        document.querySelectorAll('.fc-col-header-cell').forEach((headerCell) => {
          headerCell.style.cursor = 'pointer'; // Thay đổi con trỏ chuột để chỉ định có thể click
          headerCell.addEventListener('click', function () {
            const dateStr = headerCell.getAttribute('data-date'); // Lấy ngày từ thuộc tính data-date
            if (dateStr) {
              calendar.changeView('resourceTimeGridDay', dateStr); // Chuyển sang view ngày
            }
          });
        });
        document.querySelectorAll('.fc-timegrid-slot-label').forEach((label) => {
        const time = label.getAttribute('data-time');
        if (time >= '12:00:00' && time < '13:30:00') {
          label.parentElement.style.backgroundColor = '#151515';
          label.parentElement.style.opacity = '0.5';
        }
      });
      }, 0);
    },
});

calendar.render()
})

window.hideForm = function() {
    const save_modal = document.getElementById("saving-modal");
    if (save_modal) save_modal.style.display = "none";

    const edit_modal = document.getElementById("edit-modal");
    if (edit_modal) edit_modal.style.display = "none";
};

function savingMeetingModal(info){
    const rawDate = info.start; // Lưu giá trị Date gốc
          // Hiển thị ngày theo định dạng dd/mm/yyyy
          const day = String(rawDate.getDate()).padStart(2, '0');
          const month = String(rawDate.getMonth() + 1).padStart(2, '0');
          const year = rawDate.getFullYear();
          const formattedDate = `${day}/${month}/${year}`; // Định dạng dd/mm/yyyy
          const reservationDate = `${year}/${month}/${day}`

          const start = info.start;
          const end = info.end;
          const startTime = start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          const endTime = end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          const modal = document.getElementById("saving-modal");
          modal.style.display = "flex";
          document.getElementById("room-name").textContent = info.resource._resource.id;
          document.getElementById("time-range").textContent = startTime + ' - ' + endTime;
          document.getElementById("booking-date").textContent = formattedDate;
}

/*async function saveBooking(data, frequency) {
    const [day, month, year] = data.reservation_date.split('/').map(Number);
    //const dbDate = `${year}/${month}/${day}`;
    const bookingWeekly = new Date(year, month - 1, day);
    const currentDay = bookingWeekly.getDay();
    const remainingDays = getRemainingDaysInMonth(year, month -1, currentDay, bookingWeekly);
    //console.log(remainingDays);
    let dataWeekly = []
    if (frequency.trim() === 'weekly' && remainingDays.length >0){
        dataWeekly = remainingDays.map(date => ({
           ...data,
            reservation_date: date, // Thay đổi ngày
        }));
    }
    try{
        if(dataWeekly.length > 0){
            const responses = await Promise.all(
                dataWeekly.map(async (data) => {
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
        else
        {
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
                return { success: true, booking_id: result.booking_id };
                // Cập nhật DOM với booking_id từ server
                // updateBookingUI(result.booking_id, data);
            } else {
                console.error("Failed to save booking:", result.message);
                alert("Lỗi khi đặt phòng." + result.message + " Hãy thử lại");
                return { success: false, message: result.message };
            }

        }
    }catch (error) {
        console.error("Error saving booking:", error);
        alert("Lỗi khi đặt phòng." + error + " Hãy thử lại");
        return { success: false, message: error.message };
    }
    //console.log(dataWeekly);
}
*/

async function saveBooking(data, frequency) {
    const [day, month, year] = data.reservation_date.split('/').map(Number);
    const bookingWeekly = new Date(year, month - 1, day);
    const currentDay = bookingWeekly.getDay();
    const remainingDays = getRemainingDaysInMonth(year, month - 1, currentDay, bookingWeekly);

    let dataWeekly = [];
    if (frequency.trim() === 'weekly' && remainingDays.length > 0) {
        dataWeekly = remainingDays.map(date => ({
            ...data,
            reservation_date: date, // Thay đổi ngày
        }));
    }

    try {
        if (dataWeekly.length > 0) {
            const responses = await Promise.all(dataWeekly.map(saveAPI));
            const successResults = responses.filter(res => res.success);
            const failureResults = responses.filter(res => !res.success);

            // Xử lý kết quả
            successResults.forEach((result, index) => {
                console.log(
                    `Booking ${index + 1} saved successfully with ID: ${result.booking_id}`
                );
                // Cập nhật DOM nếu cần
                // updateBookingUI(result.booking_id, dataWeekly[index]);
            });

            if (failureResults.length > 0) {
                console.error(
                    `Some bookings failed: ${failureResults.map(f => f.message).join(', ')}`
                );
                alert(
                    `Failed to save some bookings:\n${failureResults
                        .map((f, i) => `Booking ${i + 1}: ${f.message}`)
                        .join('\n')}`
                );
            }

            return {
                success: failureResults.length === 0,
                successResults,
                failureResults,
            };
        } else {
            const result = await saveAPI(data);
            if (result.success) {
                console.log("Booking saved successfully with ID:", result.booking_id);
                // Cập nhật DOM nếu cần
                // updateBookingUI(result.booking_id, data);
            } else {
                console.error("Failed to save booking:", result.message);
                alert(`Failed to save booking: ${result.message}`);
            }
            return result;
        }
    } catch (error) {
        console.error("Error saving booking:", error);
        alert(`Error saving booking: ${error.message}`);
        return { success: false, message: error.message };
    }
}

async function saveAPI (data){
    try {
        const response = await fetch('/api/booking/submit_booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.booking_id) {
            return { success: true, booking_id: result.booking_id };
        } else {
            return { success: false, message: result.message || 'Unknown error' };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
}

document.getElementById("booking-form-content").addEventListener("submit", async function(event) {
    event.preventDefault();
    const chairman = document.getElementById("chairman").value;
    const bookingName = document.getElementById("booking_name").value;
    const department = document.getElementById("department").value;
    const meetingContent = document.getElementById("meetingContent").value;
    const selectedFrequency = document.querySelector('input[name="frequency"]:checked').value;
    const reservationDate = document.getElementById("booking-date").innerText.trim();
    const startTime = document.getElementById("time-range").innerText.split(' - ')[0].trim();
    const endTime = document.getElementById("time-range").innerText.split(' - ')[1].trim();
    const roomName = document.getElementById("room-name").innerText.trim();
    //console.log("Chairman:", chairman);
    //console.log("Booking Name:", bookingName);
    //console.log("Department:", department);
    //console.log("Meeting Content:", meetingContent);
    //console.log("Tuần suất :", selectedFrequency);
    //console.log("Đặt ngày :", reservationDate);
    //console.log("Start time :", startTime);
    //console.log("End time :", endTime);
    const data = {
        booking_name: bookingName,
        department: department,
        chairman: chairman,
        meeting_content: meetingContent,
        room_name: roomName,
        reservation_date: reservationDate,
        start_time: startTime,
        end_time: endTime,
        username: loggedInUser
    };
    //console.log("Data :", data);
    const result = await saveBooking(data, selectedFrequency);
    if(result.success){
         hideForm();
         // Làm mới calendar
        calendar.refetchEvents();
    }else {
        alert(`Failed to save booking: ${result.message}`);
    }

});

function getRemainingDaysInMonth(year, month, dayOfWeek, startDate) {
    const timeZone = 'Asia/Bangkok'; // Múi giờ GMT+7

    // Chuyển startDate thành thời gian trong múi giờ mong muốn
    const startDateInTZ = new Date(startDate.toLocaleString('en-US', { timeZone }));

    if (startDateInTZ.getFullYear() !== year || startDateInTZ.getMonth() !== month) {
        throw new Error("startDate không thuộc tháng hoặc năm được cung cấp.");
    }

    // Lấy ngày bắt đầu và thứ trong tuần từ startDate
    const currentDayOfMonth = startDateInTZ.getDate();

    // Định dạng để lấy thứ trong tuần theo múi giờ mong muốn
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'short',
    });
    const startDayName = dayFormatter.format(startDateInTZ);

    // Bản đồ thứ trong tuần sang số
    const dayMap = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };
    const startDayOfWeek = dayMap[startDayName];

    if (startDayOfWeek !== dayOfWeek) {
        throw new Error(
            `startDate không phải là ngày thuộc thứ ${dayOfWeek}.`
        );
    }

    // Số ngày trong tháng
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const matchingDays = [];

    // Lặp từ ngày hiện tại đến cuối tháng
    for (let day = currentDayOfMonth; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateInTZ = new Date(date.toLocaleString('en-US', { timeZone }));

        // Lấy thứ trong tuần của ngày hiện tại trong múi giờ mong muốn
        const dayName = dayFormatter.format(dateInTZ);
        const dayOfWeekInTZ = dayMap[dayName];

        if (dayOfWeekInTZ === dayOfWeek) {
            // Định dạng ngày theo múi giờ mong muốn
            const formattedDate = dateInTZ.toLocaleDateString("en-GB", { timeZone });
            const dbDate = formattedDate.split('/').reverse().join('/');
            matchingDays.push(dbDate); // Định dạng DD/MM/YYYY
        }
    }

    return matchingDays;
}