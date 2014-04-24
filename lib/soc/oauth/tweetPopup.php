



<!doctype html>
<html lang="en">
<head>
<link rel="stylesheet" href="/_dev/style/twpop.css">



	<title>Tweet This Article</title>

</head>
<body>
	<?php include('shorten.php'); ?>
<!--
	<div class="postTweet">
	
		<textarea id="writeTweet" rows="4" cols="50"><?php echo $_GET[t]; ?> on <?php echo $link; ?> via @BodeggaNYC</textarea>
		<div id="charCount">118</div>
		<button>Post</button>

	</div>
-->

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script src="//code.jquery.com/ui/1.10.4/jquery-ui.js"></script>
	<script src="/_dev/app.js"></script>
	<script>
	$( document ).ready(function() {
	   app.social.twitter.init_popup();
	});
	</script>

</body>
</html>