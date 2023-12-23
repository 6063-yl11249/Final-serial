// serial variables
let mSerial;

let connectButton;

let readyToReceive;

let pred2 = 0;
let pred3 = 0;
let pred4 = 0;
let pred5 = 0;

// project variables
let Bgreen = false;
let Bred = false;
let Byellow = false;
let Bbrown = false;

let displayColorImage = false;
let currentPrompt = "";

let gameStarted = false;
let button5Rounds;
let button10Rounds;
let maxRounds = 5; 

let currentRound = 0;
let isFirstAttempt = true;

let correctAnswers = 0;
let incorrectAnswers = 0;
let gameEnded = false;
let timeoutID;

function receiveSerial() {
  let line = mSerial.readUntil("\n");
  trim(line);
  if (!line) return;

  if (line.charAt(0) != "{") {
    print("error: ", line);
    readyToReceive = true;
    return;
  }

  // get data from Serial string
  let data = JSON.parse(line).data;
  print (data);

  let d2 = data.D2.value;
  let d3 = data.D3.value;
  let d4 = data.D4.value;
  let d5 = data.D5.value;

  // use data to update project variables
  if(d5 == 1 && pred5 == 0) {
    Bgreen = true;
  } else {
    Bgreen = false;
  }
  
  if(d4 == 1 && pred4 == 0) {
    Bred = true;
  } else {
    Bred = false;
  }
  
  if(d3 == 1 && pred3 == 0) {
    Byellow = true;
  } else {
    Byellow = false;
  }
  
  if(d2 == 1 && pred2 == 0) {
    Bbrown = true;
  } else {
    Bbrown = false;
  }

  // serial update
  readyToReceive = true;
}

function connectToSerial() {
  if (!mSerial.opened()) {
    mSerial.open(9600);

    readyToReceive = true;
    connectButton.hide();
  }
}

class Figure {
  constructor(name, bwimagePath, imagePath, naturalColor, voicePrompt) {
    this.name = name;
    this.bwimage = loadImage(bwimagePath); 
    this.image = loadImage(imagePath);
    this.naturalColor = naturalColor;
    this.voicePrompt = voicePrompt; 
  }

  speakPrompt() {
    mSpeech.speak("What is the color of " + this.voicePrompt + "?");
  }
}

let figures = [];
let selectedFigure;
let buses = [];
let mSpeech;

function setup() {
  // setup project
  createCanvas(windowWidth,windowHeight); 

  // Initialize the speech object
  mSpeech = new p5.Speech();
  mSpeech.interrupt = false;

  // Create buttons for selecting number of rounds
  button5Rounds = createButton('5 Rounds');
  button5Rounds.position(20, 60);
  button5Rounds.mousePressed(() => setRoundsAndStart(5));

  button10Rounds = createButton('10 Rounds');
  button10Rounds.position(button5Rounds.x + button5Rounds.width + 20, 60);
  button10Rounds.mousePressed(() => setRoundsAndStart(10));


  // Initialize figures
  figures.push(new Figure("Tomato", "image/bwtomato.png", "image/tomato.png",'red', "tomato"));
  figures.push(new Figure("Pepper", "image/bwpepper.png", "image/greenpepper.png",'green', "pepper"));
  figures.push(new Figure("Moon", "image/bwmoon.png", "image/moon.png",'yellow', "moon"));
  figures.push(new Figure("Chestnut", "image/bwchestnut.png", "image/chestnut.png",'brown', "chestnut"));

  // Initialize buses
  buses = [
    { color: "green" },
    { color: "red" },
    { color: "yellow" },
    { color: "brown" },
  ];


  // setup serial
  readyToReceive = false;

  mSerial = createSerial();

  connectButton = createButton("Connect To Serial");
  connectButton.position(width / 2, height / 2);
  connectButton.mousePressed(connectToSerial);
}

function setRoundsAndStart(rounds) {
  maxRounds = rounds;
  gameStarted = true; 
  button5Rounds.hide();
  button10Rounds.hide();
  startGame();
}

function draw() {
  // project logic
  if (!gameStarted) {
    // Draw initial screen logic
    background(200); // Example background color
    fill(0);
    textSize(32);
    textAlign(CENTER);
    text("Select number of rounds to start", width / 2, 30);
    // No return statement here to allow buttons to be interactive
  } else if (!gameEnded) {
   
    // Main game drawing logic
    background(255); 

    // Draw the selected figure
    if (selectedFigure) {
      if (displayColorImage) {
        image(selectedFigure.image, 150, 150, 500, 500);
      } else {
        image(selectedFigure.bwimage, 150, 150, 500, 500);
      }
    }

    fill(0); // Black color for text
    textSize(24);
    textAlign(LEFT, TOP); // Align text to the top left for easier positioning
    text(currentPrompt, 50, 50);

    // Draw the buses
    drawBuses();

    if (Bgreen) {
      console.log("Green button processing");
      checkSelection('green');
      Bgreen = false;
    } else if (Bred) {
      console.log("Red button processing");
      checkSelection('red');
      Bred = false;
    } else if (Byellow) {
      console.log("Yellow button processing");
      checkSelection('yellow');
      Byellow = false;
    } else if (Bbrown) {
      console.log("Brown button processing");
      checkSelection('brown');
      Bbrown = false;
    }
  }

  // update serial: request new data
  if (mSerial.opened() && readyToReceive) {
    readyToReceive = false;
    mSerial.clear();
    mSerial.write(0xab);
  }

  // update serial: read new data
  if (mSerial.availableBytes() > 8) {
    receiveSerial();
  }
}

function startGame() {
  console.log("Starting game, Round: " + currentRound + " of " + maxRounds);
  if (gameStarted) {
    displayColorImage = false;
    selectedFigure = selectRandomFigure(figures);
    currentPrompt = "What is the color of " + selectedFigure.voicePrompt + "?";

    // Call speakPrompt only if it's the first attempt of the round
    if (isFirstAttempt) {
      selectedFigure.speakPrompt(figures);
      isFirstAttempt = false;
    }
  }
  
}


function selectRandomFigure(figures) {
  let randomIndex = int(random(figures.length));
  return figures[randomIndex];
}

function drawBuses() {
  const busWidth = 180;
  const busHeight = 100;
  const gap = 30; 

  const totalHeight = buses.length * busHeight + (buses.length - 1) * gap;

  const startY = (windowHeight - totalHeight) / 2;

  buses.forEach((bus, index) => {
    const yPos = startY + index * (busHeight + gap);

    fill(bus.color);
    const xPos = windowWidth - busWidth - 80; 
    rect(xPos, yPos, busWidth, busHeight);
  });
}

function keyPressed() {
  if (key === 'A' || key === 'a') {
    resetGameVariables();
  }
}

// Check if the selection matches the figure's color
function checkSelection(selectedColor) {
  if (selectedColor === selectedFigure.naturalColor) {
      handleCorrectSelection();
  } else {
      handleIncorrectSelection();
  }
}


function handleCorrectSelection() {
  displayColorImage = true;
  currentPrompt = "Fantastic job! You got it right!";
  mSpeech.speak(currentPrompt);

  if (isFirstAttempt) {
    correctAnswers++;
  }
  isFirstAttempt = false; 

  clearTimeout(timeoutID); 

  timeoutID = setTimeout(() => {
    currentRound++;
    currentPrompt = "What is the color of " + selectedFigure.voicePrompt + "?";
    if (currentRound < maxRounds) {
      startGame();
    } else {
      endGame();
    }
  }, 3000);
}


function handleIncorrectSelection() {
  displayColorImage = false;
  currentPrompt = "Let's try one more time!";
  mSpeech.speak(currentPrompt);
  isFirstAttempt = false;
  incorrectAnswers++;

  clearTimeout(timeoutID); // Clear any existing timeout

  timeoutID = setTimeout(() => {
    currentRound++;
    currentPrompt = "What is the color of " + selectedFigure.voicePrompt + "?";
    if (currentRound < maxRounds) {
      startGame();
    } else {
      endGame();
    }
  }, 3000);
}


// End the game
function endGame() {
  gameEnded = true;
  displaySummary();
  displayRestartOption();
}


// Function to display a summary of the game
function displaySummary() {
    background(255); 
    textSize(32);
    fill(0); 
    textAlign(CENTER, CENTER);
    text("Here's how you did:", width / 2, height / 2 - 60);
    text("Total Rounds: " + maxRounds, width / 2, height / 2);
    text("Correct Answers: " + correctAnswers, width / 2, height / 2 + 60);
}

// Function to display restart option
function displayRestartOption() {
    fill(0, 102, 153);
    textSize(24);
    text("Press 'A' to Restart", width / 2, height / 2 + 120);
}

function resetGameVariables() {
  correctAnswers = 0;
  incorrectAnswers = 0;
  currentRound = 0;
  gameStarted = false;
  gameEnded = false; // Reset the game-ended flag

  button5Rounds.show();
  button10Rounds.show();
}