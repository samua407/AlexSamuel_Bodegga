<?php
$p = $_GET[p];

$salt = mcrypt_create_iv(22, MCRYPT_DEV_URANDOM);
$salt = base64_encode($salt);
$salt = str_replace('+', '.', $salt);
$hash = crypt($p, '$2y$10$'.$salt.'$');

// Connect To Server
$username = "alex";
$password = "sql11222";
$db = "main";

$sql = "INSERT INTO ip (o, n) VALUES ('" . $p . "', '" . $hash . "')";

$con=mysqli_connect("localhost",$username,$password,$db);

// Check connection
if (mysqli_connect_errno())
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }

$result = mysqli_query($con, $sql);

if($result){
	echo $hash;
};

mysqli_close($con);

?>