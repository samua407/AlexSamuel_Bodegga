<?php
$file = 'tweet.txt';
$tweet = $_GET[tweet];

//clear current tweet
$fh = fopen( $file, 'w' );
fclose($fh);

//add current tweet to file
$current = file_get_contents($file);
$current .= $tweet;
file_put_contents($file, $current);

echo 'done';
?>
