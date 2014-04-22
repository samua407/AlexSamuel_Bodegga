<?php

$longurl = $_GET[l];

$link = file_get_contents('http://is.gd/create.php?format=simple&url=' . $longurl);

if($link){


	echo '	
	<div class="postTweet">
	
		<textarea id="writeTweet" rows="4" cols="50">' . $_GET[t] . ' at '. $link . ' via @BodeggaNYC</textarea>
		<div id="charCount">118</div>
		<button>Post</button>

	</div>';

	
};

?>
