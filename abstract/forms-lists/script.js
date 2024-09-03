document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.querySelector('#color');
    const customSelectContainer = document.querySelector('.custom-select-container');
    const customSelect = document.querySelector('.custom-select');
    const customSelectOptions = document.querySelectorAll('.custom-select-option');
  
    // Toggle custom select options
    customSelect.addEventListener('click', () => {
      customSelect.classList.toggle('active');
    });
  
    // Update select value and close dropdown
    customSelectOptions.forEach(option => {
      option.addEventListener('click', () => {
        selectElement.value = option.textContent.toLowerCase();
        customSelect.textContent = option.textContent;
        customSelect.classList.remove('active');
      });
    });
  
    // Close custom dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!customSelectContainer.contains(e.target)) {
        customSelect.classList.remove('active');
      }
    });
  });
  