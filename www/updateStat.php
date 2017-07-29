 <?php 
  /* ============= updateStat.php =========== */
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
    // Check arguments validity
    if (isset($_GET["l"]) && isset($_GET["c"]) && 
      is_numeric($_GET["l"]) && is_numeric($_GET["c"]) &&
      $_GET["l"] >= 0 && $_GET["l"] <= 3 &&
      $_GET["c"] >= 0 && $_GET["c"] <= 3) {
      // Get the date
      $dateGame = date("Y-m-d H:i:s");
      // Get the country of the user
      $country = GetCountryFromIP();
      // Save the result
      SaveOneResult($dateGame, $country, $_GET["l"], $_GET["c"]);
    }
  } catch (Exception $e) {
     ManageException("updateStat.php " . $e);
  }
?>
