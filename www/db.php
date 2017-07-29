<?php 
  /* ============= db.php =========== */

  // Function to manage exception
  function ManageException($msg) {
    try {
      // Send an email to the developper with the exception message
      $head = "From:you@yourwebsite.net\r\n";
      $head .= "Content-type: text/plain; charset=UTF-8\r\n";
      $email = "you@yourwebsite.net";
      $subject = "ManageException on AIware";
      mail($email, $subject, $msg, $head);
    } catch (Exception $e) {
      echo "ManageException : " . $e->getMessage() . "\n";
    }
  }

  // Function to connect to the database
  function ConnectDatabase() {
    try {
      // Connection information
      $servername = "servername";
      $username = "username";
      $password = "password";
      $dbname = "dbname";

      // Create connection
      $conn = new mysqli(
        $servername, 
        $username, 
        $password,
        $dbname);
      // Set the charset
      $conn->set_charset("utf8");
      // Return the connection object
      return $conn;
    } catch (Exception $e) {
      ManageException("ConnectDatabase : " . $e->getMessage() . "\n");
      return null;
    }
  }
  
  // Function to close the connection to the database
  function CloseDatabase($conn) {
    try {
      $conn->close();
    } catch (Exception $e) {
      ManageException("CloseDatabase : " . $e->getMessage() . "\n");
    }
  }

  // Function to create the database tables
  function CreateDB() {
    try {
      // Open a connection to the database;
      $conn = ConnectDatabase();
      if ($conn->connect_error) {
        throw new Exception("Error connecting to DB. " . 
          $conn->connect_error);
        return;
      } 
      // Create the table
      $sql = "CREATE TABLE IF NOT EXISTS AIwareStat (
        Ref INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
        DateGame DATETIME,
        Country CHAR(2),
        Level INT,
        Result INT
        ) COLLATE utf8_bin";
      if ($conn->query($sql) === true) {
        echo "Table AIwareStat created successfully<br>";
      } else {
        throw new Exception("Error creating table. " . $conn->error);
      }
      // Close the connection to the database
      CloseDatabase($conn);
    } catch (Exception $e) {
      ManageException("CreateDB : " . $e->getMessage() . "\n");
    }
  }

  // Function to get the country code ('FR') from the IP
  function GetCountryFromIP() {
    try {
      $client  = @$_SERVER['HTTP_CLIENT_IP'];
      $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
      $remote  = @$_SERVER['REMOTE_ADDR'];
      $country  = "??";
      if(filter_var($client, FILTER_VALIDATE_IP)){
        $ip = $client;
      }elseif(filter_var($forward, FILTER_VALIDATE_IP)){
        $ip = $forward;
      }else{
        $ip = $remote;
      }
      $ip_data = @json_decode(file_get_contents("http://www.geoplugin.net/json.gp?ip=".$ip));    
      if($ip_data && $ip_data->geoplugin_countryName != null){
        $country = $ip_data->geoplugin_countryCode;
      }
      return $country;
    } catch (Exception $e) {
      ManageException("GetCountryFromIP : " . $e->getMessage() . "\n");
    }
  }

  // Function to save one game result
  function SaveOneResult($dateGame, $country, $level, $result) {
    try {
      $conn = ConnectDatabase();
      if ($conn->connect_error) {
        throw new Exception("Error connecting to DB. " . 
          $conn->connect_error);
      }
      $sql = "INSERT INTO AIwareStat ";
      $sql .= "(Ref, DateGame, Country, Level, Result) ";
      $sql .= "VALUES (NULL, ?, ?, ?, ?)";
      $stmt = $conn->stmt_init();
      if (!$stmt->prepare($sql)) {
        throw new Exception("Prepare statement failed. " . $stmt->error);
      }
      $stmt->bind_param("ssii", $dateGame, $country, $level, $result);
      if (!$stmt->execute()) {
        throw new Exception("Execute statement failed. " . $stmt->error);
      }
      $stmt->close();
      CloseDatabase($conn);
    } catch (Exception $e) {
      ManageException("SaveOneResult : " . $e->getMessage() . "\n");
      CloseDatabase($conn);
    }
  }

  // Function to get all the game results
  function GetAllResult() {
    try {
      $conn = ConnectDatabase();
      if ($conn->connect_error) {
        throw new Exception("Error connecting to DB. " . 
          $conn->connect_error);
      }
      $sql = "SELECT Ref as Ref, ";
      $sql .= "DateGame as DateGame, ";
      $sql .= "Country as Country, ";
      $sql .= "Level as Level, ";
      $sql .= "Result as Result ";
      $sql .= "FROM AIwareStat ";
      $stmt = $conn->stmt_init();
      if (!$stmt->prepare($sql)) {
        throw new Exception("Prepare statement failed. " . $stmt->error);
      }
      if (!$stmt->execute()) {
        throw new Exception("Execute statement failed. " . $stmt->error);
      }
      $row = array();
      $stmt->bind_result(
        $row["Ref"], 
        $row["DateGame"], 
        $row["Country"], 
        $row["Level"], 
        $row["Result"]);
      $ret = array();
      while ($stmt->fetch()) {
        // Clone the returned array
        $narr = array();
        foreach ($row as $k => $v) { 
          $narr[$k] = $v ; 
        }
        $ret[] = $narr;
      }
      $stmt->close();
      CloseDatabase($conn);
      return $ret;
    } catch (Exception $e) {
      ManageException("GetAllResult : " . $e->getMessage() . "\n");
      CloseDatabase($conn);
    }
  }

  // Function to get win rate for a level
  function GetWinRate($level) {
    try {
      $conn = ConnectDatabase();
      if ($conn->connect_error) {
        throw new Exception("Error connecting to DB. " . 
          $conn->connect_error);
      }
      // Get the total number of games
      $sqlAll = "SELECT COUNT(Ref) ";
      $sqlAll .= "FROM AIwareStat ";
      $sqlAll .= "WHERE Level = ? ";
      $stmt = $conn->stmt_init();
      if (!$stmt->prepare($sqlAll)) {
        throw new Exception("Prepare statement failed. " . $stmt->error);
      }
      $stmt->bind_param("i", $level);
      if (!$stmt->execute()) {
        throw new Exception("Execute statement failed. " . $stmt->error);
      }
      $nbGame = 0;
      $stmt->bind_result($nbGame);
      $stmt->fetch();
      // Get the number of tie
      $sqlTie = $sqlAll . "AND Result = 3";
      if (!$stmt->prepare($sqlTie)) {
        throw new Exception("Prepare statement failed. " . $stmt->error);
      }
      $stmt->bind_param("i", $level);
      if (!$stmt->execute()) {
        throw new Exception("Execute statement failed. " . $stmt->error);
      }
      $nbTie = 0;
      $stmt->bind_result($nbTie);
      $stmt->fetch();
      // Get the number of Human win
      $sqlHuman = $sqlAll . "AND Result = 1";
      if (!$stmt->prepare($sqlHuman)) {
        throw new Exception("Prepare statement failed. " . $stmt->error);
      }
      $stmt->bind_param("i", $level);
      if (!$stmt->execute()) {
        throw new Exception("Execute statement failed. " . $stmt->error);
      }
      $nbHuman = 0;
      $stmt->bind_result($nbHuman);
      $stmt->fetch();
      // Get the number of A.I. win
      $sqlAI = $sqlAll . "AND (Result = 0 OR Result = 2)";
      if (!$stmt->prepare($sqlAI)) {
        throw new Exception("Prepare statement failed. " . $stmt->error);
      }
      $stmt->bind_param("i", $level);
      if (!$stmt->execute()) {
        throw new Exception("Execute statement failed. " . $stmt->error);
      }
      $nbAI = 0;
      $stmt->bind_result($nbAI);
      $stmt->fetch();
      $stmt->close();
      CloseDatabase($conn);
      $ret = array();
      $ret[0] = $nbGame;
      $ret[1] = $nbTie;
      $ret[2] = $nbHuman;
      $ret[3] = $nbAI;
      return $ret;
    } catch (Exception $e) {
      ManageException("GetWinRate : " . $e->getMessage() . "\n");
      CloseDatabase($conn);
    }
  }

  // Function to get access rate by day
  function GetAccessRateByDay() {
    try {
      $conn = ConnectDatabase();
      if ($conn->connect_error) {
        throw new Exception("Error connecting to DB. " . 
          $conn->connect_error);
      }
      // Get the total number of games
      $sql = "SELECT YEAR(DateGame) as Year, ";
      $sql .= "MONTH(DateGame) as Month, ";
      $sql .= "DAY(DateGame) as Day, COUNT(Ref) as Nb ";
      $sql .= "FROM AIwareStat ";
      $sql .= "GROUP BY YEAR(DateGame), MONTH(DateGame), ";
      $sql .= "DAY(DateGame) ";
      $sql .= "ORDER BY YEAR(DateGame) DESC, MONTH(DateGame) DESC, ";
      $sql .= "DAY(DateGame) DESC ";
      $sql .= "LIMIT 30 ";
      $stmt = $conn->stmt_init();
      if (!$stmt->prepare($sql)) {
        throw new Exception("Prepare statement failed. " . $stmt->error);
      }
      if (!$stmt->execute()) {
        throw new Exception("Execute statement failed. " . $stmt->error);
      }
      $row = array();
      $stmt->bind_result(
        $row["Year"], 
        $row["Month"], 
        $row["Day"], 
        $row["Nb"]);
      $ret = array();
      while ($stmt->fetch()) {
        // Clone the returned array
        $narr = array();
        foreach ($row as $k => $v) { 
          $narr[$k] = $v ; 
        }
        $ret[] = $narr;
      }
      $stmt->close();
      CloseDatabase($conn);
      return $ret;
    } catch (Exception $e) {
      ManageException("GetAccessRateByDay : " . $e->getMessage() . "\n");
      CloseDatabase($conn);
    }
  }

  // Function to get access rate by day
  function GetAccessRateByMonth() {
    try {
      $conn = ConnectDatabase();
      if ($conn->connect_error) {
        throw new Exception("Error connecting to DB. " . 
          $conn->connect_error);
      }
      // Get the total number of games
      $sql = "SELECT YEAR(DateGame) as Year, ";
      $sql .= "MONTH(DateGame) as Month, COUNT(Ref) as Nb ";
      $sql .= "FROM AIwareStat ";
      $sql .= "GROUP BY YEAR(DateGame), MONTH(DateGame) ";
      $sql .= "ORDER BY YEAR(DateGame) DESC, MONTH(DateGame) DESC ";
      $sql .= "LIMIT 12 ";
      $stmt = $conn->stmt_init();
      if (!$stmt->prepare($sql)) {
        throw new Exception("Prepare statement failed. " . $stmt->error);
      }
      if (!$stmt->execute()) {
        throw new Exception("Execute statement failed. " . $stmt->error);
      }
      $row = array();
      $stmt->bind_result(
        $row["Year"], 
        $row["Month"], 
        $row["Nb"]);
      $ret = array();
      while ($stmt->fetch()) {
        // Clone the returned array
        $narr = array();
        foreach ($row as $k => $v) { 
          $narr[$k] = $v ; 
        }
        $ret[] = $narr;
      }
      $stmt->close();
      CloseDatabase($conn);
      return $ret;
    } catch (Exception $e) {
      ManageException("GetAccessRateByMonth : " . $e->getMessage() . "\n");
      CloseDatabase($conn);
    }
  }

  // Function to get access rate by country
  function GetAccessRateByCountry() {
    try {
      $conn = ConnectDatabase();
      if ($conn->connect_error) {
        throw new Exception("Error connecting to DB. " . 
          $conn->connect_error);
      }
      // Get the total number of games
      $sql = "SELECT Country as Country, ";
      $sql .= "COUNT(Ref) as Nb ";
      $sql .= "FROM AIwareStat ";
      $sql .= "GROUP BY Country ";
      $sql .= "ORDER BY Nb DESC ";
      $stmt = $conn->stmt_init();
      if (!$stmt->prepare($sql)) {
        throw new Exception("Prepare statement failed. " . $stmt->error);
      }
      if (!$stmt->execute()) {
        throw new Exception("Execute statement failed. " . $stmt->error);
      }
      $row = array();
      $stmt->bind_result(
        $row["Country"], 
        $row["Nb"]);
      $ret = array();
      while ($stmt->fetch()) {
        // Clone the returned array
        $narr = array();
        foreach ($row as $k => $v) { 
          $narr[$k] = $v ; 
        }
        $ret[] = $narr;
      }
      $stmt->close();
      CloseDatabase($conn);
      return $ret;
    } catch (Exception $e) {
      ManageException("GetAccessRateByCountry : " . $e->getMessage() . "\n");
      CloseDatabase($conn);
    }
  }


?>
