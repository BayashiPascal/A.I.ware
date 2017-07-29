<?php
/* ============= showStat.php =========== */
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

  try {
    // Get the win rates
    $winRate = array();
    for ($iLevel = 0; $iLevel < 4; $iLevel++) {
      $winRate[$iLevel] = GetWinRate($iLevel);
    }
    
    // Get the access rate
    $accessRateByDay = GetAccessRateByDay();
    $accessRateByMonth = GetAccessRateByMonth();
    $accessRateByCountry = GetAccessRateByCountry();
  } catch (Exception $e) {
    ManageException("updateStat.php " . $e);
  }

  // Function to create one gauge
  function DivGauge($label, $width, $perc) {
    try {
      $block = "";
      $block .= "<div style='width:" . $width . "px;";
      $block .= "text-align:center;border: 1px solid rgb(255, 0, 0);";
      $block .= "position:relative;top:0px;left:0px;'>";
      $block .= "<div style='position:absolute;top:0px;left:0px;";
      $block .= "width:" . $perc . "%;height:100%;";
      $block .= "background-color: rgba(255, 0, 0, 0.3);'></div>";
      $block .= $label;
      $block .= "</div>";
      return $block;
    } catch (Exception $e) {
      return "DivWinRate : " . $e->getMessage() . "<br>";
    }
  }

  // Function to create the div for one win rate
  function DivWinRate($rate) {
    try {
      $block = "";
      $block .= "<div style='display:inline-block;margin-top:10px;'>";
      if ($rate[0] == 0) $rate[0] = 1;
      $perc = $rate[2] / $rate[0] * 100.0;
      $block .= DivGauge("Human : " . number_format($perc, 0) . "%", 200, $perc);
      $perc = $rate[3] / $rate[0] * 100.0;
      $block .= DivGauge("A.I.ware : " . number_format($perc, 0) . "%", 200, $perc);
      $perc = $rate[1] / $rate[0] * 100.0;
      $block .= DivGauge("Tie : " . number_format($perc, 0) . "%", 200, $perc);
      $block .= "in " . $rate[0] . " games";
      $block .= "</div>";
      return $block;
    } catch (Exception $e) {
      return "DivWinRate : " . $e->getMessage() . "<br>";
    }
  }

  // Function to create the div for access by day and month
  function DivAccessRate($rate) {
    try {
      $block = "";
      $block .= "<div style='display:inline-block;margin-top:10px;'>";
      // Search the maximum access rate
      $max = 0;
      foreach ($rate as $row) {
        if ($max < $row["Nb"]) {
          $max = $row["Nb"];
        }
      }
      // Display the dates
      foreach ($rate as $row) {
        $label = $row["Year"] . "-" . $row["Month"];
        if (isset($row["Day"])) 
          $label .= "-" . $row["Day"];
        $label .= ": " . $row["Nb"] . "<br>";
        $perc = $row["Nb"] / $max * 100.0;
        $block .= DivGauge($label, 200, $perc);
      }
      $block .= "</div>";
      return $block;
    } catch (Exception $e) {
      return "DivAccessRate : " . $e->getMessage() . "<br>";
    }
  }

  // Function to create the div for access by country
  function DivAccessRateByCountry($rate) {
    try {
      $block = "";
      $block .= "<div style='display:inline-block;margin-top:10px;'>";
      // Search the maximum access rate
      $max = 0;
      foreach ($rate as $row) {
        if ($max < $row["Nb"]) {
          $max = $row["Nb"];
        }
      }
      // Display the dates
      foreach ($rate as $row) {
        $label = $row["Country"];
        $label .= ": " . $row["Nb"] . "<br>";
        $perc = $row["Nb"] / $max * 100.0;
        $block .= DivGauge($label, 200, $perc);
      }
      $block .= "</div>";
      return $block;
    } catch (Exception $e) {
      return "DivAccessRate : " . $e->getMessage() . "<br>";
    }
  }
?>
<!DOCTYPE html>
<html>
  <head>

    <!-- Meta -->
    <meta content="text/html; charset=UTF-8;">
    <meta name="viewport" 
      content="width=device-width, initial-scale=1, maximum-scale=1">
      
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

    <title>A.I.ware</title>
  </head>
  <!--<body onload = 'BodyOnLoad();'>-->
    <!-- Main div -->
    <div id = "divMain">
      
      <!-- Title div -->
      <div id = "divTitle">
        A.I.ware
      </div>
      
      <div id = "divWinRate" class = "divTool">
        Win Rate
        <div id = "divCharts">
          <div class = "divChart">
            Beginner
<?php
  echo DivWinRate($winRate[0]);
?>            
          </div>
          <div class = "divChart">
            Easy
<?php
  echo DivWinRate($winRate[1]);
?>            
          </div>
          <div class = "divChart">
            Intermediate
<?php
  echo DivWinRate($winRate[2]);
?>            
          </div>
          <div class = "divChart">
            Strong
<?php
  echo DivWinRate($winRate[3]);
?>            
          </div>
        </div>
      </div>

      <div id = "divAccessRate" class = "divTool">
        Games played
        <div class = "divCharts">
          <div class = "divChart" style = "height: 240px;">
            By day
<?php
  echo DivAccessRate($accessRateByDay);
?>            
          </div>
          <div class = "divChart" style = "height: 240px;">
            By month
<?php
  echo DivAccessRate($accessRateByMonth);
?>            
          </div>
        </div>
      </div>

      <div id = "divAccessRateCountry" class = "divTool">
        Player's country
        <div class = "divCharts">
          <div class = "divChart" style = "height: 240px;">
<?php
  echo DivAccessRateByCountry($accessRateByCountry);
?>            
          </div>
        </div>
      </div>

      <!-- footer div -->
      <div id = "divFooter">
        Copyright <a href="mailto:Pascal@BayashiInJapan.net">
            P. Baillehache
        </a>, 2017, 
        <a href="index.php">A.I.ware</a>, 
        <a href="doc.pdf">Documentation</a>.
      </div>

    </div>
  </body>

</html>

