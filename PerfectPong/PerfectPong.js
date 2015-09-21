// Perfect Pong. A simple and mechanically sound Pong game.
//
// Author: Christian Hughes

window.onload = function ()
{
    // Get the canvas, then set the width and height.
    var canvas = document.getElementById("pongPlayingField");
    canvas.width = 650;
    canvas.height = 500;
    //Get the canvas context, and assign to a variable.
    var context = canvas.getContext("2d");
    context.font = "125px Courier";
    context.fillStyle="#FFFFFF";

    // CREATE ALL GAME OBJECTS AND ASSOCIATED VARIABLES.
    var leftPaddle = new Paddle(15, 175, 87, 83);
    var rightPaddle = new Paddle(605, 175, 38, 40);
    var net = new PongNet;
    var p1Score = { value: 0 };
    var p2Score = { value: 0 };
    var p1ScoreBoard = new ScoreBoard(150, 95, p1Score);
    var p2ScoreBoard = new ScoreBoard(415, 95, p2Score);
    var p1TotalWins = 0;
    var p2TotalWins = 0;
    var ball = new Ball();

    // Create a game state variable, which will simply hold the current game state as a string.
    var gameState = "startScreen";

    // These event listeners will automatically be listening for keypresses (both up and down).
    // They will update the KeyState object based on the specific key pressed, as well as its its state.
    window.addEventListener('keyup', function(event) { KeyState.onKeyup(event); });
    window.addEventListener('keydown', function(event) { KeyState.onKeydown(event); });


  // Updates all of the non-static game objects.
  function update()
  {
    leftPaddle.updateEntity();
    rightPaddle.updateEntity();
    ball.updateEntity();
  }

  // Calls the render method of each individual game object. Clears the canvas before doing so.
  function render()
  {
    context.clearRect(0, 0, 650, 500);
    leftPaddle.renderEntity();
    rightPaddle.renderEntity();
    net.renderEntity();
    p1ScoreBoard.renderEntity();
    p2ScoreBoard.renderEntity();
    ball.renderEntity();
  }

  // The code for this helper object is very similar to the one described here:
  // http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/
  //
  // This keeps track of which key is pressed so that the game objects can update
  // at the same speed as the game loop (and not independently). Variable names are
  // changed to make the logic simpler to grasp.
  var KeyState =
  {
    // An object keeping track the key(s) being pressed. The keyCode will be true if so.
    pressedKey: {},

    // A function that updates the pressed key object while the key is pressed down.
    onKeydown: function(eventListenerPassedThisIn) {
      eventListenerPassedThisIn.preventDefault();
      this.pressedKey[eventListenerPassedThisIn.keyCode] = true;
    },
    // Deletes the keyCode property of the key that was just released from pressedKey.
    onKeyup: function(eventListenerPassedThisIn) {
      delete this.pressedKey[event.keyCode];
    },
    // Returns true if the key with the current keyCode is currently down.
    isDown: function(keyCode)
    {
      return this.pressedKey[keyCode];
    }
  };

  // Defines the base class for a game object. In this case, paddles and the pong ball.
  // Not explicitly used, due to the low number of game objects.
  function Entity()
  {
      var updateEntity;
      var renderEntity;
  }

  // Defines the pong paddle object, which inherits from the Entity class.
  function Paddle(x, y, upKeyCode, downKeyCode)
  {
    this.x = x;
    this.y = y;

    this.renderEntity = function()
    {
      context.fillRect(this.x, this.y, 30, 150);
    }

    this.updateEntity = function()
    {
      if (KeyState.isDown(upKeyCode))
      {
        this.moveUp();
      }
      if (KeyState.isDown(downKeyCode))
      {
        this.moveDown();
      }
    }

    this.moveUp = function()
    {
      if (this.y > 0)
      {
        this.y -= 9;
      }
    }

    this.moveDown = function()
    {
      if (this.y < 350)
      {
        this.y += 9;
      }
    }

    this.restoreToCenter = function()
    {
      this.y = 175;
    }
  }
  Paddle.prototype = new Entity();

  // Defines the ball game object. There is only one. It is a subclass of entity.
  function Ball()
  {
    this.x = 310;
    this.y = 235;
    var xVelocity = -6;
    var yVelocity = Math.floor((Math.random() * 6) + 1);

    // Simply renders the current position of the ball.
    this.renderEntity = function()
    {
      context.fillRect(this.x, this.y, 30, 30);
    }

    // Updates the velocity of the ball based on the surface it contacts, and the number of paddle hits elapsed.
    this.updateEntity = function()
    {
      this.x += xVelocity;
      this.y += yVelocity;

      if (((this.x + 30) >= rightPaddle.x) && ((rightPaddle.x - this.x) > -7) && (this.y < (rightPaddle.y + 150)) && (this.y >= (rightPaddle.y - 29)))
      {
          this.x = rightPaddle.x - 30;
          xVelocity *= -1.08;

          // This big ol' Statement determines the trajectory of the ball upon hitting the paddle.
          if (Math.abs(rightPaddle.y - this.y) < 30)
          {
              yVelocity = -9;
          }
          else if (Math.abs(rightPaddle.y - this.y) < 60)
          {
            yVelocity = -3;
          }
          else if (Math.abs(rightPaddle.y - this.y) < 90)
          {
            yVelocity = 0;
          }
          else if (Math.abs(rightPaddle.y - this.y) < 120)
          {
            yVelocity = 3;
          }
          else
          {
            yVelocity = 9;
          }
      }
      else if (this.x >= 650)
      {
        p1Score.value++;
        this.x = 310;
        this.y = 235;
        xVelocity = -6;
        yVelocity = Math.floor((Math.random() * 9) + 1);
        if (Math.random() > .5)
        {
          yVelocity *= -1;
        }
      }
      else if ((this.x <= (leftPaddle.x + 30)) && ((this.x - leftPaddle.x) > -7) && (this.y < (leftPaddle.y + 150)) && (this.y >= (leftPaddle.y - 29)))
      {
          this.x = leftPaddle.x + 30;
          xVelocity *= -1.08;

          if (Math.abs(leftPaddle.y - this.y) < 30)
          {
              yVelocity = -9;
          }
          else if (Math.abs(leftPaddle.y - this.y) < 60)
          {
            yVelocity = -3;
          }
          else if (Math.abs(leftPaddle.y - this.y) < 90)
          {
            yVelocity = 0;
          }
          else if (Math.abs(leftPaddle.y - this.y) < 120)
          {
            yVelocity = 3;
          }
          else
          {
            yVelocity = 9;
          }
      }
      else if (this.x <= -30)
      {
        p2Score.value++;
        this.x = 310;
        this.y = 235;
        xVelocity = 6;
        yVelocity = Math.floor((Math.random() * 9) + 1);
        if (Math.random() > .5)
        {
          yVelocity *= -1;
        }
      }
      else if (this.y <= 0 || this.y >= 470)
      {
        if (this.y < 0)
        {
          this.y = 0;
        }
        else if (this.y > 470)
        {
          this.y = 470;
        }
        yVelocity *= -1;
      }
    }

  }
  Ball.prototype = new Entity();

  function PongNet()
  {
    //Draws the rectangles that compose the "net" of the pong game.
    this.renderEntity = function()
    {
      context.fillStyle="#FFFFFF";
      var yCordOfNet = 0;
      for (var i = 0; i < 13; i++)
      {
        context.fillRect(314, yCordOfNet, 20, 20);
        yCordOfNet += 40;
      }
    }
  }

  // A ScoreBoard is just the score counter for each player. Two will be created.
  // Parameters represent the desired cordinates of text, and the playersScore.
  // Because the score is passed in as an object, no update() method is necessary. The score will
  // render every frame, and update as the variable updates.
  function ScoreBoard(xCord, yCord, playerScore)
  {
    this.renderEntity = function()
    {
      if (xCord == 415 && playerScore.value >= 10)
      {
        xCord = 350;
      }
      else if (xCord === 350)
      {
        xCord = 415;
      }
      context.fillText(playerScore.value, xCord, yCord);
    }
  }

  // The static net that sits in the middle of the playing field.
  // The main game loop for the function. Runs continously whenever the gameState is "inGame." Terminates upon either player scoring 10 points.
  function gameLoop()
  {
    if (gameState === "inGame")
    {
      // The browser will request the next frame.
      window.requestAnimationFrame(gameLoop);

      // The event listeners created in createGameWorld() are constantly looking for user input...

      // The update() function calls the update function of each individual object. Those update functions also process user input.
      // The render() methods renders each of the game objects.
      update();
      render();

      // Loop Termination Condition. This means that one of the players has won.
      if (p1Score.value === 10)
      {
          gameState = "p1Wins";
          p1TotalWins++;
          context.clearRect(0, 0, 650, 500);
          context.font = "95px Helvetica";
          context.fillText("Player 1 Wins!", 20, 130);
          context.font = "bold italic 40px Helvetica";
          context.fillText("Player 1", 55, 260);
          context.fillText("Player 2", 435, 260);
          context.font = "italic 35px Helvetica";
          context.fillText("TOTAL WINS", 215, 180);
          context.font = "bold 25px Helvetica";
          context.fillText("-Press ENTER To Play Again-", 145, 480);
          context.font = "125px Helvetica";
          context.fillText(p1TotalWins, 95, 380);
          context.fillText(p2TotalWins, 485, 380);
          context.fillText("-", 300, 380);
      }
      else if (p2Score.value === 10)
      {
        gameState = "p2Wins";
        p2TotalWins++;
        context.clearRect(0, 0, 650, 500);
        context.font = "95px Helvetica";
        context.fillText("Player 2 Wins!", 20, 130);
        context.font = "bold italic 40px Helvetica";
        context.fillText("Player 1", 55, 260);
        context.fillText("Player 2", 435, 260);
        context.font = "italic 35px Helvetica";
        context.fillText("TOTAL WINS", 215, 180);
        context.font = "bold 25px Helvetica";
        context.fillText("-Press ENTER To Play Again-", 145, 480);
        context.font = "125px Helvetica";
        context.fillText(p1TotalWins, 95, 380);
        context.fillText(p2TotalWins, 485, 380);
        context.fillText("-", 300, 380);
      }
    }
  }

  // Starts the game and renders/creates the start screen components. Creates the event listener
  // that will begin the gameLoop(). The loop will start whenever the user presses enter on the startScreen
  // or results screen.
  function startGame()
  {
    context.font = "95px Helvetica";
    context.fillText("Perfect Pong", 50, 130);
    context.font = "italic 24px Helvetica";
    context.fillText("Mechanically Pure. Simple. Timeless. Perfect.", 55, 165);
    context.font = "bold italic 40px Helvetica";
    context.fillText("Player 1", 55, 260);
    context.fillText("Player 2", 435, 260);
    context.font = "35px Helvetica";
    context.fillText(String.fromCharCode(8593) + " - W", 80, 310);
    context.fillText(String.fromCharCode(8593) + " - " + String.fromCharCode(8679), 470, 310);
    context.fillText(String.fromCharCode(8595) + " - S", 80, 360);
    context.fillText(String.fromCharCode(8595) + " - " + String.fromCharCode(8681), 470, 360);
    context.font = "bold 25px Helvetica";
    context.fillText("-Press ENTER To Begin-", 175, 480);
    context.font = "125px Helvetica";
    window.addEventListener('keydown', function(event) {
        if (event.keyCode === 13 && (gameState === "startScreen" || gameState === "p1Wins" || gameState === "p2Wins"))
        {
          gameState = "inGame";
          p1Score.value = 0;
          p2Score.value = 0;
          gameLoop();
        }
    });
  }

  // START THE GAME.
  startGame();
}
