const gridElement = document.getElementById("grid");
const joystick = document.getElementById("joystick");
const timeSpan = document.querySelector(".timeSpan");
const scoreSpan = document.getElementById("scoreSpan");
const modal = document.getElementById("modal");
const modalHeader = document.querySelector(".modal-header");
const modalText = document.querySelector(".modal-text");
const modalCloseButton = document.querySelector(".close-button");
const circle = document.getElementById("circle");

circle.classList.add("circle");
const theCircle = document.querySelector(".circle");
theCircle.style.backgroundImage = 'url("./tractor.png")';
theCircle.style.backgroundPosition = "center";
theCircle.style.backgroundRepeat = "no-repeat";
theCircle.style.backgroundSize = "contain";

const gridSize = 10;

//Dem tre olika spellägen är: collectPoints, reducePoints, gameOver
let gameMode = "reducePoints";

let limitedTime = 1000;
const gameOver = 0;
let score = 0;
let goals = 16;
let smallPenaltyPoints = 1;
let largePenaltyPoints = 5;
let rewardPoints = 1;

let isDragging = false;
let joystickSpeed = 0.1;

//Den häör variabeln används för att ändra rubriken i modalen.
let modalHeaderText = "";

//Den här variabeln används för att ändra texten i modalen
let modalMessageText = "";

/*
Den här variabeln används för att kunna låta spelaren komma upp till ett viss poäng 
innan hinderna dyker upp.....  
*/
let hasGameReachedTarget = 5;

timeSpan.innerHTML = `${limitedTime}S`;
scoreSpan.innerHTML = `${score}P`;

//Array för alla bilder som ger poäng
const cornImages = [
  // "https://purepng.com/public/uploads/large/purepng.com-carrotcarrotdomestic-carrotfast-growingcarrots-1701527243731np6ec.png",
  // "https://pngimg.com/uploads/corn/corn_PNG5273.png",
  // "https://pngimg.com/uploads/potato/potato_PNG7081.png",
  "https://pngimg.com/uploads/onion/onion_PNG99201.png",
];

//Array för game over bilden och minus poäng bilder
const explosiveImages = [
  "https://pngimg.com/uploads/tractor/tractor_PNG101303.png",
  "https://pngimg.com/uploads/stone/stone_PNG13588.png",
];

let clearedCells = [];
for (let i = 0; i < gridSize; i++) {
  clearedCells[i] = [];
  for (let j = 0; j < gridSize; j++) {
    clearedCells[i][j] = false;
  }
}

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
            
      gridElement.appendChild(cell);
    }
  }

let countdownInterval;

//Funktionen som startar tiden så fort man rör joystick
function startCountdown() {
  if (countdownInterval) return;

  countdownInterval = setInterval(() => {
    limitedTime--;
    timeSpan.innerHTML = `${limitedTime}S`;

    if (limitedTime <= gameOver) {
      modalHeaderText = "TIDEN HAR LÖPT UT";
      modalMessageText = "BRA ATT VETA TILL NÄSTA GRÅNG.... DU HAR 39S FÖR ATT KOMMA TILL MÅL";
      showModal();
    }
  }, 1000);
}


function collectPoints() {
  score += rewardPoints;
  scoreSpan.innerHTML = `${score}P`;

  if (score >= goals) {
    modalHeaderText = "GRATTIS";
    modalMessageText = "DU LYCKADES NÅ MÅLET INNAN TIDEN LÖPT UT";
    showModal();
  }

  if (score <= gameOver) {
    modalHeaderText = "DU HAR FÖRLORAT";
    modalMessageText = "DU HAR INTE LYCKATS UNDVIKA HINDERNA";
    showModal();
   
  }
}

function handleGameOver(imgSrc) {
  if (gameMode === "collectPoints") {
    collectPoints();
  } else if (gameMode === "gameOver") {
    if (imgSrc.includes(explosiveImages[0])) {
      modalHeaderText = "DU KÖRDE PÅ HINDRET";
      modalMessageText = "FÖRSÖKT IGEN";
      showModal();

    }

    if (score <= gameOver) {
      collectPoints();
    }
  } else if (gameMode === "reducePoints") {
    if (imgSrc.includes(explosiveImages[0])) {
      score -= largePenaltyPoints;
    }
    if (imgSrc.includes(explosiveImages[1])) {
      score -= smallPenaltyPoints;
    }

    scoreSpan.innerHTML = `${score}P`;

    if (score <= gameOver) {
      collectPoints();
    }
  }
}

// Variabel för att hålla reda på antalet explosiveImages[0]-bilder i gameOver-läget
let explosiveImageCount = 0;

function generateRandomCornImage() {
  let randomX, randomY;
  let cell, cellIndex;

  do {
    randomX = Math.floor(Math.random() * gridSize);
    randomY = Math.floor(Math.random() * gridSize);
    cellIndex = randomY * gridSize + randomX;
    cell = gridElement.children[cellIndex];
  } while (clearedCells[randomY][randomX] || cell.querySelector("img"));

  const randomImageIndex = Math.floor(Math.random() * cornImages.length);
  const imgSrc = cornImages[randomImageIndex];
  const img = document.createElement("img");
  const chooseExplosive = Math.random() > 0.1;

  if (gameMode === "colectPoints") {
    img.src = imgSrc;
  } else {
    if (chooseExplosive) {
      if (gameMode === "gameOver" && explosiveImageCount < 2) {
        img.src = explosiveImages[0];
        explosiveImageCount++;
      } else if (gameMode === "reducePoints") {
        if (score <= hasGameReachedTarget) {
          img.src = imgSrc;
        } else {
          const randomExplosiveIndex = Math.floor(
            Math.random() * explosiveImages.length
          );
          img.src = explosiveImages[randomExplosiveIndex];
        }
      }
    } else {
      img.src = imgSrc;
    }
  }

  img.className = "img";
  clearedCells[randomY][randomX] = false;
  cell.appendChild(img);
}


function genereteMultipleImages() {
  const currentImages = gridElement.querySelectorAll("img").length;
  const imagesToGenerate = 4 - currentImages;

  for (let i = 0; i < imagesToGenerate; i++) {
    generateRandomCornImage(i);
  }
}

genereteMultipleImages();

const cellSize = gridElement.offsetWidth / gridSize;

const gridRect = gridElement.getBoundingClientRect();
let circleX =
  gridRect.left + gridElement.offsetWidth / 2 - circle.offsetWidth / 2;
let circleY =
  gridRect.top + gridElement.offsetHeight / 2 - circle.offsetHeight / 2;

circle.style.left = `${circleX}px`;
circle.style.top = `${circleY}px`;


function clearColorAtPosition(x, y) {
  const gridRect = gridElement.getBoundingClientRect();
  const adjustedX = x - gridRect.left;
  const adjustedY = y - gridRect.top;

  const gridX = Math.floor(adjustedX / cellSize);
  const gridY = Math.floor(adjustedY / cellSize);

  if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
    const cellIndex = gridY * gridSize + gridX;
    const cell = gridElement.children[cellIndex];

    const img = cell.querySelector("img");

    if (img) {
      if (
        img.src.includes(explosiveImages[0]) ||
        img.src.includes(explosiveImages[1])
      ) {
        handleGameOver(img.src);
      } else {
        collectPoints();
      }

      cell.removeChild(img);
      clearedCells[gridY][gridX] = false;
      generateRandomCornImage();
    }
  }
}

let movementInterval;

joystick.addEventListener("mousedown", (e) => {
  isDragging = true;
  startMovement();
});

joystick.addEventListener("touchstart", (e) => {
  isDragging = true;
  e.preventDefault();
  startMovement();
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  joystick.style.transition = "transform 0.2s";
  joystick.style.transform = "translate(0, 0)";
  stopMovement();
});

document.addEventListener("touchend", () => {
  isDragging = false;
  joystick.style.transition = "transform 0.2s";
  joystick.style.transform = "translate(0, 0)";
  stopMovement();
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) handleJoystickMovement(e.clientX, e.clientY);
});

document.addEventListener(
  "touchmove",
  (e) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      handleJoystickMovement(touch.clientX, touch.clientY);
    }
  },
  { passive: false }
);

let joystickX = 0;
let joystickY = 0;
const maxJoystickDistance = 30;

function handleJoystickMovement(clientX, clientY) {
  const joystickRect = joystick.getBoundingClientRect();
  let x = clientX - joystickRect.left - joystickRect.width / 2;
  let y = clientY - joystickRect.top - joystickRect.height / 2;

  // Constrain joystick movement to a circular area
  const distance = Math.sqrt(x * x + y * y);
  if (distance > maxJoystickDistance) {
    x = (x / distance) * maxJoystickDistance;
    y = (y / distance) * maxJoystickDistance;
  }

  // Apply smooth transform
  joystick.style.transition = "transform 0.05s";
  joystick.style.transform = `translate(${x}px, ${y}px)`;

  joystickX = x * joystickSpeed;
  joystickY = y * joystickSpeed;
}

function startMovement() {
  if (movementInterval) return;

  movementInterval = setInterval(() => {
    if (isDragging) {
      moveCircle();
    }
  }, 20);
}

function stopMovement() {
  clearInterval(movementInterval);
  movementInterval = null;
}

function moveCircle() {
  const gridRect = gridElement.getBoundingClientRect();

  circleX += joystickX;
  circleY += joystickY;

  circleX = Math.max(
    gridRect.left,
    Math.min(circleX, gridRect.right - circle.offsetWidth)
  );
  circleY = Math.max(
    gridRect.top,
    Math.min(circleY, gridRect.bottom - circle.offsetHeight)
  );

  circle.style.left = `${circleX}px`;
  circle.style.top = `${circleY}px`;

  clearColorAtPosition(
    circleX + circle.offsetWidth / 2,
    circleY + circle.offsetHeight / 2
  );
  startCountdown();
}

const showModal = () => {
  modalHeader.innerHTML = modalHeaderText;
  modalText.innerHTML = modalMessageText;
  modal.classList.remove("hidden");
  clearInterval(countdownInterval);
};

modalCloseButton.addEventListener("click", () => {
  window.location.reload();
});
