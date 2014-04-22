
<?php

// Connect To Server
$username = "alex";
$password = "sql11222";
$db = "main";
$p = $_GET["p"];

$sql = 'select o from ip where n = "' . $p . '"';

$con=mysqli_connect("localhost",$username,$password,$db);

// Check connection
if (mysqli_connect_errno())
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }

$result = mysqli_query($con, $sql);
$array = mysqli_fetch_array($result);

$deCpass = $array[0];
//echo $password;

mysqli_close($con);

?>