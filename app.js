// Constants
const ROWS_PER_PAGE = 20;

const COLUMN_MAPPING = {
    'FULLNAME': 'Họ và tên',
    'DATEOFBIRTH': 'Ngày sinh',
    'GENDER': 'Giới tính',
    'NATIONALITY': 'Quốc tịch',
    'ETHNICITY': 'Dân tộc',
    'RELIGION': 'Tôn giáo',
    'WORKPLACE': 'Nơi làm việc',
    'PROFESSION': 'Nghề nghiệp',
    'DEGREE': 'Trình độ',
    'PROVINCE': 'Tỉnh/Thành phố',
    'ELECTORAL_DISTRICT': 'Đơn vị bầu cử',
    'GENERALEDUCATION': 'Giáo dục phổ thông',
    'FOREIGNLANGUAGE': 'Ngoại ngữ',
    'ACADEMICTITLE': 'Học hàm, Học vị',
    'POLITICALTHEORYLEVEL': 'Lý luận chính trị',
    'PROFESSIONALEXPERTISE': 'Trình độ chuyên môn',
    'CURRENTPOSITION': 'Chức vụ hiện nay',
    'PARTYJOININGDATE': 'Ngày vào Đảng',
    'NATIONALASSEMBLYDEPUTY': 'Đại biểu Quốc hội',
    'SOURCEURL': 'Nguồn tham khảo',
    'HOMETOWN': 'Quê quán',
    'CURRENTRESIDENCE': 'Nơi ở hiện nay'
};

// State Variables
let allData = [];
let filteredData = [];
let keys = [];
let currentPage = 1;

// DOM Elements
const fileInput = document.getElementById('excel-file');
const uploadStatus = document.getElementById('upload-status');
const uploadSection = document.getElementById('upload-section');
const dashboard = document.getElementById('dashboard');
const totalCountEl = document.getElementById('total-count');

const tableHead = document.getElementById('table-head');
const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search-input');
const paginationFooter = document.getElementById('pagination-footer');

const modal = document.getElementById('detail-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

// Event Listeners
fileInput.addEventListener('change', handleFileUpload);
searchInput.addEventListener('input', handleSearch);
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Auto load on start
window.addEventListener('DOMContentLoaded', loadDefaultExcel);

async function loadDefaultExcel() {
    uploadStatus.innerHTML = `<span style="color: var(--primary)"><i class="fa-solid fa-spinner fa-spin"></i> Đang tự động tải dữ liệu...</span>`;
    try {
        const response = await fetch('Danh sach chinh thuc.pdf');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const buffer = await response.arrayBuffer();
        await processPdfData(buffer);
    } catch (error) {
        console.warn("Không thể tải file tự động:", error);
        uploadStatus.innerHTML = `<span style="color: var(--primary)">Vui lòng chạy qua Local Server để tự động tải, hoặc chọn file thủ công.</span>`;
    }
}

// File Upload Handler
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    uploadStatus.innerHTML = `<span style="color: var(--primary)"><i class="fa-solid fa-spinner fa-spin"></i> Đang đọc file...</span>`;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            await processPdfData(e.target.result);
        } catch (error) {
            console.error(error);
            uploadStatus.innerHTML = `<span style="color: red"><i class="fa-solid fa-circle-exclamation"></i> Lỗi khi đọc file: ${error.message}</span>`;
        }
    };
    reader.readAsArrayBuffer(file);
}

async function processPdfData(arrayBuffer) {
    // Setup PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    
    try {
        const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        
        let allRows = [];
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            const items = textContent.items;
            
            // Group text items by Y coordinate (tolerance parameter for different line heights)
            const rowsObj = {};
            const Y_TOLERANCE = 5; 
            
            items.forEach(item => {
                const x = item.transform[4];
                const y = item.transform[5];
                
                let foundY = null;
                for (let keyY of Object.keys(rowsObj)) {
                    if (Math.abs(parseFloat(keyY) - y) < Y_TOLERANCE) {
                        foundY = keyY;
                        break;
                    }
                }
                
                if (foundY === null) {
                    foundY = y.toString();
                    rowsObj[foundY] = [];
                }
                
                rowsObj[foundY].push({
                    x: x,
                    text: item.str,
                    width: item.width
                });
            });
            
            // Sort rows descending by Y (PDF origin is bottom-left)
            const sortedYKeys = Object.keys(rowsObj).sort((a, b) => parseFloat(b) - parseFloat(a));
            
            for (let yKey of sortedYKeys) {
                // Sort items in row ascending by X
                const rowItems = rowsObj[yKey].sort((a, b) => a.x - b.x);
                let rowTexts = [];
                rowItems.forEach(item => {
                    const text = item.text.trim();
                    if (text) rowTexts.push(text);
                });
                if (rowTexts.length > 0) {
                    allRows.push(rowTexts);
                }
            }
        }
        
        if (allRows.length < 2) {
            throw new Error("Không tìm thấy đủ dữ liệu cấu trúc bảng từ văn bản PDF.");
        }
        
        // Assume first row is headers
        let headerRow = allRows[0];
        const headers = headerRow.map((h, i) => h || `Cột ${i + 1}`);
        
        const data = [];
        for (let i = 1; i < allRows.length; i++) {
            const rowArr = allRows[i];
            const rowData = {};
            let isEmptyRow = true;
            
            headers.forEach((header, index) => {
                const val = rowArr[index] || "";
                rowData[header] = val;
                if (val) isEmptyRow = false;
            });
            
            if (!isEmptyRow) {
                data.push(rowData);
            }
        }
        
        allData = data;
        
        if (allData.length > 0) {
            filteredData = [...allData];
            currentPage = 1;
            
            keys = Object.keys(allData[0]);
            
            uploadSection.style.display = 'none';
            dashboard.style.display = 'block';
            totalCountEl.textContent = allData.length;
            
            renderTableHeaders();
            renderTableBody();
            renderPagination();
            
        } else {
            throw new Error("Tệp PDF này không chứa nội dung phân tích (có thể là ảnh scan).");
        }
    } catch (error) {
        throw error;
    }
}

// Render Table Headers
function renderTableHeaders() {
    tableHead.innerHTML = '<th class="col-stt">STT</th>';
    
    // Select maximum 6 columns to not overflow
    const displayKeys = keys.slice(0, 6); 
    
    displayKeys.forEach(key => {
        const th = document.createElement('th');
        const lookupKey = typeof key === 'string' ? key.trim().toUpperCase() : key;
        th.textContent = COLUMN_MAPPING[lookupKey] || key;
        tableHead.appendChild(th);
    });
}

// Render Table Body
function renderTableBody() {
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="${Math.min(keys.length + 1, 7)}" style="text-align:center; padding: 2rem; color: #64748b;">Không tìm thấy kết quả phù hợp.</td></tr>`;
        return;
    }

    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = Math.min(startIndex + ROWS_PER_PAGE, filteredData.length);
    const displayKeys = keys.slice(0, 6);
    
    for (let i = startIndex; i < endIndex; i++) {
        const rowData = filteredData[i];
        const tr = document.createElement('tr');
        
        // Setup row click
        tr.onclick = () => showModal(rowData);
        
        // STT Column
        const tdIndex = document.createElement('td');
        tdIndex.className = 'col-stt';
        tdIndex.textContent = i + 1;
        tr.appendChild(tdIndex);
        
        // Data Columns
        displayKeys.forEach(key => {
            const td = document.createElement('td');
            const value = rowData[key] || '';
            // Trim long texts in table view
            td.textContent = value.length > 80 ? value.substring(0, 80) + '...' : value;
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    }
}

// Pagination logic
function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
    
    paginationFooter.innerHTML = `
        <div class="page-info">Hiển thị ${(currentPage - 1) * ROWS_PER_PAGE + 1} - ${Math.min(currentPage * ROWS_PER_PAGE, filteredData.length)} trên tổng số ${filteredData.length} đại biểu</div>
        <div class="page-controls">
            <button class="page-btn" id="prev-btn" ${currentPage === 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i> Trước</button>
            <button class="page-btn" id="next-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>Sau <i class="fa-solid fa-chevron-right"></i></button>
        </div>
    `;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTableBody();
                renderPagination();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTableBody();
                renderPagination();
            }
        });
    }
}

// Search Logic
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query === '') {
        filteredData = [...allData];
    } else {
        filteredData = allData.filter(item => {
            return keys.some(key => {
                const val = item[key];
                return val && String(val).toLowerCase().includes(query);
            });
        });
    }
    
    currentPage = 1;
    renderTableBody();
    renderPagination();
}

// Modal Logic
function showModal(data) {
    modalBody.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = 'detail-grid';
    
    keys.forEach(key => {
        const value = data[key];
        if (value !== undefined && value !== null && value !== '') {
            const item = document.createElement('div');
            item.className = 'detail-item';
            
            const label = document.createElement('div');
            label.className = 'detail-label';
            const lookupKey = typeof key === 'string' ? key.trim().toUpperCase() : key;
            label.textContent = COLUMN_MAPPING[lookupKey] || key;
            
            const val = document.createElement('div');
            val.className = 'detail-value';
            val.textContent = value;
            
            item.appendChild(label);
            item.appendChild(val);
            grid.appendChild(item);
        }
    });
    
    modalBody.appendChild(grid);
    
    modal.style.display = 'block';
    // Small delay to allow CSS transition to work seamlessly
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        modalBody.innerHTML = ''; // Clean up memory
    }, 300);
}
