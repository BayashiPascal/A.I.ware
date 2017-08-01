<?php 
  // ------------------ index.php --------------------->
  // Start the PHP session
  session_start();

  // Ensure no message will interfere with output
  ini_set('display_errors', 'Off');
  error_reporting(0);

  // Turn on display of errors and warning for debug
  /*ini_set('display_errors', 'On');
  error_reporting(E_ALL ^ E_WARNING);
  error_reporting(E_ALL | E_STRICT);*/

  // Include the PHP files
  include("./db.php");

  // Create the statistics database if requested
  if ($_GET["installDB"] == "1") {
    CreateDB();
  }
?>
<!DOCTYPE html>
<html>
  <head>

    <!-- Meta -->
    <meta content="text/html; charset=UTF-8;">
    <meta name="viewport" 
      content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="description" content="Mancala online game A.I.ware" />
    <meta name="keywords" content="mancala, awale, oware, game, artificial, intelligence, board, A.I.ware" />
      
    <!-- Icon -->
    <link rel="icon" type="image/x-icon" 
      href="./Img/aiware.ico" />

    <!-- Include the CSS files -->
    <link href = "./animate.css" 
      rel = "stylesheet" type = "text/css">
    <link href = "./aiware.css" 
      rel = "stylesheet" type = "text/css"> 

    <!-- Include the JS files -->
    <script charset = "UTF-8" src = "./jquery.min.js"></script>
    <script charset = "UTF-8" src = "./aiware.js"></script>

    <title>A.I.ware</title>
  </head>
  <body onload = 'BodyOnLoad();'>
    <!-- Main div -->
    <div id = "divMain">
      
      <!-- Title div -->
      <div id = "divTitle">
        A.I.ware
      </div>
      
      <!-- Main div -->
      <div id = "divBoard">

      </div>
      
      <!-- Info div -->
      <div id = "divInfo">
        <div id = "divScore"></div>
        <div id = "divTurn"></div><br>
        <div id = "divInfoHole"></div>
      </div>
      
      <!-- Cmd div -->
      <div id = "divCmd">
        <select id = "selLevel" onChange = "theAIware.InitNewGame();">
          <option value = "0">Beginner level</option>
          <option value = "1">Easy level</option>
          <option value = "2">Intermediate level</option>
          <option value = "3">Strong level</option>
        </select>
        <input type = "button" value = "Start a new game" 
          onclick = "theAIware.InitNewGame();">
        <input type = "button" value = "Show rules" 
          onclick = "ShowRules();">
      </div>

      <!-- footer div -->
      <div id = "divFooter">
        Copyright <a href="mailto:Pascal@BayashiInJapan.net">
            P. Baillehache
        </a>, 2017, 
        <a href="showStat.php" target="_blank">Statistics</a>, 
        <a href="doc.pdf" target="_blank">Documentation</a>.
      </div>

    </div>

    <!-- Rules div -->
    <div id = "divRules">
      <div id = "divRulesContent">
        <img src = "./Img/close.gif" id = "imgRulesClose"
          onclick = "HideRules();">
        <div id = "divRulesTitle">- Rules -</div>
        <div class = "divOneRule">
          The game of Oware is a game among the Mancala family board games. It has many variants and many names as it has been played all around the world since hundreds of years. A.I.ware is an online version of this game where the human player can play against an artifical intelligence. The rules and how to play are explained below.
        </div>
        <div class = "divOneRule">
          The game is played between two players (the Human and the A.I.) with a board and 48 stones. The board has 12 holes divided into 2 lines. The 6 holes on the top line are the A.I. territory. The 6 holes on the bottom line are the Human territory.
        </div>
        <img src = "./Img/rules01-1.gif" class = "imgRule"
          style = "height: 100px;">
        <img src = "./Img/rules01-2.gif" class = "imgRule"
          style = "height: 150px;">
        <div class = "divOneRule">
          To start a new game, select the level of the A.I. (beginner, easy, intermediate, strong) and click "Start a new game". The 48 stones are distributed into the 12 holes, 4 stones per hole.
        </div>
        <img src = "./Img/rules02-1.gif" class = "imgRule">
        <div class = "divOneRule">
          Players play one at a time. The current player turn is displayed below the board. The current player choose one hole containing stones in its territory. Stones in the choosen hole are moved in the following holes, one stone per hole, in a counter clockwise order. To select a hole, click on it and it will display below the board the number of stones inside. To play this hole, click on it a second time.
        </div>
        <img src = "./Img/rules03-1.gif" class = "imgRule"><br>
        <img src = "./Img/rules03-2.gif" class = "imgRule">
        <div class = "divOneRule">
          When the last moved stone arrives in a hole where there is already 1 or 2 stones, the current player captures all the stones in this hole (2 or 3 with the moved stone). Then, if the previous hole contains 2 or 3 stones, they are captured too and so on until we reach a hole with a number of stones different from 2 or 3 or go out of the current player's territory.
        </div>
        <img src = "./Img/rules04-1.gif" class = "imgRule"><br>
        <img src = "./Img/rules04-2.gif" class = "imgRule"><br>
        <img src = "./Img/rules04-3.gif" class = "imgRule">
        <div class = "divOneRule">
          If the current player chooses a hole with more than 11 stones, the distibution of stones will loop back to the starting hole. In this case the starting hole is jumped over and the distribution continue with its neighbour.
        </div>
        <img src = "./Img/rules05-1.gif" class = "imgRule"><br>
        <img src = "./Img/rules05-2.gif" class = "imgRule">
        <div class = "divOneRule">
          The game ends when one player has captured at least half of the stones (25 stones or more). The winner is the player who has captured the more stones.
        </div>
        <div class = "divOneRule">
          Special case 1. If the current player has no more stone in its territory, the opponent automatically captures all the stones in its own territory and the game ends.
        </div>
        <div class = "divOneRule">
          Special case 2. If the current players captures at once all the stones in the opponent's territory, he immediately looses the game.
        </div>
      </div>
    </div>
      
  </body>

</html>
