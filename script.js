const gridElement = document.getElementById('grid');
const joystick = document.getElementById('joystick');
const circle = document.getElementById('circle');
const gridSize = 5;
const colors = [];

const timeSpan = document.getElementById('timeSpan');
const scoreSpan = document.getElementById('scoreSpan');

let score = 0;
let goals = 25;
let limitedTime = 39;
const gameOver = 0;
let clearedCells = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

// timeSpan.innerHTML = `${limitedTime} sec`;
// scoreSpan.innerHTML = `${score} points`;

let countdownInterval; 

function startCountdown() {
  if (countdownInterval) return;

  countdownInterval = setInterval(() => {
    limitedTime--; 
    timeSpan.innerHTML = `${limitedTime} sec`;

    if (limitedTime <= gameOver) {
      clearInterval(countdownInterval); 
      alert('Game over'); 
      window.location.reload(); 
    }
  }, 1000); 
}

function collectPoints() {
    score += 1;
    scoreSpan.innerHTML = `${score} points`;
    if (score >= goals) {
        alert('GRATTIS!!!');
        location.reload();
    }
}

// Generera färger i grid
for (let i = 0; i < gridSize; i++) {
    colors[i] = [];
    for (let j = 0; j < gridSize; j++) {
        colors[i][j] = getRandomColor();
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.backgroundColor = colors[i][j];
        gridElement.appendChild(cell);
    }
}

const cellSize = gridElement.offsetWidth / gridSize;

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Define `circleX` and `circleY` based on the centered position of the grid
const gridRect = gridElement.getBoundingClientRect();
let circleX = gridRect.left + (gridSize / 2) * cellSize - (circle.offsetWidth / 2);
let circleY = gridRect.top + (gridSize / 2) * cellSize - (circle.offsetHeight / 2);

// Set initial position of the circle
circle.style.left = `${circleX}px`;
circle.style.top = `${circleY}px`;


// Function to clear color based on circle's new position
function clearColorAtPosition(x, y) {
    const gridRect = gridElement.getBoundingClientRect();
    const adjustedX = x - gridRect.left;
    const adjustedY = y - gridRect.top;

    const gridX = Math.floor(adjustedX / cellSize);
    const gridY = Math.floor(adjustedY / cellSize);

    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        const cellIndex = gridY * gridSize + gridX;
        const cell = gridElement.children[cellIndex];

        if (!clearedCells[gridY][gridX]) {
            cell.style.backgroundColor = '#ffffff'; // Sätt cellens färg till vit
            clearedCells[gridY][gridX] = true; // Markera cellen som rensad
            // collectPoints(); // Lägg till poäng
        }
    }
}

// Joystick funktionalitet
let isDragging = false;


joystick.addEventListener('mousedown', (e) => {
    isDragging = true;
});

joystick.addEventListener('touchstart', (e) => {
    isDragging = true;
    e.preventDefault(); // Förhindra scrollning
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    joystick.style.transform = 'translate(0, 0)';
});

document.addEventListener('touchend', () => {
    isDragging = false;
    joystick.style.transform = 'translate(0, 0)';
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) handleJoystickMovement(e.clientX, e.clientY);
});

document.addEventListener('touchmove', (e) => {
    if (isDragging) {
        e.preventDefault(); // Förhindra scrollning
        const touch = e.touches[0];
        handleJoystickMovement(touch.clientX, touch.clientY);
    }
});

function handleJoystickMovement(clientX, clientY) {
    const joystickRect = joystick.getBoundingClientRect();
    let x = clientX - joystickRect.left - joystickRect.width / 2;
    let y = clientY - joystickRect.top - joystickRect.height / 2;

    const distance = Math.sqrt(x * x + y * y);
    if (distance > 40) {
        x = (x / distance) * 40;
        y = (y / distance) * 40;
    }

    joystick.style.transform = `translate(${x}px, ${y}px)`;

    // Uppdatera cirkelns position baserat på joystick-rörelsen
    circleX += x / 20;
    circleY += y / 20;

    // Håll cirkeln inom gridens gränser
    circleX = Math.max(gridRect.left, Math.min(circleX, gridRect.right - circle.offsetWidth));
    circleY = Math.max(gridRect.top, Math.min(circleY, gridRect.bottom - circle.offsetHeight));

    // Använd den uppdaterade positionen för cirkeln
    circle.style.left = `${circleX}px`;
    circle.style.top = `${circleY}px`;

    clearColorAtPosition(circleX + circle.offsetWidth / 2, circleY + circle.offsetHeight / 2);
    // startCountdown()  // Kommentera bort om du bara vill ha countdown en gång
}




