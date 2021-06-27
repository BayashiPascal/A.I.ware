/* ============= aiware.js =========== */

// The holes' indexes start at 0 from top-right and increment CCW

// ------------ Global variables
var theAIware = {};
var idAI = 0;
var idHuman = 1;
var nbPlayer = 2;
var nbHolePlayer = 6;
var nbHole = nbPlayer * nbHolePlayer;
var nbStoneHoleInit = 4;
var nbStone = nbHole * nbStoneHoleInit;
var gameRunning = 0;
var gameOver = 1;
var gameWaiting = 2;
var gameChecking = 3;
var zIndexSky = nbStone + 1;
var handTickInterval = 50;
var stoneMaxSpeed = 30.0;
var incSpeed = 0.5;
var preloadImg = new Array();

// ------------ AIware: main class

function AIware() {
  try {
    // Create arrays
    this._score = new Array();
    this._level = 0;
    this._holes = new Array();
    this._stones = new Array();
    // Flag to memorize display of number of stone in hole
    this._displayNbStoneHole = false;
    // Init variables about the board graphics
    this._holeSize = 35.0;
    this._sizeStone = 30.0;
    // Init a new game
    this._nbTurn = 0;
    this.InitNewGame();
  } catch (err) {
    console.log("AIware " + err.stack);
  }
}

// ------------ Init a fresh new game

AIware.prototype.InitNewGame = function() {
  try {
    // Init the level
    this._level = $("#selLevel").val();
    console.log("start a new game at level " + this._level);
    // Init the number of turn
    if (this._nbTurn > 2) {
      console.log("Human resigns");
      this.HumanResign();
    }
    this._nbTurn = 0;
    // Init the score
    this._score[idHuman] = 0;
    this._score[idAI] = 0;
    // Init the game status
    this._status = gameRunning;
    // Init the current player
    this._curPlayer = Math.round(Math.random());
    // Init the holes
    for (var iHole = 0; iHole < nbHole; iHole++) {
      this._holes[iHole] = {};
      this._holes[iHole]._nbStone = 0;
      this._holes[iHole]._stones = new Array();
    }
    this._selectedHole = -1;
    // Init the stones
    var iHole = 0;
    var jStone = 0;
    for (var iStone = 0; iStone < nbStone; ++iStone) {
      this._stones[iStone] = {};
      this._stones[iStone]._index = iStone;
      this._stones[iStone]._pos = this.GetFreePosHole(iHole);
      this._stones[iStone]._moveTo = {};
      this._stones[iStone]._moveTo._x = 
        this._stones[iStone]._pos._x;
      this._stones[iStone]._moveTo._y = 
        this._stones[iStone]._pos._y;
      this._stones[iStone]._moveTo._z = 
        this._stones[iStone]._pos._z;
      this._stones[iStone]._scale = 1.0;
      this._stones[iStone]._curHole = -1;
      this._stones[iStone]._moveToHole = -1;
      this._stones[iStone]._speed = 0.0;
      this.UpdateStonePos(iStone);
      this.AddStoneToHole(iStone, iHole);
      // Inc the nb of stones in this hole, 
      // if it's full, go to next hole
      jStone++;
      if (jStone == nbStoneHoleInit) {
        jStone = 0;
        iHole++;
      }
    }
    // Init the hand
    this._hand = {};
    this._hand._stones = new Array();
    this._hand._nbStone = 0;
    this._hand._firstMovingStone = 0;
    this._hand._delayMove = 0.0;
    this._hand._lastMovingStone = 0;
    // Update the info
    this.UpdateInfo();
    // Fade in the board
    $("#divBoard").addClass("animated fadeIn");
    setTimeout(function(){
      $("#divBoard").removeClass("animated fadeIn");
    }, 1000);
    // If the AI starts call it now
    if (this._curPlayer == idAI) {
      this.RequestMoveFromAI();
    }
  } catch (err) {
    console.log("InitNewGame " + err.stack);
  }
}

// ------------ Update stat when human resigns

AIware.prototype.HumanResign = function() {
  try {
    // Prepare the arguments
    // level, resign cmd (0)
    var arg = "";
    arg += "l=" + this._level;
    arg += "&c=0";
    // Send the HTTP request
    this.UpdateStat(arg);
  } catch (err) {
    console.log("HumanResign " + err.stack);
  }
}

// ------------ Update stat when human wins

AIware.prototype.HumanWin = function() {
  try {
    // Prepare the arguments
    // level, human win cmd (1)
    var arg = "";
    arg += "l=" + this._level;
    arg += "&c=1";
    // Send the HTTP request
    this.UpdateStat(arg);
  } catch (err) {
    console.log("HumanWin " + err.stack);
  }
}

// ------------ Update stat when A.I. wins

AIware.prototype.AIWin = function() {
  try {
    // Prepare the arguments
    // level, A.I. win cmd (2)
    var arg = "";
    arg += "l=" + this._level;
    arg += "&c=2";
    // Send the HTTP request
    this.UpdateStat(arg);
  } catch (err) {
    console.log("AIWin " + err.stack);
  }
}

// ------------ Update stat when there was a tie

AIware.prototype.Tie = function() {
  try {
    // Prepare the arguments
    // level, tie cmd (3)
    var arg = "";
    arg += "l=" + this._level;
    arg += "&c=3";
    // Send the HTTP request
    this.UpdateStat(arg);
  } catch (err) {
    console.log("AIWin " + err.stack);
  }
}

// ------------ Update stat

AIware.prototype.UpdateStat = function(arg) {
  try {
    // Prepare the url for the PHP interfacing with the database
    url = "./updateStat.php?" + arg;
    // Create the HTTP request entity
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest();
    } else {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          // The request was successful, return the JSON data
          data = xmlhttp.responseText;
        } else {
          // The request failed, return error as JSON
          data ="{\"error\":\"HTTPRequest failed : " + 
            xmlhttp.status + 
            "\"}";
        }
      }
    };
    // Send the HTTP request
    xmlhttp.open("GET", url);
    xmlhttp.send();
  } catch (err) {
    console.log("UpdateStat " + err.stack);
  }
}

// ------------ Update the position of a stone

AIware.prototype.UpdateStonePos = function(iStone) {
  try {
    var stone = this._stones[iStone];
    // Get the vector to destination
    var v = new Array();
    v[0] = stone._moveTo._x - stone._pos._x;
    v[1] = stone._moveTo._y - stone._pos._y;
    // Get the distance ot destination
    var l = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    // If we haven't reached destination yet
    if (l > 1.0) {
      // Increase speed up to half the dist to destination per tick
      // else decrease
      if (2.0 * stone._speed < l) {
        stone._speed += incSpeed;
      } else {
        stone._speed -= incSpeed;
      }
      // Ensure the speed is never more than max speed
      if (stone._speed > stoneMaxSpeed) {
        stone._speed = stoneMaxSpeed;
      }
      // Ensure the speed is never more than half the dist 
      // to destination per tick
      if (stone._speed * 2.0 > l) {
        stone._speed = l * 0.5;
      }
      // Normalise vector to destination
      v[0] = v[0] / l;
      v[1] = v[1] / l;
      v[2] = v[2] / l;
      // Move the stone toward destination at current speed
      stone._pos._x += v[0] * stone._speed;
      stone._pos._y += v[1] * stone._speed;
    } else {
      // If the stone has reached destination
      // Stop it and set its position to exactly the destination
      stone._pos._x = stone._moveTo._x;
      stone._pos._y = stone._moveTo._y;
      stone._speed = 0.0;
    }
    // If the stone is moving, set is zIndex to sky to be sure it will
    // be displayed above other stones. Not perfect but enough.
    if (stone._speed > 1.0) {
      stone._pos._z = zIndexSky;
    } else if (l < this._holeSize) {
      // If the stone enter its hole destination, set its z-index
      // to its destination z-index
      stone._pos._z = stone._moveTo._z;
    }
    // Update the div's css properties to current position
    var divStone = 
      document.getElementById("divStone" + iStone);
    var x = this._stones[iStone]._pos._x - 0.5 * this._sizeStone;
    var y = this._stones[iStone]._pos._y - 0.5 * this._sizeStone;
    divStone.style.left = x + "px";
    divStone.style.top = y + "px";
    divStone.style.zIndex = Math.floor(this._stones[iStone]._pos._z);
    // Special effect, scale the stone make it go up and down
    // along a nice curve
    var s = 35.0 * (1.0 + stone._speed / stoneMaxSpeed);
    divStone.style.width = s + "px";
    divStone.style.height = s + "px";
  } catch (err) {
    console.log("UpdateStonePos " + err.stack);
  }
}

// ------------ Add a stone to a hole

AIware.prototype.AddStoneToHole = function(iStone, iHole) {
  try {
    this._holes[iHole]._stones[this._holes[iHole]._nbStone] = 
      iStone;
    (this._holes[iHole]._nbStone)++;
    this._stones[iStone]._curHole = iHole;
    var id = "#divNbStoneHole" + iHole;
    $(id).html(this._holes[iHole]._nbStone);
  } catch (err) {
    console.log("AddStoneToHole " + err.stack);
  }
}

// ------------ Remove the top stone from a hole

AIware.prototype.RemoveTopStoneFromHole = function(iHole) {
  var iStone = -1;
  try {
    if (this._holes[iHole]._nbStone > 0) {
      (this._holes[iHole]._nbStone)--;
      iStone = this._holes[iHole]._stones[this._holes[iHole]._nbStone];
      this._stones[iStone]._curHole = -1;
      var id = "#divNbStoneHole" + iHole;
      $(id).html(this._holes[iHole]._nbStone);
    }
  } catch (err) {
    console.log("RemoveTopStoneFromHole " + err.stack);
  }
  return iStone;
}

// ------------ Get a free position (x, y, zIndex) in a hole

AIware.prototype.GetFreePosHole = function(iHole) {
  var pos = {};
  pos._x = 0;
  pos._y = 0;
  pos._z = 0;
  try {
    pos._z = this._holes[iHole]._nbStone;
    var c = this.GetCenterPosHole(iHole);
    var r = 0.0;
    if (pos._z > 0) {
      if (pos._z < 9) {
        r = this._sizeStone * 0.5;
      } else if (pos._z < 18) {
        r = this._sizeStone;
      } else {
        r = this._sizeStone * Math.random();
      }
    }
    var theta = 6.2831 * Math.random();
    pos._x = c._x + r * Math.cos(theta);
    pos._y = c._y + r * Math.sin(theta);
  } catch (err) {
    console.log("GetFreePosHole " + err.stack);
  }
  return pos;
}

// ------------ Get the center position (x, y) of a hole

AIware.prototype.GetCenterPosHole = function(iHole) {
  var pos = {};
  pos._x = 0;
  pos._y = 0;
  try {
    var iPlayer = Math.floor(iHole / nbHolePlayer);
    var jHole = iHole % nbHolePlayer;
    pos._x = Math.floor(105 + jHole * 100);
    if (iPlayer == 0) {
      pos._x = Math.floor(105 + (nbHolePlayer - jHole - 1) * 100);
    } else {
      pos._x = Math.floor(105 + jHole * 100);
    }
    pos._y = Math.floor(105 + iPlayer * 100);
  } catch (err) {
    console.log("GetCenterPosHole " + err.stack);
  }
  return pos;
}

// ------------ Update the content of the info div

AIware.prototype.UpdateInfo = function() {
  try {
    // Update the score
    var score = "";
    score += "Score: A.I.(" + this._score[idAI] + ") - ";
    score += "Human(" + this._score[idHuman] + ")";
    $("#divScore").html(score);
    // Update the turn
    var turn = "";
    if (this._status == gameOver) {
      turn += "Game Over! ";
      if (this._score[0] == this._score[1]) {
        turn += "Tie";
      } else if (this._score[0] > this._score[1]) {
        turn += "A.I.ware wins";
      } else {
        turn += "Human wins";
      }
      $("#divTurn").addClass("animated tada");
      setTimeout(function(){
        $("#divTurn").removeClass("animated tada");
      }, 1000);
    } else if (this._curPlayer == idHuman) {
      if (this._status == gameWaiting || 
        this._status == gameChecking) {
        turn += "please wait";
      } else {
        turn += "it's your turn";
      }
    } else {
      if (this._status == gameWaiting || 
        this._status == gameChecking) {
        turn += "please wait";
      } else {
        turn += "it's A.I.ware turn";
      }
    }
    $("#divTurn").html(turn);
    // Refresh the info about the selected hole
    var html = this.GetInfoSelectedHole();
    $("#divInfoHole").html(html);
  } catch (err) {
    console.log("UpdateInfo " + err.stack);
  }
}

// ------------ Get the info to display about the selected hole

AIware.prototype.GetInfoSelectedHole = function() {
  var html = "";
  try {
    if (this._selectedHole != -1) {
      html = "Hole #" + this._selectedHole + " contains " +
        this._holes[this._selectedHole]._nbStone + " stone(s).";
    }
  } catch (err) {
    console.log("GetInfoSelectedHole " + err.stack);
  }
  return html;
}

// ------------ Click on a hole

AIware.prototype.ClickHole = function(iHole) {
  try {
    // If the A.I. is playing
    if (this._curPlayer != idHuman) {
      // Alarm the human he has to wait
      $("#divTurn").addClass("animated swing");
      setTimeout(function(){
        $("#divTurn").removeClass("animated swing");
      }, 1000);
    } else {
      // If the game is ready to receive the human command
      if (this._status == gameRunning) {
        // If the human command is valid
        if (iHole >= nbHolePlayer && iHole < 2 * nbHolePlayer) {
          this.PlayMove(iHole);
        }
      } else {
        // If the hand is busy moving stones or checking board
        // Alarm the human he has to wait
        $("#divTurn").addClass("animated swing");
        setTimeout(function(){
          $("#divTurn").removeClass("animated swing");
        }, 1000);
      }
    }
  } catch (err) {
    console.log("ClickHole " + err.stack);
  }
}

// ------------ Play a move

AIware.prototype.PlayMove = function(iHole) {
  try {
    (this._nbTurn)++;
    console.log("#" + this._nbTurn + " Player " + this._curPlayer + 
      " plays hole " + iHole);
    this._status = gameWaiting;
    // Loop on stone in played hole
    var iStone = this.RemoveTopStoneFromHole(iHole);
    var shiftKrou = 0;
    while (iStone != -1) {
      // Put the stone in hand
      this._hand._stones[this._hand._nbStone] = iStone;
      (this._hand._nbStone)++;
      // Set the destination of the stone
      var destHole = iHole + this._hand._nbStone + shiftKrou;
      while (destHole >= nbHole) {
        destHole -= nbHole;
      }
      // Jump over starting hole (so called Krou)
      if (destHole == iHole) {
        shiftKrou++;
        destHole++;
        while (destHole >= nbHole) {
          destHole -= nbHole;
        }
      }
      this._stones[iStone]._moveTo = this.GetFreePosHole(destHole);
      this._stones[iStone]._moveToHole = destHole;
      // Take another stone
      iStone = this.RemoveTopStoneFromHole(iHole);
    }
    // Start moving the first stone
    this._hand._firstMovingStone = 0;
    this._hand._lastMovingStone = 0;
    this.UpdateInfo();
    
  } catch (err) {
    console.log("ClickHole " + err.stack);
  }
}

// ------------ Capture stones in a hole

AIware.prototype.CaptureStone = function(iHole, iPlayer) {
  try {
    if (this._holes[iHole]._nbStone > 0) {
      console.log("Player " + iPlayer + 
        " captures stones of hole #" + iHole);
      // Loop on stones in hole
      var iStone = this.RemoveTopStoneFromHole(iHole);
      while (iStone != -1) {
        // Put the stone in hand
        this._hand._stones[this._hand._nbStone] = iStone;
        (this._hand._nbStone)++;
        // Set the destination of the stone
        this._stones[iStone]._moveTo = this.GetPosPlayer(iPlayer);
        this._stones[iStone]._moveToHole = -1;
        // Increase the score
        (this._score[iPlayer])++;
        // Take another stone
        iStone = this.RemoveTopStoneFromHole(iHole);
      }
      // Start moving the first stone
      this._hand._firstMovingStone = 0;
      this._hand._delayMove = 0.0;
      this._hand._lastMovingStone = 0;
      this.UpdateInfo();
    }
  } catch (err) {
    console.log("CaptureStone " + err.stack);
  }
}

// ------------ Get a position on the border where to store 
// captured stones

AIware.prototype.GetPosPlayer = function(iPlayer) {
  var pos = {}
  pos._x = 0;
  pos._y = 0;
  pos._z = 0;
  try {
    if (iPlayer == 0) {
      pos._x = 650.0 - this._score[iPlayer] * this._sizeStone * 0.5;
      pos._y = 30.0;
    } else {
      pos._x = 50.0 + this._score[iPlayer] * this._sizeStone * 0.5;
      pos._y = 280.0;
    }
    pos._z = this._score[iPlayer];
  } catch (err) {
    console.log("GetPosPlayer " + err.stack);
  }
  return pos;
}

// ------------ Get the hole index from x,y pos in document

AIware.prototype.GetHoleAtPos = function(x, y) {
  var ret = -1;
  try {
    for (var iPlayer = 0; iPlayer < nbPlayer; iPlayer++) {
      for (var iHole = 0; iHole < nbHolePlayer; iHole++) {
        var cx = 105 + iHole * 100;
        var cy = 105 + iPlayer * 100;
        var d = Math.sqrt((cx - x) * (cx - x) + 
          (cy - y) * (cy - y));
        if (d < this._holeSize) {
          ret = iHole + iPlayer * nbHolePlayer;
          if (ret < nbHolePlayer) {
            ret = nbHolePlayer - ret - 1;
          }
        }
      }
    }
  } catch (err) {
    console.log("GetHoleAtPos " + err.stack);
  }
  return ret;
}

// ------------ Move the stones currently in hand

AIware.prototype.HandMoveStone = function() {
  try {
    // Check for stone at destination
    var iStone = this._hand._stones[this._hand._lastMovingStone];
    var stone = this._stones[iStone];
    if (Math.abs(stone._pos._x - stone._moveTo._x) < 1.0 && 
      Math.abs(stone._pos._y - stone._moveTo._y) < 1.0) {
      // This stone has arrived at destination, stop it.
      stone._speed = 0.0;
      if (stone._moveToHole != -1) {
        // If it arrived at a hole, add it to this hole
        this.AddStoneToHole(iStone, stone._moveToHole);
      }
      // Update the index of moving stone in hand
      (this._hand._lastMovingStone)++;
    }
    // Update the moving stones' position
    for (var iStone = this._hand._lastMovingStone;
      iStone < this._hand._firstMovingStone; iStone++) {
      this.UpdateStonePos(this._hand._stones[iStone]);
    }
    // Start moving one more stone if there are yet unmoving one
    if (this._hand._firstMovingStone < this._hand._nbStone) {
      // Artificially delay the start for aesthetic purpose
      this._hand._delayMove += 0.2;
      if (this._hand._delayMove > this._hand._firstMovingStone) {
        (this._hand._firstMovingStone)++;
      }
    }
  } catch (err) {
    console.log("HandMoveStone " + err.stack);
  }
}

// ------------ Check the board status

AIware.prototype.CheckBoard = function() {
  try {
    // Check for captured stones
    var iOpp = 1 - this._curPlayer;
    var flagCapture = 0;
    if (this._hand._lastHole >= iOpp * nbHolePlayer &&
      this._hand._lastHole < (iOpp + 1) * nbHolePlayer) {
      for (var iHole = this._hand._lastHole; 
        iHole >= iOpp * nbHolePlayer; iHole--) {
        if (this._holes[iHole]._nbStone == 2 || 
          this._holes[iHole]._nbStone == 3) {
          this.CaptureStone(iHole, this._curPlayer);
          this._status = gameWaiting;
          flagCapture= 1;
        } else {
          iHole = 0;
        }
      }
    }
    // Get the number of stones in opp holes
    var nbOppStone = 0;
    for (var iHole = iOpp * nbHolePlayer; 
      iHole < (iOpp + 1) * nbHolePlayer; iHole++) {
      nbOppStone += this._holes[iHole]._nbStone;
    }
    // If the opponent is starving
    if (nbOppStone == 0) {
      if (flagCapture == 1) {
        // If there has been captured stones, it means the current
        // player has starved the opponent. The current player looses.
        console.log("Player " + this._curPlayer + 
          " eliminated because he starved the opponent");
        this._score[iOpp] = 48;
        this._score[this._curPlayer] = 0;
        this.GameOver();
        this.UpdateInfo();
      } else {
        // If there was no captured stones, it means the opponent
        // starved itself. The current player catches all his own stones.
        for (var iHole = this._curPlayer * nbHolePlayer; 
          iHole < (this._curPlayer + 1) * nbHolePlayer; iHole++) {
          this.CaptureStone(iHole, this._curPlayer);
        }
        console.log("Game ends because player " + iOpp +
          " has no more stones");
        this.GameOver();
        this.UpdateInfo();
      }
    } else if (this._score[0] > nbStone * 0.5 || 
        this._score[1] > nbStone * 0.5) {
      // If one of the player has captured more than half the stones
      // the game ends.
      console.log("Game ends by score");
      this.GameOver();
      this.UpdateInfo();
    } else if (flagCapture == 0) {
      // If there was no capture, resume the game with the next player
      this._status = gameRunning;
      this.NextPlayer();
      if (this._curPlayer == idAI) {
        // If the next player is the A.I., request its move
        this.RequestMoveFromAI();
      }
    }
  } catch (err) {
    console.log("CheckBoard " + err.stack);
  }
}

// ------------ Function called when the game ends

AIware.prototype.GameOver = function() {
  try {
    // If the game is not already over
    if (this._status != gameOver) {
      if (this._score[idAI] > this._score[idHuman]) {
        this.AIWin();
      } else if (this._score[idAI] < this._score[idHuman]) {
        this.HumanWin();
      } else {
        this.Tie();
      }
      // Set the status of the game to over
      this._status = gameOver;
      this._nbTurn = 0;
    }
  } catch (err) {
    console.log("GameOver " + err.stack);
  }
}

// ------------ Hand tick function

AIware.prototype.HandTick = function() {
  try {
    if (this._status == gameWaiting || 
      this._status == gameOver) {
      // if we have moving stones in hand
      if (this._hand._nbStone > 0) {
        if (this._hand._lastMovingStone != this._hand._nbStone) {
          // There is still moving stones
          this.HandMoveStone();
        } else {
          // No more moving stones
          // Empty the hand
          var iStone = this._hand._stones[this._hand._nbStone - 1];
          var stone = this._stones[iStone];
          this._hand._lastHole = stone._moveToHole;
          this._hand._nbStone = 0;
          this._hand._firstMovingStone = 0;
          this._hand._delayMove = 0.0;
          this._hand._lastMovingStone = 0;
        }
      } else {
        // No more moving stones in hand 
        if (this._status == gameWaiting) {
          this._status = gameChecking;
        }
      }
    } else if (this._status == gameChecking) {
      // Check the board
      this.CheckBoard();
    }
  } catch (err) {
    console.log("HandTick " + err.stack);
  }
}

// ------------ Move turn to next player

AIware.prototype.NextPlayer = function() {
  try {
    if (this._curPlayer == idHuman) {
      this._curPlayer = idAI;
    } else {
      this._curPlayer = idHuman;
    }
    this.UpdateInfo();
    $("#divTurn").addClass("animated zoomIn");
    setTimeout(function(){
      $("#divTurn").removeClass("animated zoomIn");
    }, 1000);
  } catch (err) {
    console.log("NextPlayer " + err.stack);
  }
}

// ------------ Process data returned from AI

AIware.prototype.ProcessAIMove = function(data) {
  try {
    // Interpret data at JSON format
    PHPExecData = JSON.parse(data);
    // Get the played hole
    var iHole = parseInt(PHPExecData.move[0]);
    if (iHole != -1) {
      // Playe the A.I. move
      this.PlayMove(iHole);
    } else {
      $("#divTurn").html("A.I. failure: " + PHPExecData.error + 
        " Sorry, start again.");
    }
  } catch (err) {
    console.log("ProcessAIMove " + err.stack);
  }
}
// ------------ Request move from A.I.

AIware.prototype.RequestMoveFromAI = function() {
  try {
    // Prepare the arguments
    // level score[0] score[1] nbStoneHole[0..11]
    var usrInput = "";
    usrInput += this._level;
    usrInput += " " + this._score[0];
    usrInput += " " + this._score[1];
    for (var iHole = 0; iHole < nbHole; iHole++) {
      usrInput += " " + this._holes[iHole]._nbStone;
    }
    // Prepare the url for the PHP interfacing with the binary executable
    url = "./requestMove.php?arg=" + usrInput;
console.log(url);
    // Create the HTTP request entity
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest();
    } else {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          // The request was successful, return the JSON data
          data = xmlhttp.responseText;
        } else {
          // The request failed, return error as JSON
          data ="{\"move\":[\"-1\"],\"error\":\"HTTPRequest failed : " + 
            xmlhttp.status + "\"}";
        }
        // Process the returned data from the binary executable
        theAIware.ProcessAIMove(data);
      }
    };
    // Send the HTTP request
    xmlhttp.open("GET", url);
    xmlhttp.send();
  } catch (err) {
    console.log("RequestMoveFromAI " + err.stack);
  }
}

// ------------ OnLoad function

function BodyOnLoad() {
  try {
    // Create the stones div
    for (var iStone = 0; iStone < nbStone; iStone++) {
      var div = document.createElement("div");
      div.setAttribute("class", "divStone");
      var id = "divStone" + iStone;
      div.setAttribute("id", id);
      var imgStone = "url('./Img/stone";
      if (iStone < 10) imgStone += "0";
      imgStone += iStone + ".gif')";
      div.style.backgroundImage = imgStone;
      $("#divBoard").append(div);
    }
    // Create the AIware entity
    theAIware = new AIware();
    // Create the div to display the nb of stone in holes
    for (var iPlayer = 0; iPlayer < nbPlayer; iPlayer++) {
      for (var iHole = 0; iHole < nbHolePlayer; iHole++) {
        var div = document.createElement("div");
        div.setAttribute("class", "divNbStoneHole");
        var id = "divNbStoneHole" + (iPlayer * nbHolePlayer + iHole);
        div.setAttribute("id", id);
        var xy = 
          theAIware.GetCenterPosHole(iPlayer * nbHolePlayer + iHole);
        xy._x += theAIware._holeSize;
        xy._y += theAIware._holeSize;
        var pos = "left:";
        pos += xy._x;
        pos += "px;top:";
        pos += xy._y;
        pos += "px;";
        div.setAttribute("style", pos);
        div.innerHTML = nbStoneHoleInit;
        $("#divBoard").append(div);
      }
    }
    // Bind events
    document.onclick = documentOnClick;
    window.onbeforeunload = windowUnload;
    // Set tick function for animation
    $("#rngSpeedAnimation").val(50.0);
    theAIware._handTickID = setInterval(HandTick, handTickInterval);
    // Preload images for fast rendering
    for (var iImg = 0; iImg < nbHole; iImg++) {
      preloadImg[iImg] = new Image();
      preloadImg[iImg].src = "./Img/board" + iImg + ".jpg"
    }
    preloadImg[nbHole] = new Image();
    preloadImg[nbHole].src = "./Img/board.jpg"
    // Turn on the display of the number of stones in holes
    SwitchDisplayNbStoneHole();
  } catch (err) {
    console.log("BodyOnLoad " + err.stack);
  }
}

// ------------ function called when the user qui or refresh the page

function windowUnload() {
  try {
    if (theAIware._nbTurn > 2) {
      console.log("Human resigns");
      theAIware.HumanResign();
    }
  } catch (err) {
    console.log("windowUnload " + err.stack);
  }
}

// ------------ hook for theAIware.HandTick

function HandTick() {
  try {
    theAIware.HandTick();
  } catch (err) {
    console.log("HandTick " + err.stack);
  }
}

// ------------ event listener for click on document

function documentOnClick(event) {
  try {
    // Get the index of the clicked hole
    var divBoard = document.getElementById("divBoard");
    var x = event.clientX - divBoard.offsetLeft +
      document.body.scrollLeft + window.pageXOffset;
    var y = event.clientY - divBoard.offsetTop +
      document.body.scrollTop + window.pageYOffset;
    var iHole = theAIware.GetHoleAtPos(x, y);
    var divBoard = document.getElementById('divBoard');
    if (iHole != -1) {
      // If the user has clicked on a hole,
      // If the user has clicked on the currently selected hole
      if (theAIware._selectedHole == iHole) {
        // Execute the second click
        documentOnSndClick(event);
        // Unselect hole
        theAIware._selectedHole = -1;
        // Refresh the board image
        divBoard.style.backgroundImage =
          "url('./Img/board.jpg')";
      } else {
        theAIware._selectedHole = iHole;
        divBoard.style.backgroundImage =
          "url('./Img/board" + iHole + ".jpg')";
      }
    } else {
      // If the user has click out of the holes, 
      // cancel selected hole and refresh board image
      theAIware._selectedHole = -1;
      divBoard.style.backgroundImage =
        "url('./Img/board.jpg')";
    }
    // Update info about current selected hole
    var html = theAIware.GetInfoSelectedHole();
    $("#divInfoHole").html(html);
    CancelTxtSelection();
  } catch (err) {
    console.log("documentOnClick() " + err.stack);
  }
}

// ------------ event listener for second click on document

function documentOnSndClick(event) {
  try {
    // Get the index of the clicked hole
    var divBoard = document.getElementById("divBoard");
    var x = event.clientX - divBoard.offsetLeft +
      document.body.scrollLeft + window.pageXOffset;
    var y = event.clientY - divBoard.offsetTop +
      document.body.scrollTop + window.pageYOffset;
    var iHole = theAIware.GetHoleAtPos(x, y);
    // If the user has clicked on the selected hole
    if (iHole != -1 && iHole == theAIware._selectedHole) {
      // Execute the click on the selected hole
      theAIware.ClickHole(iHole);
    }
    CancelTxtSelection();
  } catch (err) {
    console.log("divBoardOnSndClick() " + err.stack);
  }
}

// ------------ function to cancel text selection due to click on board

function CancelTxtSelection() {
  try {
    if (window.getSelection) {
      if (window.getSelection().empty) {
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {
      document.selection.empty();
    }
  } catch (err) {
    console.log("CancelTxtSelection() " + err.stack);
  }
}

// ------------ function to display the rules

function ShowRules() {
  try {
    $("#divRules").css("visibility", "visible");
  } catch (err) {
    console.log("ShowRules() " + err.stack);
  }
}

// ------------ function to hide the rules

function HideRules() {
  try {
    $("#divRules").css("visibility", "hidden");
  } catch (err) {
    console.log("HideRules() " + err.stack);
  }
}

// ------------ function to display the settings

function ShowSettings() {
  try {
    $("#divSettings").css("visibility", "visible");
  } catch (err) {
    console.log("ShowSettings() " + err.stack);
  }
}

// ------------ function to hide the rules

function HideSettings() {
  try {
    $("#divSettings").css("visibility", "hidden");
  } catch (err) {
    console.log("HideSettings() " + err.stack);
  }
}

// ------------ hook for the event onclick on imgDisplayNbStone

function SwitchDisplayNbStoneHole() {
  try {
    if (theAIware._displayNbStoneHole == true) {
      $(".divNbStoneHole").css("visibility", "hidden");
      $("#imgDisplayNbStone").attr("src", "./Img/toggleOff.gif");
      $("#spanDisplayNbStone").html("no");
      theAIware._displayNbStoneHole = false;
    } else {
      $(".divNbStoneHole").css("visibility", "visible");
      $("#imgDisplayNbStone").attr("src", "./Img/toggleOn.gif");
      $("#spanDisplayNbStone").html("yes");
      theAIware._displayNbStoneHole = true;
    }
  } catch (err) {
    console.log("SwitchDisplayNbStoneHole() " + err.stack);
  }
}

// ------------ hook for the event onchange on rngSpeedAnimation

function SetSpeedAnimation() {
  try {
    handTickInterval = $("#rngSpeedAnimation").val();
    clearInterval(theAIware._handTickID);
    theAIware._handTickID = setInterval(HandTick, handTickInterval);
  } catch (err) {
    console.log("SetSpeedAnimation() " + err.stack);
  }
}

