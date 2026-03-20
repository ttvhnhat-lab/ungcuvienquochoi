// Constants
const ROWS_PER_PAGE = 20;

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

// File Upload Handler
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    uploadStatus.innerHTML = `<span style="color: var(--primary)"><i class="fa-solid fa-spinner fa-spin"></i> Đang đọc file...</span>`;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            
            // Get first worksheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            allData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" });
            
            if (allData.length > 0) {
                // Initialize State
                filteredData = [...allData];
                currentPage = 1;
                
                // Determine Columns
                keys = Object.keys(allData[0]);
                
                // Setup UI
                uploadSection.style.display = 'none';
                dashboard.style.display = 'block';
                totalCountEl.textContent = allData.length;
                
                // Render Table
                renderTableHeaders();
                renderTableBody();
                renderPagination();
                
            } else {
                throw new Error("File Excel không có dữ liệu.");
            }
        } catch (error) {
            console.error(error);
            uploadStatus.innerHTML = `<span style="color: red"><i class="fa-solid fa-circle-exclamation"></i> Lỗi khi đọc file: ${error.message}</span>`;
        }
    };
    reader.readAsArrayBuffer(file);
}

// Render Table Headers
function renderTableHeaders() {
    tableHead.innerHTML = '<th class="col-stt">STT</th>';
    
    // Select maximum 6 columns to not overflow
    const displayKeys = keys.slice(0, 6); 
    
    displayKeys.forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
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
            label.textContent = key;
            
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
