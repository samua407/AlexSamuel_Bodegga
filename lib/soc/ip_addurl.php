<?php

require 'php-sdk/src/temboo.php';


$session = new Temboo_Session('aesam', 'bodegga', '958c74b7-2e27-4c66-9');

$addURL = new Instapaper_AddURL($session);

// Get an input object for the Choreo
$addURLInputs = $addURL->newInputs();

// Set inputs
$addURLInputs->setUsername("$_GET[u]")->setPassword("$_GET[p]")->setURL("$_GET[url]")->setTitle("$_GET[t]");

/* echo $addURLInputs; */

// Execute Choreo and get results
$addURLResults = $addURL->execute($addURLInputs)->getResults();

$jsonResponse = $addURLResults->getResponse();
$echo = json_decode($jsonResponse);

echo $echo;
    
?>
