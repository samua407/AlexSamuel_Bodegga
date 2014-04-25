<?php
$p = $_GET[p];

$salt = mcrypt_create_iv(22, MCRYPT_DEV_URANDOM);
$salt = base64_encode($salt);
$salt = str_replace('+', '.', $salt);
$hash = crypt($p, '$2y$10$'.$salt.'$');

echo $hash

?>