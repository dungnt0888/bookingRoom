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

// Đóng popup
function closePopup() {
    const userPopup = document.getElementById('userFormPopup');
    const meetingPopup = document.getElementById('meetingFormPopup');

    // Hide the user form popup if it exists
    if (userPopup.style.display !== 'none') {
        userPopup.style.display = 'none';
    }

    // Hide the meeting form popup if it exists
    if (meetingPopup.style.display !== 'none') {
        meetingPopup.style.display = 'none';
    }
}

// Gửi form
function submitUserForm() {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);

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
function toggleStatusDeleted(bookingId, currentStatus) {
    const newStatus = !currentStatus; // Đảo trạng thái hiện tại

    fetch(`/user/update_booking_status/${bookingId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDeleted: newStatus }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            //alert(`Status updated to ${newStatus ? 'True' : 'False'}`);
            window.location.reload(); // Reload lại trang để cập nhật giao diện
        } else {
            alert(`Failed to update status: ${data.error}`);
        }
    })
    .catch(error => {
        console.error('Error updating status:', error);
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