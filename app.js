let allHeroes = []; // This will hold the fetched hero data
let filteredHeroes = []; // This will hold the filtered hero data (after search)
let currentPage = 1; // Track the current page
let currentHeroes = []; // Will hold the data currently being paginated (filtered or all)
const pageSize = 20; // Number of heroes per page
let sortOrder = {}; // Track the sort order for each column

// Fetch the data and display the default view
fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
  .then(response => response.json())
  .then(heroes => {
    allHeroes = heroes;
    currentHeroes = allHeroes; // Set the initial dataset to all heroes
    displayHeroes(currentHeroes, currentPage, pageSize); // Display heroes with pagination
  });

// Helper to extract numeric values from strings (e.g., "6'8 / 203 cm" and "980 lb / 441 kg")
function extractNumber(value) {
  if (!value) return null;
  const parts = value.split(' / ');
  const lastPart = parts[parts.length - 1].trim();
  const num = parseFloat(lastPart);
  return isNaN(num) ? null : num;
}

// Real-time advanced search functionality
document.getElementById('advanced-search').addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  const searchField = document.getElementById('search-field').value;
  const operator = document.getElementById('search-operator').value;

  filteredHeroes = allHeroes.filter(hero => {
    const fieldValue = getFieldByPath(hero, searchField);
    if (!fieldValue) return false;

    // Handle numeric search for powerstats and appearance
    if (searchField.includes('powerstats') || searchField.includes('appearance')) {
      const numericValue = extractNumber(fieldValue.toString());
      if (numericValue === null || isNaN(parseFloat(searchTerm))) return false;
      const searchNumber = parseFloat(searchTerm);
      switch (operator) {
        case 'equal':
          return numericValue === searchNumber;
        case 'notEqual':
          return numericValue !== searchNumber;
        case 'greaterThan':
          return numericValue > searchNumber;
        case 'lesserThan':
          return numericValue < searchNumber;
        default:
          return false;
      }
    }

    // Handle text-based search
    switch (operator) {
      case 'include':
        return fieldValue.toLowerCase().includes(searchTerm);
      case 'exclude':
        return !fieldValue.toLowerCase().includes(searchTerm);
      default:
        return false;
    }
  });

  currentHeroes = filteredHeroes; // Set the current dataset to the filtered result
  currentPage = 1; // Reset to first page on new search
  displayHeroes(currentHeroes, currentPage, pageSize); // Display filtered heroes with pagination
});

// Function to display heroes in the table
function displayHeroes(heroes, page = 1, pageSize = 20) {
  const tbody = document.getElementById('hero-tbody');
  tbody.innerHTML = '';

  const start = (page - 1) * pageSize;
  const end = pageSize === 'all' ? heroes.length : start + pageSize;
  const pageHeroes = heroes.slice(start, end);

  pageHeroes.forEach(hero => {
    const row = document.createElement('tr');
    row.addEventListener('click', () => showHeroDetails(hero));

    const iconCell = document.createElement('td');
    const img = document.createElement('img');
    img.src = hero.images.xs;
    img.alt = hero.name;
    iconCell.appendChild(img);
    row.appendChild(iconCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = hero.name;
    row.appendChild(nameCell);

    const fullNameCell = document.createElement('td');
    fullNameCell.textContent = hero.biography.fullName || 'N/A';
    row.appendChild(fullNameCell);

    const intelligenceCell = document.createElement('td');
    intelligenceCell.textContent = hero.powerstats.intelligence;
    row.appendChild(intelligenceCell);

    const strengthCell = document.createElement('td');
    strengthCell.textContent = hero.powerstats.strength;
    row.appendChild(strengthCell);

    const speedCell = document.createElement('td');
    speedCell.textContent = hero.powerstats.speed;
    row.appendChild(speedCell);

    const genderCell = document.createElement('td');
    genderCell.textContent = hero.appearance.gender;
    row.appendChild(genderCell);

    const raceCell = document.createElement('td');
    raceCell.textContent = hero.appearance.race || 'N/A';
    row.appendChild(raceCell);

    const heightCell = document.createElement('td');
    heightCell.textContent = hero.appearance.height.join(' / ');
    row.appendChild(heightCell);

    const weightCell = document.createElement('td');
    weightCell.textContent = hero.appearance.weight.join(' / ');
    row.appendChild(weightCell);

    const placeOfBirthCell = document.createElement('td');
    placeOfBirthCell.textContent = hero.biography.placeOfBirth || 'Unknown';
    row.appendChild(placeOfBirthCell);

    const alignmentCell = document.createElement('td');
    alignmentCell.textContent = hero.biography.alignment;
    row.appendChild(alignmentCell);

    tbody.appendChild(row);
  });

  setupPagination(heroes.length, page, pageSize); // Update pagination
}

// Helper function to access nested fields (e.g., 'powerstats.intelligence')
function getFieldByPath(obj, path) {
  return path.split('.').reduce((o, p) => o ? o[p] : undefined, obj);
}

// Show detailed view of the hero in a popup
function showHeroDetails(hero) {
  const popup = document.createElement('div');
  popup.className = 'hero-popup';
  popup.innerHTML = `
    <div class="hero-popup-content">
      <h2>${hero.name} (Full Name: ${hero.biography.fullName || 'N/A'})</h2>
      <img src="${hero.images.lg}" alt="${hero.name}">
      <p><strong>Place of Birth:</strong> ${hero.biography.placeOfBirth || 'Unknown'}</p>
      <p><strong>Alignment:</strong> ${hero.biography.alignment}</p>
      <p><strong>Intelligence:</strong> ${hero.powerstats.intelligence}</p>
      <p><strong>Strength:</strong> ${hero.powerstats.strength}</p>
      <p><strong>Speed:</strong> ${hero.powerstats.speed}</p>
      <p><strong>Height:</strong> ${hero.appearance.height.join(' / ')}</p>
      <p><strong>Weight:</strong> ${hero.appearance.weight.join(' / ')}</p>
    </div>
  `;
  document.body.appendChild(popup);

  // Close popup when clicking outside
  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      closePopup();
    }
  });
}

// Function to close the popup
function closePopup() {
  const popup = document.querySelector('.hero-popup');
  if (popup) {
    document.body.removeChild(popup);
  }
}

// Function to set up pagination buttons
function setupPagination(totalItems, currentPage, pageSize) {
  const paginationControls = document.querySelector('.pagination-controls');
  paginationControls.innerHTML = ''; // Clear existing buttons

  const totalPages = Math.ceil(totalItems / pageSize);

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.classList.toggle('active', i === currentPage);
    button.addEventListener('click', () => {
      currentPage = i; // Update current page
      displayHeroes(currentHeroes, currentPage, pageSize); // Display the heroes (either filtered or all)
    });
    paginationControls.appendChild(button);
  }
}

// Function to sort heroes based on column
function sortHeroes(column) {
  // Determine sort order for the column
  const order = sortOrder[column] === 'asc' ? 'desc' : 'asc';
  sortOrder[column] = order; // Update sort order for this column

  currentHeroes.sort((a, b) => {
    const aValue = getFieldByPath(a, column);
    const bValue = getFieldByPath(b, column);
    
    // Handle numeric sorting for powerstats and appearance
    if (typeof aValue === 'string' && aValue.includes('/')) {
      return order === 'asc' ? extractNumber(aValue) - extractNumber(bValue) : extractNumber(bValue) - extractNumber(aValue);
    } else if (typeof aValue === 'string') {
      return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  // Reset to the first page after sorting
  currentPage = 1;
  displayHeroes(currentHeroes, currentPage, pageSize); // Display sorted heroes
}

// Add click event listeners to table headers for sorting
document.querySelectorAll('th').forEach(header => {
  header.addEventListener('click', () => {
    const column = header.dataset.column; // Assuming each <th> has a data-column attribute
    if (column) {
      sortHeroes(column);
    }
  });
});
