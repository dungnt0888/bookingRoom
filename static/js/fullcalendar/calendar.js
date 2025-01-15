let roomColors = {
    'Phòng họp nhỏ lầu 1': '#FF5733',
    'Phòng họp dài lầu 1': '#33FF57',
    'Phòng họp lầu 2': '#e0f44f',
    'Phòng giải trí lầu 9': '#4ce1f3',
};

async function getRoomColor() {
    try {
        const response = await fetch('setting/get_color', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();

            if (data.length > 0) {
                // Nếu có dữ liệu từ server, cập nhật roomColors
                roomColors = data.reduce((acc, room) => {
                    acc[room.c_room] = room.c_color;
                    return acc;
                }, {});
                //console.log('Dữ liệu từ server:', roomColors);
            } else {
                console.warn('Không có dữ liệu từ server, sử dụng dữ liệu mặc định.');
            }
        } else {
            console.error('Lỗi khi lấy dữ liệu màu phòng:', response.statusText);
        }
    } catch (error) {
        console.error('Lỗi khi kết nối tới server:', error);
    }
}

let calendar;
let socket;
document.addEventListener('DOMContentLoaded',  async function () {
    socket = io();
    await getRoomColor();
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
    const isMobile = window.mobileCheck();

    //==================================================
    const calendarEl = document.getElementById('calendar')
    calendar = new FullCalendar.Calendar(calendarEl, {
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
        initialView: isMobile ? 'resourceTimeGridDay' : 'timeGridWeek', // Chế độ xem mặc định
        editable: true, // Cho phép kéo thả
        selectable: true, // Cho phép chọn vùng
        eventResizableFromStart: true, // Resize từ đầu
        allDaySlot: false, // Ẩn dòng All-day
        contentHeight: 'auto',
        slotMinTime: '07:00:00', // Bắt đầu hiển thị từ 7h sáng
        slotMaxTime: '20:00:00', // Kết thúc hiển thị vào 8h tối
        //plugins: [ 'resourceTimeGridPlugin' ], // Sử dụng plugin Premium
        resources: [ // Danh sách phòng họp
            {id: 'Phòng họp nhỏ lầu 1', title: 'Phòng họp nhỏ lầu 1'},
            {id: 'Phòng họp dài lầu 1', title: 'Phòng họp dài lầu 1'},
            {id: 'Phòng họp lầu 2', title: 'Phòng họp lầu 2'},
            {id: 'Phòng giải trí lầu 9', title: 'Phòng giải trí lầu 9'},
        ],
        headerToolbar: {
            left: 'prev,next today', // Các nút điều hướng
            center: 'title', // Tiêu đề
            right: isMobile ? 'resourceTimeGridDay' : 'resourceTimeGridDay,timeGridWeek,dayGridMonth,resourceTimelineDay,dayGridYear',
        },
        views: {
             dayGridMonth: {
                dayHeaderFormat: { weekday: 'short' }, // Hiển thị CN, T2, ...
                buttonText: 'Tháng',
            },
            timeGridWeek: {buttonText: 'Tuần'}, // Nút hiển thị là "Tuần"
            resourceTimeGridDay: {buttonText: 'Ngày'}, // Nút hiển thị là "Ngày"
            dayGridYear: {buttonText: 'Năm',
                        dayHeaderFormat: { weekday: 'short' },},
            resourceTimelineDay: {buttonText: 'Timeline'},

        },
        dateClick: function (info) {
            // Chuyển sang view ngày khi click vào ngày
            calendar.changeView('timeGridWeek', info.dateStr);
             // Highlight ngày được chọn
            const selectedCell = document.querySelector('.fc-daygrid-day[data-date="' + info.dateStr + '"]');
            if (selectedCell) {
                selectedCell.style.backgroundColor = '#b1dde3';
            }
        },

        eventAllow: function (dropInfo, draggedEvent) {
            // Kiểm tra nếu chế độ xem hiện tại là 'resourceTimeGridDay'
            const currentView = calendar.view.type;
            const username = draggedEvent.extendedProps.username;
            //console.log("current user ", username)
            if (currentView !== 'resourceTimeGridDay' && currentView !== "resourceTimelineDay") {
                return false; // Không cho chỉnh sửa nếu không phải chế độ ngày
            }
            if(username !== loggedInUser && loggedInUserRole !== "Administrator"){
                return false;
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
        selectAllow: function (selectInfo) {
            const currentView = calendar.view.type;
            const username = loggedInUser;

            // 1. Chỉ áp dụng trong chế độ ngày
            if (currentView !== 'resourceTimeGridDay' && currentView !== "resourceTimelineDay") {
                return false; // Không cho phép chọn
            }
            if(username === ''){
                return false;
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
        select: async function (info) {
            // Thời gian bắt đầu và kết thúc
            const currentView = calendar.view.type;
            //console.log("Current view type:", currentView);
            //console.log("Resources:", calendar.getResources());
            //console.log("Select Info:", info);
            if (currentView !== 'resourceTimeGridDay' || currentView === "resourceTimelineDay" || loggedInUser === '') {
                return; // Chỉ cho phép chọn trong chế độ Ngày
            }

            const result = await compareHolidays(info.start)
            if(result){
                return ; // Chặn chọn
            }
            //console.log(info.resource._resource.id);
            //console.log(info.start);
            //console.log(info.end);
            savingMeetingModal(info);

        },
        dayHeaderFormat: {weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'},
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
            return {start, end};
        },
        windowResize: function (view) {
            console.log("Window resized. Adjusting calendar...");
            calendar.updateSize(); // Tự động điều chỉnh kích thước lịch
        },
        hiddenDays: [0], // Ẩn Chủ Nhật (0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy)
        eventOverlap: false,
        events: {
            url: 'api/booking/get_bookings',
            failure: function () {
                Swal.fire({
                    title: 'Lỗi',
                    text: 'Không thể tải dữ liệu sự kiện!',
                    icon: 'error',
                    confirmButtonText: 'Đóng'
                });
            }
        },
        nowIndicator: true,
        timeZone: 'local',
        //======================================================
        // API endpoint để lấy dữ liệu
        eventDataTransform: function (eventData) {
            // Chuyển đổi định dạng ngày từ DD/MM/YYYY sang YYYY-MM-DD


            // Xử lý nếu sự kiện là ngày nghỉ lễ
            if (eventData.allDay && !eventData.start_time && !eventData.end_time) {
                return {
                    id: eventData.id || null,
                    title: eventData.title || "Holiday",
                    start: eventData.start,
                    allDay: true, // Đây là sự kiện cả ngày
                    backgroundColor: '#ec2727', // Màu nền cho ngày lễ
                    borderColor: '#ff0000', // Màu viền cho ngày lễ
                    textColor: '#000000', // Màu chữ
                    display: 'background',
                    extendedProps: {
                        isHoliday: true, // Đánh dấu đây là ngày lễ
                        description: eventData.description,
                    }
                };
            }
            const [day, month, year] = eventData.reservation_date.split('/');
            // Xử lý các sự kiện đặt phòng
            const color = roomColors[eventData.room_name] || '#3357FF'; // Màu mặc định
            let borderColor;
            if (new Date() < new Date(`${year}-${month}-${day}T${eventData.start_time}`)) {
                borderColor = '#c9e318'; // Sự kiện sắp diễn ra
            } else if (new Date() > new Date(`${year}-${month}-${day}T${eventData.end_time}`)) {
                borderColor = '#0ff451'; // Sự kiện đã kết thúc
            } else {
                borderColor = '#ffc107'; // Sự kiện đang diễn ra
            }

            const startDateTime = `${year}-${month}-${day}T${eventData.start_time}`;
            const endDateTime = `${year}-${month}-${day}T${eventData.end_time}`;

            return {
                id: eventData.booking_id,
                title: eventData.booking_name || "Không có tiêu đề",
                start: startDateTime,
                end: endDateTime,
                allDay: false, // Sự kiện không phải cả ngày
                backgroundColor: color, // Màu nền
                borderColor: borderColor, // Màu viền
                textColor: '#ffffff', // Màu chữ
                resourceId: eventData.room_name ? eventData.room_name.trim() : null,
                extendedProps: {
                    department: eventData.department,
                    chairman: eventData.chairman,
                    room_name: eventData.room_name,
                    meeting_content: eventData.meeting_content,
                    username: eventData.username,
                    role: eventData.role,
                    start_time: eventData.start_time,
                    end_time: eventData.end_time
                }
            };
        },
        //=============================================
        //Event Drop Kéo thả
        eventDrop: async function (info) {
            const currentView = info.view.type;
            if (currentView === "resourceTimeGridDay" || currentView === "resourceTimelineDay") {
                if (info) {
                    await editCalendar(info);
                }
            }
        },
        //=============================================
        // Resize event
        eventResize: async function (info) {
            const currentView = info.view.type;
            if (currentView === "resourceTimeGridDay" || currentView === "resourceTimelineDay") {
                if (info) {
                    await editCalendar(info);
                }
            }
        },
        resourceLabelDidMount: function (info) {
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
        eventClick: async function (info) {

            const isHoliday = info.event.extendedProps.isHoliday ? info.event.extendedProps.isHoliday : false;

            if (isHoliday){
                 Swal.fire({
                    title: "Thông báo ngày lễ",
                    text: `Ngày lễ: ${info.event.title}`,
                    icon: "info",
                    confirmButtonText: "Đóng"
                });
            }
            else {
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
                    showConfirmButton: eventStart >= now && (loggedInUserRole === 'Administrator' || props.username === loggedInUser), // Hiển thị nút "Xóa sự kiện" nếu sự kiện chưa bắt đầu
                    confirmButtonText: 'Lưu thay đổi',
                    cancelButtonText: 'Đóng',
                    denyButtonText: 'Xóa sự kiện',
                    showCancelButton: true,
                    showDenyButton: eventStart >= now && (loggedInUserRole === 'Administrator' || props.username === loggedInUser),
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

                        return {newChairman, newMeetingContent, newDepartment, newMeeting};
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
                                socket.emit('update_event', data);
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
                                    socket.emit('update_event', result);
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

            }
        },
        longPressDelay: 500,
        datesSet: function (info) {
            // Lắng nghe sự kiện click trên tiêu đề ngày B9F6C376
            setTimeout(() => {
                document.querySelectorAll('.fc-col-header-cell').forEach((headerCell) => {
                    headerCell.style.cursor = 'pointer'; // Thay đổi con trỏ chuột để chỉ định có thể click
                    headerCell.addEventListener('click', function () {
                        const dateStr = headerCell.getAttribute('data-date'); // Lấy ngày từ thuộc tính data-date
                        //console.log(headerCell);
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
                if (currentView === 'resourceTimeGridDay' || currentView === 'timeGridDay') {
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
        eventMouseEnter: function (info) {
            const isHolidays = info.event.extendedProps.isHoliday ? info.event.extendedProps.isHoliday : false;
            if(isHolidays){
                const holiday =  info.event.title || 'Không có thông tin';
                const description =  info.event.extendedProps.description || 'Không có thông tin';
                tippy(info.el, {
                    content: `
                        <div class="tooltip-content">
                            <h3>Ngày lễ: ${holiday}</h3>
                            <strong>${description}</strong>
                        </div>
                    `,
                    allowHTML: true,
                    placement: 'top'
                });
            }
            else {

                const username = info.event.extendedProps.username || 'Không có thông tin';
                const department = info.event.extendedProps.department || 'Không có thông tin';
                const chairman = info.event.extendedProps.chairman || 'Không có thông tin';

                tippy(info.el, {
                    content: `
                    <strong>Người đăng ký:</strong> ${username}<br>
                    <strong>Phòng ban:</strong> ${department}<br>
                    <strong>Người chủ trì:</strong> ${chairman}
                `,
                    allowHTML: true,
                    placement: 'top'
                });
            }
        },
    });


    calendar.render()
 // Lắng nghe sự kiện 'refresh_events'
    socket.on('refresh_events', function(data) {
        console.log("Refreshing events...");
        calendar.refetchEvents(); // Làm mới sự kiện
    });
});

window.hideForm = function () {
    const save_modal = document.getElementById("saving-modal");
    if (save_modal) save_modal.style.display = "none";

    const edit_modal = document.getElementById("edit-modal");
    if (edit_modal) edit_modal.style.display = "none";
};

function savingMeetingModal(info) {
    const rawDate = info.start; // Lưu giá trị Date gốc
    // Hiển thị ngày theo định dạng dd/mm/yyyy
    const day = String(rawDate.getDate()).padStart(2, '0');
    const month = String(rawDate.getMonth() + 1).padStart(2, '0');
    const year = rawDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`; // Định dạng dd/mm/yyyy
    const reservationDate = `${year}/${month}/${day}`

    const start = info.start;
    const end = info.end;
    const startTime = start.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
    const endTime = end.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
    const modal = document.getElementById("saving-modal");
    modal.style.display = "flex";
    document.getElementById("room-name").textContent = info.resource._resource.id;
    document.getElementById("time-range").textContent = startTime + ' - ' + endTime;
    document.getElementById("booking-date").textContent = formattedDate;
}

function resetModals(){
   document.getElementById("chairman").value = '';
   document.getElementById("department").value = '';
   document.getElementById("meetingContent").value = '';
   document.getElementById("booking_name").value = '';
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
                Swal.fire({
                    title: 'Error',
                    text: 'Lỗi khi đặt phòng: ' + failureResults
                        .map((f, i) => `Booking ${i + 1}: ${f.message}`)
                        .join('\n'),
                    icon: 'error',
                    confirmButtonText: 'Đóng'
                });
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
                //alert(`Failed to save booking: ${result.message}`);

            }
            return result;
        }
    } catch (error) {
        console.error("Error saving booking:", error);
        //alert(`Error saving booking: ${error.message}`);

        return {success: false, message: error.message};
    }
}

async function saveAPI(data) {
    try {
        const response = await fetch('/api/booking/submit_booking', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.booking_id) {
            return {success: true, booking_id: result.booking_id};
        } else {
            return {success: false, message: result.message || 'Unknown error'};
        }
    } catch (error) {
        return {success: false, message: error.message};
    }
}

document.getElementById("booking-form-content").addEventListener("submit", async function (event) {
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
    if (result.success) {
        hideForm();
        // Làm mới calendar
        Swal.fire({
            title: 'Thành công',
            text: 'Bạn đã đặt lịch thành công!',
            icon: 'success',
            timer: 1500, // Tự động đóng sau 1.5 giây
            showConfirmButton: false
        });

    } else {
        Swal.fire({
                    title: 'Error',
                    text: 'Lỗi khi đặt phòng: ' + result.message,
                    icon: 'error',
                    confirmButtonText: 'Đóng'
                });
    }
    resetModals();
    calendar.refetchEvents();

});

function getRemainingDaysInMonth(year, month, dayOfWeek, startDate) {
    const timeZone = 'Asia/Bangkok'; // Múi giờ GMT+7

    // Chuyển startDate thành thời gian trong múi giờ mong muốn
    const startDateInTZ = new Date(startDate.toLocaleString('en-US', {timeZone}));

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
        const dateInTZ = new Date(date.toLocaleString('en-US', {timeZone}));

        // Lấy thứ trong tuần của ngày hiện tại trong múi giờ mong muốn
        const dayName = dayFormatter.format(dateInTZ);
        const dayOfWeekInTZ = dayMap[dayName];

        if (dayOfWeekInTZ === dayOfWeek) {
            // Định dạng ngày theo múi giờ mong muốn
            const formattedDate = dateInTZ.toLocaleDateString("en-GB", {timeZone});
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

function getDataFromEvent(event) {
    let data = {};
    if (event) {
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
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            //alert(result.message);
            //window.loadBookings();
            //window.hideForm();// Cập nhật thành công
            return {success: true, message: result.message}; // Thành công
        } else {
            alert(`Lỗi: ${result.message}`); // Thời gian trùng lặp hoặc lỗi khác
            return {success: false, message: result.message}; // Lỗi từ server
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật lịch họp:", error);
        alert("Có lỗi xảy ra khi gửi yêu cầu.");
        return {success: false, message: "Có lỗi xảy ra khi gửi yêu cầu."};
    }
}

async function editCalendar(info) {
    const event = info.event;
    if (event) {
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
                socket.emit('update_event', data);
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
    } else {
        Swal.fire({
            title: 'Xảy ra sự cố',
            text: 'Không thể kết nối tới server. Hãy thử lại sau.',
            icon: 'error',
            confirmButtonText: 'Đóng'
        });
    }
}

async function getMeetings() {
    try {
        const response = await fetch('/api/booking/get_meetings');
        if (!response.ok) throw new Error("Có lỗi xảy ra khi gửi yêu cầu");
        return response.json()

    } catch (error) {
        console.error("Lỗi khi lấy lịch họp:", error);
        alert("Có lỗi xảy ra khi gửi yêu cầu.");
        return {success: false, message: "Có lỗi xảy ra khi gửi yêu cầu."};
    }
}

async function getDepartments() {
    try {
        const response = await fetch('api/booking/get_departments');
        if (!response.ok) throw new Error("Có lỗi xảy ra khi gửi yêu cầu");
        return response.json()

    } catch (error) {
        console.error("Lỗi khi lấy phòng ban:", error);
        alert("Có lỗi xảy ra khi gửi yêu cầu.");
        return {success: false, message: "Có lỗi xảy ra khi gửi yêu cầu."};
    }
}

async function removeBooking(bookingId) {
    try {
        const response = await fetch('/delete_booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({booking_id: bookingId})
        });

        if (!response.ok) throw new Error('Có lỗi xảy ra khi gửi yêu cầu');
        return await response.json(); // Trả về JSON từ server
    } catch (error) {
        console.error('Lỗi khi xóa event:', error);
        alert('Có lỗi xảy ra khi gửi yêu cầu.');
        return {success: false, message: 'Có lỗi xảy ra khi gửi yêu cầu.'};
    }
}

window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};


async function getHolidaysAPI(apiUrl = 'api/booking/get_holidays') {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }
        // Trả về dữ liệu JSON khi thành công
        const data = await response.json();
        return { success: true, data, message: "Tải danh sách ngày lễ thành công." };
    }catch (error){
        console.error("Lỗi khi lấy danh sách ngày lễ:", error);
        Swal.fire({
            title: "Lỗi",
            text: error.message || "Không thể tải danh sách ngày lễ. Vui lòng thử lại.",
            icon: "error",
            confirmButtonText: "Đóng"
        });
    }
}


async function listHolidays(){
    let data = []
    const result = await getHolidaysAPI();
    if (result.success) {
        data = result.data
        // Tiếp tục xử lý danh sách ngày lễ
    }
    return data
}


async function compareHolidays(start){
    const holidays = await listHolidays();
        for (let holiday of holidays) {
            const holidayDate = new Date(holiday.start); // Chuyển ngày lễ thành Date
            if (holidayDate.toISOString().split("T")[0] === start.toISOString().split("T")[0]) {
                // Hiển thị thông báo nếu trùng ngày lễ
                const [year, month, day] = holidayDate.toISOString().split("T")[0].split('-');
                Swal.fire({
                    title: "Không thể chọn ngày lễ!",
                    text: `Ngày ${day}/${month}/${year} là ngày lễ. Vui lòng chọn ngày khác.`,
                    icon: "warning",
                    confirmButtonText: "Đóng"
                });
                return true; // Chặn chọn
            }
        }
    return false
}

