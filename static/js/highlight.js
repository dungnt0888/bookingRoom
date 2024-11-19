// highlight.js
document.addEventListener('DOMContentLoaded', function () {
    let isDragging = false;
    let activeColumn = null;
    const selectedCells = [];

    function isLunchBreakRow(cell) {
        return cell.parentElement.classList.contains("time-break");
    }

    function isBooked(cell) {
        return cell.parentElement.classList.contains("booked");
    }

    function toggleCellHighlight(cell) {
        const column = cell.cellIndex;
        if (cell.classList.contains('booked')){
            if(cell.classList.contains('department')){
                console.log("Clicked on department:", event.target);
            }
            return;
        }
        if (cell.classList.contains('highlighted')) {
            cell.classList.remove('highlighted');
            const index = selectedCells.indexOf(cell);
            if (index > -1) selectedCells.splice(index, 1);
        } else {
            cell.classList.add('highlighted');
            selectedCells.push(cell);
        }

        checkAndClearColumn(column);

        // Kiểm tra và disable/enable các cột khác dựa trên selectedCells
        if (selectedCells.length > 0) {
            disableOtherColumns(column);
        } else {
            enableAllColumns();
        }
    }

    function checkAndClearColumn(column) {
        const cells = Array.from(document.querySelectorAll(`.schedule-table tbody tr td:nth-child(${column + 1})`));
        const selectedCellsInColumn = cells.filter(cell => cell.classList.contains('highlighted'));

        if (selectedCellsInColumn.length < 2) return;

        let start = cells.indexOf(selectedCellsInColumn[0]);
        let end = cells.indexOf(selectedCellsInColumn[selectedCellsInColumn.length - 1]);

        for (let i = start; i <= end; i++) {
            if (!cells[i].classList.contains('highlighted')) {
                cells.forEach(cell => cell.classList.remove('highlighted'));
                selectedCells.length = 0;
                enableAllColumns(); // Enable all columns if clearing selection
                break;
            }
        }
    }

    function startHighlight(cell, event) {
        if (event.button !== 0 || isBooked(cell) || isLunchBreakRow(cell) || cell.cellIndex === 0) return;

        isDragging = true;
        activeColumn = cell.cellIndex;
        toggleCellHighlight(cell);

        if (typeof window.toggleBookRoomButton === 'function') {
            window.toggleBookRoomButton();
        }
    }

    function dragHighlight(cell) {
        if (!isDragging || cell.cellIndex !== activeColumn || cell.cellIndex === 0) return;

        if (isLunchBreakRow(cell) || isBooked(cell)) {
            isDragging = false;
            return;
        }

        if (!cell.classList.contains('highlighted')) {
            cell.classList.add('highlighted');
            selectedCells.push(cell);
            checkAndClearColumn(cell.cellIndex);
        }
    }

    document.addEventListener('mouseup', function () {
        isDragging = false;
        activeColumn = null;
    });

    document.querySelectorAll('.schedule-table td').forEach(cell => {
        if (cell.cellIndex > 0) {
            cell.addEventListener('mousedown', function (event) {
                event.preventDefault();
                startHighlight(cell, event);
            });

            cell.addEventListener('mouseover', function () {
                dragHighlight(cell);
            });
        }
    });

    // Disable all columns except the specified column, ignoring columns with 'inactive'
    function disableOtherColumns(selectedColumnIndex) {
        const allColumns = document.querySelectorAll('.schedule-table thead th');

        allColumns.forEach((column, index) => {
            if (index !== selectedColumnIndex && !column.classList.contains('inactive')) {
                column.classList.add('tmpDisable');
                const columnCells = document.querySelectorAll(`.schedule-table tbody tr td:nth-child(${index + 1})`);
                columnCells.forEach(cell => cell.classList.add('tmpDisable'));
            }
        });
    }

    // Enable all columns by removing the 'tmpDisable' models
    function enableAllColumns() {
        const disabledElements = document.querySelectorAll('.tmpDisable');
        disabledElements.forEach(element => element.classList.remove('tmpDisable'));
    }

    window.enableAllColumns = enableAllColumns;

    window.clearSelectedCells = function() {
        selectedCells.length = 0;
    };

    window.getSelectedCells = function() {
        return selectedCells;
    };
});

function closePopup() {
        // Tìm popup và xóa nó khỏi DOM
        const popup = document.querySelector('.popup');
        if (popup) {
            popup.remove();  // Xóa popup khỏi DOM
        }
    }