document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable');
    const canvas = document.getElementById('canvas');
    const addRowButton = document.getElementById('addRow');
    const addColumnButton = document.getElementById('addColumn');
    const imageUploadInput = document.getElementById('imageUpload');
  
    draggables.forEach(draggable => {
      draggable.addEventListener('dragstart', handleDragStart);
    });
  
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('drop', handleDrop);
  
    addRowButton.addEventListener('click', addRow);
    addColumnButton.addEventListener('click', addColumn);
  
    imageUploadInput.addEventListener('change', handleImageUpload);
  
    function handleDragStart(event) {
      event.dataTransfer.setData('elementType', event.target.dataset.type);
    }
  
    function handleDragOver(event) {
      event.preventDefault();
    }
  
    function handleDrop(event) {
      event.preventDefault();
      const type = event.dataTransfer.getData('elementType');
  
      if (event.target.classList.contains('grid-column') || event.target === canvas) {
        let newElement;
        
        // Determine which type of element to create
        switch (type) {
          case 'text':
            newElement = createTextElement();
            break;
          case 'image':
            newElement = createImageElement('https://via.placeholder.com/150');
            break;
          case 'container':
            newElement = createContainerElement();
            break;
          default:
            return; // If no valid type, exit the function
        }
  
        // Calculate the drop position relative to the target
        const offsetX = event.clientX - event.target.getBoundingClientRect().left;
        const offsetY = event.clientY - event.target.getBoundingClientRect().top;
        
        newElement.style.left = `${offsetX}px`;
        newElement.style.top = `${offsetY}px`;
        newElement.style.position = 'absolute';
  
        event.target.appendChild(newElement);
  
        makeElementDraggable(newElement);
      }
    }
  
    function handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const imgElement = createImageElement(e.target.result);
          canvas.appendChild(imgElement);
          makeElementDraggable(imgElement);
        };
        reader.readAsDataURL(file);
      }
    }
  
    function createTextElement() {
      const textElement = document.createElement('div');
      textElement.textContent = 'Double-click to edit';
      textElement.classList.add('draggable-element', 'editable');
      addResizeAndDelete(textElement);
      textElement.addEventListener('dblclick', makeEditable);
      return textElement;
    }
  
    function createImageElement(src) {
      const imageElement = document.createElement('div');
      const img = document.createElement('img');
      img.src = src;
      img.style.width = '150px';
      img.style.height = 'auto';
      imageElement.classList.add('draggable-element');
      imageElement.appendChild(img);
      addResizeAndDelete(imageElement);
      return imageElement;
    }
  
    function createContainerElement() {
      const containerElement = document.createElement('div');
      containerElement.textContent = 'Double-click to edit';
      containerElement.classList.add('draggable-element', 'editable');
      containerElement.style.width = '200px';
      containerElement.style.height = '100px';
      containerElement.style.backgroundColor = '#e0e0e0';
      addResizeAndDelete(containerElement);
      containerElement.addEventListener('dblclick', makeEditable);
      return containerElement;
    }
  
    function addResizeAndDelete(element) {
      const resizeHandle = document.createElement('div');
      resizeHandle.classList.add('resize-handle');
      element.appendChild(resizeHandle);
  
      const deleteButton = document.createElement('button');
      deleteButton.classList.add('delete-button');
      deleteButton.textContent = 'X';
      deleteButton.addEventListener('click', () => element.remove());
      element.appendChild(deleteButton);
  
      resizeHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
        const startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
  
        function doDrag(e) {
          element.style.width = `${startWidth + e.clientX - startX}px`;
          element.style.height = `${startHeight + e.clientY - startY}px`;
        }
  
        function stopDrag() {
          document.removeEventListener('mousemove', doDrag);
          document.removeEventListener('mouseup', stopDrag);
        }
  
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
      });
    }
  
    function addRow() {
      const row = document.createElement('div');
      row.classList.add('grid-row');
      row.setAttribute('draggable', 'true');
      row.addEventListener('dragstart', handleRowDragStart);
      row.addEventListener('dragover', handleRowDragOver);
      row.addEventListener('drop', handleRowDrop);
      row.addEventListener('dragend', handleRowDragEnd);
      canvas.appendChild(row);
    }
  
    function addColumn() {
      const rows = document.querySelectorAll('.grid-row');
      rows.forEach(row => {
        const column = document.createElement('div');
        column.classList.add('grid-column', 'dropzone');
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        row.appendChild(column);
      });
    }
  
    function handleRowDragStart(event) {
      event.dataTransfer.setData('text/plain', event.target.dataset.type);
      event.dataTransfer.effectAllowed = 'move';
      event.target.classList.add('dragging');
    }
  
    function handleRowDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const draggingRow = document.querySelector('.dragging');
      const rows = Array.from(document.querySelectorAll('.grid-row'));
      const afterRow = getDragAfterRow(rows, event.clientY);
      if (afterRow == null) {
        canvas.appendChild(draggingRow);
      } else {
        canvas.insertBefore(draggingRow, afterRow);
      }
    }
  
    function handleRowDrop(event) {
      event.preventDefault();
      const draggingRow = document.querySelector('.dragging');
      draggingRow.classList.remove('dragging');
    }
  
    function handleRowDragEnd(event) {
      event.target.classList.remove('dragging');
    }
  
    function getDragAfterRow(rows, y) {
      return rows.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
  
    function makeElementDraggable(element) {
      element.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const initialX = e.clientX - element.getBoundingClientRect().left;
        const initialY = e.clientY - element.getBoundingClientRect().top;
  
        function mouseMoveHandler(e) {
          element.style.position = 'absolute';
          element.style.left = `${e.clientX - initialX}px`;
          element.style.top = `${e.clientY - initialY}px`;
        }
  
        function mouseUpHandler() {
          document.removeEventListener('mousemove', mouseMoveHandler);
          document.removeEventListener('mouseup', mouseUpHandler);
        }
  
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      });
    }
  
    function makeEditable(event) {
      const element = event.target;
      element.setAttribute('contenteditable', 'true');
      element.focus();
  
      element.addEventListener('blur', () => {
        element.removeAttribute('contenteditable');
      });
  
      element.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          element.removeAttribute('contenteditable');
          element.blur();
        }
      });
    }
  });
  