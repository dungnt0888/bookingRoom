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
    // Kiểm tra nếu chế độ xem hiện tại là 'resourceTimeGridDay'
            const currentView = calendar.view.type;
            if (currentView !== 'resourceTimeGridDay' || currentView ===  "resourceTimelineDay") {
                return false; // Không cho chỉnh sửa nếu không phải chế độ ngày
            }

            // Kiểm tra thời gian mới
            const start = new Date(dropInfo.start);
            const end = new Date(dropInfo.end);
            const eventStart = new Date(draggedEvent.start); // Thời gian bắt đầu của sự kiện
            // Lấy thời gian hiện tại
            const now = new Date();
            if (eventStart < now) {
                return false; // Không cho phép chỉnh sửa sự kiện trong quá khứ
            }
            // Đặt khoảng thời gian bị hạn chế
            const restrictedStart = new Date(start);
            restrictedStart.setHours(12, 0, 0, 0); // 12:00:00
            const restrictedEnd = new Date(start);
            restrictedEnd.setHours(13, 30, 0, 0); // 13:30:00

            // Kiểm tra nếu sự kiện rơi vào khoảng bị hạn chế
            const isRestricted = start < restrictedEnd && end > restrictedStart;

            // Kiểm tra nếu sự kiện nằm trong quá khứ
            const isInPast = start < now;

            // Trả về false nếu rơi vào khoảng bị hạn chế hoặc trong quá khứ
            if (isRestricted || isInPast) {
                return false;
            }
            // Nếu không có hạn chế, cho phép chỉnh sửa
            return true;
        },
            selectAllow: function(selectInfo) {
            const currentView = calendar.view.type;

            // 1. Chỉ áp dụng trong chế độ ngày
            if (currentView !== 'resourceTimeGridDay' || currentView ===  "resourceTimelineDay") {
                return false; // Không cho phép chọn
            }

            const start = new Date(selectInfo.start);
            const end = new Date(selectInfo.end);

            // 2. Kiểm tra nếu thời gian rơi vào khoảng 12:00 - 13:30
            const restrictedStart = new Date(start);
            restrictedStart.setHours(12, 0, 0, 0); // 12:00:00
            const restrictedEnd = new Date(start);
            restrictedEnd.setHours(13, 30, 0, 0); // 13:30:00

            const isRestrictedTime = start < restrictedEnd && end > restrictedStart;

            // 3. Kiểm tra nếu ngày nhỏ hơn ngày hiện tại
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00 để so sánh ngày
            const isPastDate = start < today;

            // 4. Kiểm tra nếu đã có sự kiện chồng lấn trong cùng resource
            const events = calendar.getEvents(); // Lấy tất cả các sự kiện
            const isOverlappingEvent = events.some(event => {
                const resourceId = event._def.resourceIds[0] || '';
                return (
                    resourceId === (selectInfo.resource?._resource?.id || '') && // Kiểm tra resource
                    event.start < end && event.end > start // Kiểm tra chồng lấn thời gian
                );
            });

            // 5. Kiểm tra nếu thời gian bắt đầu < hiện tại (không cho phép chọn trong quá khứ)
            const now = new Date();
            const isPast = start < now;

            // Chặn nếu bất kỳ điều kiện nào đúng
            return !(isRestrictedTime || isPastDate || isOverlappingEvent || isPast);
     },
      select: function(info) {
          // Thời gian bắt đầu và kết thúc
          const currentView = calendar.view.type;
          //console.log("Current view type:", currentView);
          //console.log("Resources:", calendar.getResources());
          //console.log("Select Info:", info);
          if (currentView !== 'resourceTimeGridDay' || currentView ===  "resourceTimelineDay" || loggedInUser === '') {
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
      windowResize: function(view) {
        console.log("Window resized. Adjusting calendar...");
        calendar.updateSize(); // Tự động điều chỉnh kích thước lịch
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
        },
      //======================================================
        // API endpoint để lấy dữ liệu
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
                department: eventData.department,
                chairman: eventData.chairman,
                room_name: eventData.room_name,
                meeting_content: eventData.meeting_content,
                username: eventData.username,
                role: eventData.role,
                start_time: eventData.start_time, // Thêm start_time vào extendedProps
                end_time: eventData.end_time      // Thêm end_time vào extendedProps
                }
            };
        },
      //=============================================
      //Event Drop Kéo thả
      eventDrop: async function(info) {
          const currentView = info.view.type;
          if(currentView === "resourceTimeGridDay"){
              if(info){
                  await editCalendar(info);
              }
          }
      },
      //=============================================
      // Resize event
      eventResize: async function(info) {
          const currentView = info.view.type;
          if(currentView === "resourceTimeGridDay"){
              if(info){
                  await editCalendar(info);
              }
          }
      },
          resourceLabelDidMount: function(info) {
              const color = roomColors[info.resource.title];
              if (color) {
                info.el.style.backgroundColor = color; // Set text color
                info.el.style.opacity = 0.85;
                info.el.style.fontWeight = 'bold'; // Optional: Make it bold
              }
            },

       /*eventContent: function (arg) {
            const currentView = arg.view.type;
             if (currentView === 'resourceTimeGridDay' || currentView === 'timeGridDay') {
                const department = arg.event.extendedProps.department; // Lấy department từ extendedProps
                const chairman = arg.event.extendedProps.chairman; // Lấy thông tin chairman (nếu cần)
                const title = arg.event.title;

                // Tạo nội dung tùy chỉnh
                const customHtml = `
                    <div>
                        <div><b>${title}</b></div>
                        <div>${department ? `<strong>Khối: ${department}</strong>` : ''}</div>
                        <div>${chairman ? `<i>${chairman}</i>` : ''}</div>
                    </div>
                `;

                // Trả về đối tượng với innerHTML
                return { html: customHtml };
             }
              // Hiển thị mặc định cho các chế độ khác
             return { html: `<div><b>${arg.event.title}</b></div>` };

    },*/

  //=================================================
  // Event Click
  //=================================================
    eventClick: async function(info) {
      const props = info.event.extendedProps;
      const now = new Date();
      const departments = await getDepartments();
      const meetings = await getMeetings();

      //console.log(meetings);
      const eventStart = new Date(info.event.start); // Thời gian bắt đầu của sự kiện
      await Swal.fire({
            title: 'Cuộc họp',
            html: `
                <p> <h2 style="font-size: 40px; font-weight: bold" id="meetingText">${info.event.title}</h2>
                <select id="meetingDropdown" class="swal2-select" style="display: none; margin: auto">
                     <option value="" selected disabled style="color: gray; font-weight: bold;">-- Chọn một tùy chọn --</option>
                     ${meetings.meetings.map(dep => `
                        <option value="${dep.booking_name}" 
                          ${dep.booking_name === info.event.title ? 'selected' : ''}>
                          ${dep.booking_name}
                        </option>
                      `).join('')}
                </select>
                </p>
              <p><strong>Phòng ban:</strong> <h2 style="color: greenyellow" id="departmentText">${props.department}</h2>
              <select id="departmentDropdown" class="swal2-select" style="display: none; margin: auto">
                 <option value="" selected disabled style="color: gray; font-weight: bold;">-- Chọn một tùy chọn --</option>
                 ${departments.departments.map(dep => `
                    <option value="${dep.department_name}" 
                      ${dep.department_name === props.department ? 'selected' : ''}>
                      ${dep.department_name}
                    </option>
                  `).join('')}
              </select>
              </p>
              <p>
                <strong>Người chủ trì:</strong> 
                <h3 style="color: yellow;" id="chairmanText">${props.chairman}</h3>
                <input id="chairmanInput" class="swal2-input" style="display: none; margin: auto" value="${props.chairman}">
              </p>
              <p>
                <strong>Nội dung:</strong> 
                <span id="meetingContentText">${props.meeting_content}</span>
                <input id="meetingContentInput" class="swal2-input" style="display: none; margin: auto" value="${props.meeting_content}">
              </p>
              <p><strong>Phòng:</strong> ${props.room_name}</p>
              <p><strong>Thời gian:</strong> ${props.start_time} - ${props.end_time}</p>
            `,
            icon: 'info',
            showConfirmButton: eventStart >= now && (loggedInUserRole === 'Administrator'|| props.username === loggedInUserRole ), // Hiển thị nút "Xóa sự kiện" nếu sự kiện chưa bắt đầu
            confirmButtonText: 'Lưu thay đổi',
            cancelButtonText: 'Đóng',
            denyButtonText: 'Xóa sự kiện',
            showCancelButton: true,
            showDenyButton: eventStart >= now && (loggedInUserRole === 'Administrator'|| props.username === loggedInUserRole ),
            didOpen: () => {
                // Gắn sự kiện click để chuyển sang chế độ chỉnh sửa
                const chairmanText = document.getElementById('chairmanText');
                const chairmanInput = document.getElementById('chairmanInput');
                const toggleEdit = (textEl, inputEl) => {
                    textEl.style.display = 'none';
                    inputEl.style.display = 'block';
                    inputEl.focus();
                };

                const updateText = (textEl, inputEl) => {
                    inputEl.style.display = 'none';
                    textEl.style.display = 'inline';
                    textEl.textContent = inputEl.value || textEl.textContent; // Giữ nguyên nếu không có giá trị
                };
                chairmanText.addEventListener('click', () => {
                    chairmanText.style.display = 'none';
                    chairmanInput.style.display = 'block';
                    chairmanInput.focus();
                });
                chairmanInput.addEventListener('blur', () => {
                chairmanInput.style.display = 'none';
                chairmanText.style.display = 'inline';
                chairmanText.textContent = chairmanInput.value; // Cập nhật nội dung mới
                });

                const meetingContentText = document.getElementById('meetingContentText');
                const meetingContentInput = document.getElementById('meetingContentInput');
                meetingContentText.addEventListener('click', () => {
                    meetingContentText.style.display = 'none';
                    meetingContentInput.style.display = 'block';
                    meetingContentInput.focus();
                });
                meetingContentInput.addEventListener('blur', () => {
                    meetingContentInput.style.display = 'none';
                    meetingContentText.style.display = 'inline';
                    meetingContentText.textContent = meetingContentInput.value; // Cập nhật nội dung mới
                });

                const departmentText = document.getElementById('departmentText');
                const departmentInput = document.getElementById('departmentDropdown');
                departmentText.addEventListener('click', () => toggleEdit(departmentText, departmentInput));

                // Xử lý khi dropdown thay đổi giá trị (change)
                departmentInput.addEventListener('change', () => {
                    updateText(departmentText, departmentInput);
                });

                // Xử lý khi dropdown mất focus (blur)
                departmentInput.addEventListener('blur', () => {
                    updateText(departmentText, departmentInput);
                });

                const meetingText = document.getElementById('meetingText');
                const meetingInput = document.getElementById('meetingDropdown');
                meetingText.addEventListener('click', () => toggleEdit(meetingText, meetingInput));

                // Xử lý khi dropdown thay đổi giá trị (change)
                meetingInput.addEventListener('change', () => {
                    updateText(meetingText, meetingInput);
                });

                // Xử lý khi dropdown mất focus (blur)
                meetingInput.addEventListener('blur', () => {
                    updateText(meetingText, meetingInput);
                });

            },
            preConfirm: () => {
                // Lấy giá trị mới từ các ô nhập liệu
                const newChairman = document.getElementById('chairmanInput').value;
                const newMeetingContent = document.getElementById('meetingContentInput').value;
                const newDepartment = document.getElementById('departmentDropdown').value;
                const newMeeting = document.getElementById('meetingDropdown').value;

                return { newChairman, newMeetingContent, newDepartment, newMeeting };
            }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const {newChairman, newMeetingContent, newDepartment, newMeeting} = result.value;
                    const event = info.event;
                    // Gửi dữ liệu mới đến server
                    const data = {
                        booking_id: event.id || null, // Mặc định là null nếu không có id
                        booking_name: newMeeting || "", // Giá trị mặc định
                        department: newDepartment,
                        start_time: formatTime(event.start), // Định dạng thành HH:mm
                        end_time: formatTime(event.end),     // Định dạng thành HH:mm
                        chairman: newChairman, // Giá trị mặc định là chuỗi rỗng
                        room_name: event._def.resourceIds && event._def.resourceIds.length > 0 ? event._def.resourceIds[0] : "", // Kiểm tra tài nguyên
                        meeting_content: newMeetingContent, // Giá trị mặc định
                        username: event.extendedProps.username || "", // Giá trị mặc định
                        role: event.extendedProps.role || "" // Giá trị mặc định
                    };
                    try {
                        const result = await updateBooking(data.booking_id, data)
                        if (!result.success) {
                            console.warn("Edit failed, reverting changes...");
                            Swal.fire({
                                title: 'Lỗi',
                                text: result.message || 'Edit lỗi! Hãy kiểm tra lại dữ liệu.',
                                icon: 'error',
                                confirmButtonText: 'Đóng'
                            });
                            info.revert();
                        } else {
                            //console.log("Edit successful:", data);
                            Swal.fire({
                              title: 'Thành công',
                              text: 'Bạn đã đặt lịch thành công!',
                              icon: 'success',
                              timer: 1000, // Tự động đóng sau 1.5 giây
                              showConfirmButton: false
                            });
                            calendar.refetchEvents();
                        }

                    } catch (error) {
                        console.error("Error during edit:", error);
                        Swal.fire({
                            title: 'Lỗi mạng',
                            text: 'Không thể kết nối tới server. Hãy thử lại sau.',
                            icon: 'error',
                            confirmButtonText: 'Đóng'
                        });
                        info.revert(); // Hoàn tác nếu xảy ra lỗi

                    }
                } //======================================
                  //Delete event
                else if (result.isDenied) {
                    // Người dùng nhấn "Xóa sự kiện"
                    const confirmDelete = await Swal.fire({
                        title: 'Bạn có chắc chắn?',
                        text: 'Hành động này không thể hoàn tác!',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Xóa',
                        cancelButtonText: 'Hủy'
                    });
                if (confirmDelete.isConfirmed) {
                    try {
                        const result = await removeBooking(info.event.id); // Gọi API xóa
                        if (result.success) {
                            Swal.fire({
                                title: 'Xóa thành công',
                                text: 'Sự kiện đã được xóa.',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            calendar.refetchEvents(); // Làm mới sự kiện trong FullCalendar
                        } else {
                            Swal.fire({
                                title: 'Lỗi',
                                text: result.message || 'Không thể xóa sự kiện.',
                                icon: 'error',
                                confirmButtonText: 'Đóng'
                            });
                        }
                    } catch (error) {
                        console.error('Lỗi khi xóa sự kiện:', error);
                        Swal.fire({
                            title: 'Lỗi',
                            text: 'Không thể xóa sự kiện. Hãy thử lại.',
                            icon: 'error',
                            confirmButtonText: 'Đóng'
                        });
                    }
                }
            }
        });



    },
        datesSet: function (info) {
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
        const currentView = info.view.type;
        const now = new Date();
        const currentDate = info.start;
        if(currentView === 'resourceTimeGridDay' || currentView === 'timeGridDay') {
            const timeGridEls = document.querySelectorAll('.fc-timegrid-slot');
            timeGridEls.forEach(slot => {
                const time = slot.getAttribute('data-time'); // Lấy thời gian từ slot
                if (time) {
                    const slotDateTime = new Date(currentDate);
                    const [hours, minutes] = time.split(':').map(Number);
                    slotDateTime.setHours(hours, minutes, 0, 0);

                    // Nếu slot nhỏ hơn thời gian hiện tại -> thêm màu xám
                    if (slotDateTime < now) {
                        slot.classList.add('fc-timegrid-slot-past');
                    } else {
                        slot.classList.remove('fc-timegrid-slot-past');
                    }
                }
            });
        }
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
        Swal.fire({
              title: 'Thành công',
              text: 'Bạn đã đặt lịch thành công!',
              icon: 'success',
              timer: 1500, // Tự động đóng sau 1.5 giây
              showConfirmButton: false
            });
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

function formatTime(date) {
    if (!date) return null;
    const hours = date.getHours().toString().padStart(2, '0'); // Đảm bảo luôn có 2 chữ số
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Đảm bảo luôn có 2 chữ số
    return `${hours}:${minutes}`;
}
function getDataFromEvent(event){
    let data = {};
    if (event){
        data = {
            booking_id: event.id || null, // Mặc định là null nếu không có id
            booking_name: event.title || "", // Giá trị mặc định
            start_time: formatTime(event.start), // Định dạng thành HH:mm
            end_time: formatTime(event.end),     // Định dạng thành HH:mm
            chairman: event.extendedProps.chairman || "", // Giá trị mặc định là chuỗi rỗng
            room_name: event._def.resourceIds && event._def.resourceIds.length > 0 ? event._def.resourceIds[0] : "", // Kiểm tra tài nguyên
            meeting_content: event.extendedProps.meeting_content || "", // Giá trị mặc định
            username: event.extendedProps.username || "", // Giá trị mặc định
            role: event.extendedProps.role || "" // Giá trị mặc định
        };
    }
    //console.log("data check: ",data);
    return data
}


async function updateBooking(bookingID, data) {
    try {
        const response = await fetch(`/api/booking/edit_booking/${bookingID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            //alert(result.message);
            //window.loadBookings();
            //window.hideForm();// Cập nhật thành công
            return { success: true, message: result.message }; // Thành công
        } else {
            alert(`Lỗi: ${result.message}`); // Thời gian trùng lặp hoặc lỗi khác
            return { success: false, message: result.message }; // Lỗi từ server
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật lịch họp:", error);
        alert("Có lỗi xảy ra khi gửi yêu cầu.");
        return { success: false, message: "Có lỗi xảy ra khi gửi yêu cầu." };
    }
}

async function editCalendar(info){
    const event = info.event;
    if(event) {
        //console.log(event);
        const data = getDataFromEvent(event)
        try {
            const result = await updateBooking(data.booking_id, data);
            if (!result.success) {
                console.warn("Edit failed, reverting changes...");
                Swal.fire({
                  title: 'Lỗi',
                  text: result.message || 'Edit lỗi! Hãy kiểm tra lại dữ liệu.',
                  icon: 'error',
                  confirmButtonText: 'Đóng'
                });
                info.revert();
            } else {
                //console.log("Edit successful:", data);
                Swal.fire({
                  title: 'Thành công',
                  text: 'Bạn đã sửa lịch thành công!',
                  icon: 'success',
                  timer: 750, // Tự động đóng sau 1.5 giây
                  showConfirmButton: false
                });
                calendar.refetchEvents();
            }

        } catch (error) {
            console.error("Error during edit:", error);
            Swal.fire({
                title: 'Lỗi mạng',
                text: 'Không thể kết nối tới server. Hãy thử lại sau.',
                icon: 'error',
                confirmButtonText: 'Đóng'
            });
            info.revert(); // Hoàn tác nếu xảy ra lỗi
        }
    }else{
         Swal.fire({
                title: 'Xảy ra sự cố',
                text: 'Không thể kết nối tới server. Hãy thử lại sau.',
                icon: 'error',
                confirmButtonText: 'Đóng'
            });
    }
}

async function getMeetings(){
    try {
        const response = await fetch('/api/booking/get_meetings');
        if (!response.ok) throw new Error("Có lỗi xảy ra khi gửi yêu cầu");
        return response.json()

    }catch (error) {
        console.error("Lỗi khi lấy lịch họp:", error);
        alert("Có lỗi xảy ra khi gửi yêu cầu.");
        return { success: false, message: "Có lỗi xảy ra khi gửi yêu cầu." };
    }
}

async function getDepartments(){
    try {
        const response = await fetch('api/booking/get_departments');
        if (!response.ok) throw new Error("Có lỗi xảy ra khi gửi yêu cầu");
        return response.json()

    }catch (error) {
        console.error("Lỗi khi lấy phòng ban:", error);
        alert("Có lỗi xảy ra khi gửi yêu cầu.");
        return { success: false, message: "Có lỗi xảy ra khi gửi yêu cầu." };
    }
}

async function removeBooking(bookingId) {
    try {
        const response = await fetch('/delete_booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ booking_id: bookingId })
        });

        if (!response.ok) throw new Error('Có lỗi xảy ra khi gửi yêu cầu');
        return await response.json(); // Trả về JSON từ server
    } catch (error) {
        console.error('Lỗi khi xóa event:', error);
        alert('Có lỗi xảy ra khi gửi yêu cầu.');
        return { success: false, message: 'Có lỗi xảy ra khi gửi yêu cầu.' };
    }
}