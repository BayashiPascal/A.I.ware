 <?php 
  /* ============= requestMove.php =========== */
  // Ensure no message will interfere with output
  ini_set('display_errors', 'Off');
  error_reporting(0);

  // Turn on display of errors and warning for debug
  /*ini_set('display_errors', 'On');
  error_reporting(E_ALL ^ E_WARNING);
  error_reporting(E_ALL | E_STRICT);*/

  // Start the PHP session
  session_start();

  // Include the PHP files
  include("./db.php");

  try {
    // Sanitize args
    if (isset($_GET["arg"])) {
      $match = preg_match("/^[0-9 ]+$/", $_GET["arg"]);
      if ($match == 0) {
        $_GET["arg"] = "";
      }
    } else {
      $_GET["arg"] = "";
    }
    if ($_GET["arg"] != "") {
      // Create the command
      $cmd = "./AIware ". $_GET["arg"];
      // Execute the command
      unset($output);
      unset($returnVal);
      exec($cmd, $output, $returnVal); 
      // Prepare the returned data
      $data["return"] = $returnVal;
      if ($returnVal == 0) {
        $data["error"] = "";
        $data["move"] = $output;
      } else {
        $data["error"] = "binary failure " . $returnVal;
        $data["move"] = -1;
      }
    } else {
      $data = array();
      $data["error"] = "no arguments";
      $data["move"] = -1;
      $data["return"] = 0;
    }
    // Convert the object to JSON format
    $ret = json_encode($data);
    // Return the JSON formatted result
    echo $ret;
  } catch (Exception $e) {
     ManageException("requestMove.php " . $e);
  }
?>
