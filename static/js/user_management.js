function togglePassword(userId) {
    const passwordField = document.getElementById(`password-${userId}`);
    if (passwordField.type === "password") {
        passwordField.type = "text";
    } else {
        passwordField.type = "password";
    }
}

function hidePassword(userId) {
    const passwordField = document.getElementById(`password-${userId}`);
    passwordField.type = "password";
}

function saveUser(userId) {
    // Thu thập dữ liệu từ các trường input
    const firstname = document.getElementById(`firstname-${userId}`).value;
    const lastname = document.getElementById(`lastname-${userId}`).value;
    const email = document.getElementById(`email-${userId}`).value;
    const role = document.getElementById(`role-${userId}`).value;
    const password = document.getElementById(`password-${userId}`).value;

    // Gửi dữ liệu đến server qua fetch
    fetch(`/user/update_user/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstname: firstname,
            lastname: lastname,
            email: email,
            role: role,
            password: password,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('User updated successfully');
            window.location.reload();
        } else {
            alert('Failed to update user');
        }
    })
    .catch(error => {
        console.error('Error updating user:', error);
        alert('An error occurred while updating the user');
    });
}


function toggleStatus(userId, currentStatus) {
    // Xác định trạng thái mới
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    // Gửi yêu cầu thay đổi trạng thái tới server
    fetch(`/user/update_status/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Cập nhật giao diện
            const statusButton = document.getElementById(`status-btn-${userId}`);
            statusButton.textContent = newStatus;
            statusButton.style.backgroundColor = newStatus === 'Active' ? 'green' : 'red';
            window.location.reload();
            //alert(`User status updated to ${newStatus}`);
        } else {
            alert(`Failed to update status: ${data.error}`);
        }
    })
    .catch(error => {
        console.error('Error updating status:', error);
        alert('An error occurred while updating the status');
    });
}

document.getElementById('addUserBtn').addEventListener('click', function() {
    const popup = document.getElementById('userFormPopup');
    popup.style.display = 'block';
});

document.getElementById('addMeetingBtn').addEventListener('click', function() {
    const popup = document.getElementById('meetingFormPopup');
    popup.style.display = 'block';
});

document.getElementById('addDepartmentBtn').addEventListener('click', function() {
    const popup = document.getElementById('departmentFormPopup');
    popup.style.display = 'block';
});

// Đóng popup
function closePopup() {
    const userPopup = document.getElementById('userFormPopup');
    const meetingPopup = document.getElementById('meetingFormPopup');
    const departmentPopup = document.getElementById('departmentFormPopup');

    // Hide the user form popup if it exists
    if (userPopup.style.display !== 'none') {
        userPopup.style.display = 'none';
    }

    // Hide the meeting form popup if it exists
    if (meetingPopup.style.display !== 'none') {
        meetingPopup.style.display = 'none';
    }
    if (departmentPopup.style.display !== 'none') {
        departmentPopup.style.display = 'none';
    }
}

// Gửi form
function submitUserForm(){
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);
    if(!form.checkValidity()){
        alert("Please fill out all required fields correctly.");
        return
    }
    fetch('/user/add_user', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('User added successfully');
            closePopup(); // Đóng popup sau khi thêm thành công
            window.location.reload(); // Reload lại trang
        } else {
            alert(`Failed to add user: ${data.error}`);
        }
    })
    .catch(error => {
        console.error('Error adding user:', error);
        alert('An error occurred while adding the user');
    });
}

// Toggle status
function toggleStatusDeleted(bookingId, currentStatus, loggedInUser) {
    const newStatus = !currentStatus; // Đảo trạng thái hiện tại

    if (!loggedInUser) {
        console.error('User not logged in!');
        alert('Cannot update status: User not logged in.');
        return;
    }

    fetch(`/user/update_booking_status/${bookingId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDeleted: newStatus, loggedInUser }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Cập nhật giao diện mà không cần reload trang
            window.location.reload(); // Reload lại trang để cập nhật giao diện
            /*const buttonElement = document.querySelector(`#toggle-btn-${bookingId}`);
            if (buttonElement) {
                buttonElement.textContent = newStatus ? 'True' : 'False';
                buttonElement.style.backgroundColor = newStatus ? 'red' : 'green';
            }*/
        } else {
            console.warn(`Failed to update booking ID ${bookingId}: ${data.error}`);
            alert(`Failed to update status: ${data.error}`);
        }
    })
    .catch(error => {
        console.error(`Error updating booking ID ${bookingId} with new status ${newStatus}:`, error);
        alert('Error updating status. Please try again later.');
    });
}



function submitMeetingForm() {
    // Prevent the default form submission
    //event.preventDefault();

    const form = document.getElementById('meetingForm');
    const formDataMeeting = new FormData(form);

    // Disable the Save button to prevent multiple submissions
    const saveButton = form.querySelector('.btn');
    console.log(formDataMeeting);
    //return
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    fetch('/user/add_meeting', {
        method: 'POST',
        body: formDataMeeting,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Meeting added successfully');
                closePopup(); // Close the popup
                window.location.reload(); // Reload the page to reflect changes
            } else {
                alert(`Failed to add meeting: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Error adding meeting:', error);
            alert('An error occurred while adding the meeting');
        })
        .finally(() => {
            // Re-enable the Save button
            saveButton.disabled = false;
            saveButton.textContent = 'Save';
        });
}



function toggleMeetingStatus(id, status) {
    const newStatus = status === true ? false : true;

    fetch(`/user/update_meeting_status/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Cập nhật giao diện
                const statusButton = document.getElementById(`meeting-status-btn-${id}`);
                statusButton.textContent = newStatus ? 'Active' : 'Inactive';
                statusButton.style.backgroundColor = newStatus ? 'green' : 'red';
                window.location.reload();
            } else {
                alert(`Failed to update status: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Error updating status:', error);
            alert('An error occurred while updating the status');
        });
}


function saveMeeting(id) {
    // Thu thập dữ liệu từ các trường input
    const description = document.getElementById(`description-${id}`).value;


    // Gửi dữ liệu đến server qua fetch
    fetch(`/user/update_meeting/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description: description,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Meeting updated successfully');
            window.location.reload();
        } else {
            alert('Failed to update meeting');
        }
    })
    .catch(error => {
        console.error('Error updating meeting:', error);
        alert('An error occurred while updating the meeting');
    });
}

function searchBooking() {
    const srcDate = document.getElementById('txtSrcBox').value;
    const urlParams = new URLSearchParams(window.location.search); // Lấy query string hiện tại
    urlParams.set('search', srcDate); // Cập nhật giá trị 'search'
    urlParams.set('booking_page', '1'); // Quay lại trang đầu tiên khi tìm kiếm
    window.location.search = urlParams.toString(); // Điều hướng với query string mới
}

document.addEventListener('DOMContentLoaded', function () {
    const calendarInput = document.getElementById('txtSrcBox'); // Ô tìm kiếm
    const calendarButton = document.getElementById('btnCalendar'); // Nút 📅

    // Tạo Flatpickr nhưng không tự động mở với input
    const calendarPicker = flatpickr(calendarInput, {
        dateFormat: "d/m/Y", // Định dạng ngày
        allowInput: true, // Cho phép nhập thủ công
        clickOpens: true, // Vô hiệu hóa tự động mở khi nhấn vào ô input
    });

    // Mở bảng chọn ngày khi nhấn nút 📅
    calendarButton.addEventListener('click', function () {
        calendarPicker.open();
    });
});

function openTab(evt, tabName) {
    // Hide all tab contents
    let tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove 'active' class from all tab links
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab and add 'active' class to the clicked button
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    // Save selected tab to localStorage
    localStorage.setItem('selectedTab', tabName);
}

// Set default tab to be displayed on page load
document.addEventListener("DOMContentLoaded", function() {
    // Get the last selected tab from localStorage, if available
    let selectedTab = localStorage.getItem('selectedTab');
    console.log(selectedTab);
    if (selectedTab) {
        document.querySelector(`button[onclick="openTab(event, '${selectedTab}')"]`).click();
    } else {
        // If no tab is selected, click the first one
        document.getElementsByClassName("tablinks")[0].click();
    }
});

function updateStatus(bookingId, newStatus, user) {
    console.log('Booking ID:', bookingId);
    console.log('Status: ', newStatus);
    document.getElementById('user-approved-'+bookingId).textContent  = user;
}

document.getElementById("departmentForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const departmentName = document.getElementById("departmentName").value.trim();
    if (!departmentName) {
        alert("Please enter a department name.");
        return;
    }

    try {
        const response = await fetch("/user/add_department", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: departmentName }),
        });

        const result = await response.json();

        if (response.status === 201) {
            alert(result.message);
            window.location.reload();
        } else if (response.status === 409) {
            alert("Department already exists!");
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to add department. Please try again.");
    }
});

async function saveDepartment(id) {
    // Thu thập dữ liệu từ các trường input
    const department = document.getElementById(`department-name-${id}`).value.trim();

    // Validation dữ liệu trước khi gửi
    if (!department) {
        alert('Department name cannot be empty.');
        return;
    }

    try {
        // Gửi dữ liệu đến server
        const response = await fetch(`/user/update_department/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: department,
            }),
        });

        // Chuyển đổi phản hồi thành JSON
        const data = await response.json();

        // Xử lý kết quả từ server
        if (response.ok && data.success) {
            alert('Department updated successfully');
            window.location.reload(); // Reload lại trang sau khi cập nhật thành công
        } else {
            alert(`Failed to update department: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        // Xử lý lỗi kết nối hoặc lỗi không mong muốn
        console.error('Error updating department:', error);
        alert('An unexpected error occurred while updating the department.');
    }
}

function deleteDepartment(departmentId) {
    if (confirm("Bạn có muốn xóa phòng ban này không?")) {
        fetch(`/user/delete_department/${departmentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                // Xóa dòng tương ứng hoặc refresh trang
                location.reload();
            } else {
                alert(`Error: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete department.');
        });
    }
}