<?php
/* error_reporting(E_ALL); */
require 'php-sdk/src/temboo.php';

$query = $_GET[q];

$session = new Temboo_Session('aesam', 'bodegga', '958c74b7-2e27-4c66-9');

$tweets = new Twitter_Search_Tweets($session);

// Get an input object for the Choreo
$tweetsInputs = $tweets->newInputs();

// Set inputs

$tweetsInputs->setAccessToken("30261797-mdtdN4QPo7Kez3eqPj5gzWUuROpx5i0CPJTaemMFN")->setQuery($query)->setAccessTokenSecret("hs4f63SHgOXPjwhCKj1haUQo5pZTN47ArlHNJjTRsNPWQ")->setConsumerSecret("cEqMowZ8aaBBAoHl5AHOWRJaN8lcZhZmhKrj1bY8108")->setConsumerKey("JYCWZrLV6EAfCqfGbNUnSA");



// Execute Choreo and get results
$tweetsResults = $tweets->execute($tweetsInputs)->getResults();

if($tweetsResults){
	
	$jsonResponse = $tweetsResults->getResponse();
	$arr = json_decode($jsonResponse);
	$results = $arr->statuses;
	$json = json_encode($results);
	echo($json);
};



?>
