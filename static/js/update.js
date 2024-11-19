document.body.addEventListener("click", function (event) {
    // Nếu event.target là .department hoặc nằm trong .department
    if (event.target.classList.contains("department") || event.target.closest(".department")) {
        const departmentElement = event.target.closest(".department") || event.target; // Lấy phần tử .department
        //console.log("Clicked on department or inside department:", departmentElement);
        //openEditForm(departmentElement); // Gọi hàm chỉnh sửa với phần tử .department
        if(departmentElement){
            const bookingContent = departmentElement.closest(".booking-content");
            if(bookingContent){
                // Lấy giá trị `data-id` từ `.booking-content`
                const bookingId = bookingContent.getAttribute("data-id");
                openEditForm(bookingId)
                //console.log("Booking ID:", bookingId);
            }
        }
        event.stopPropagation(); // Ngăn sự kiện lan đến các thành phần cha
        return;
    }
});


function openEditForm(bookingId) {
    // Lấy thông tin hiện tại từ departmentElement và các dữ liệu liên quan
    //const tdElement = departmentElement.closest('td'); // Tìm `td` chứa `.department`

    // Phần tử chứa tất cả thông tin booking
    //const bookingContent = departmentElement.closest('.booking-content');
    //const department = departmentElement.textContent.trim(); // Lấy text từ .department
    //const bookingName = bookingContent.querySelector('div strong:contains("Cuộc họp:")').nextSibling?.textContent.trim() || '';
    //const chairman = bookingContent.querySelector('div strong:contains("Chủ trì:")').nextSibling?.textContent.trim() || '';
    //const meetingContent = bookingContent.querySelector('div strong:contains("Nội dung:")').nextSibling?.textContent.trim() || '';
    //console.log(bookingContent);
    const bookingElements = document.querySelectorAll(`div[data-id^="${bookingId}"]`);

    if (bookingElements.length === 0) {
        console.error(`Không tìm thấy phần tử nào với data-id bắt đầu bằng: ${bookingId}`);
        return;
    }
    console.log(bookingElements);
    //console.log(`Found ${bookingElements.length} elements with data-id starting with: ${bookingId}`);


}