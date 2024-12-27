const roomColors = {
  'Phòng họp nhỏ lầu 1': '#FF5733',
  'Phòng họp dài lầu 1': '#33FF57',
  'Phòng họp lầu 2': '#e0f44f',
  'Phòng giải trí lầu 9': '#4ce1f3',
};
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
    const calendar = new FullCalendar.Calendar(calendarEl, {
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
      dayHeaderFormat: { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' },
      eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false, // Đặt thành false để dùng 24h format
        },
        locale: 'vi',
      visibleRange: function(currentDate) {
          // Bắt đầu từ thứ 2 và kết thúc vào thứ 7
          const start = currentDate.startOf('week').add(1, 'day'); // Thứ 2
          const end = start.add(5, 'day'); // Thứ 7
          return { start, end };
        },
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