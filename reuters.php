<?

include('lib/simple_html_dom.php');

#---get url + html
$url = $_GET["url"];



if (strpos($url,'blog') !== false) { #if article url is a blog url, include blog
   include('lib/reutersBlog.php');
}else{
	include('lib/reutersArticle.php');
}

#---echo json
 echo '{"title":"' . $title . '", "img": ["' . $img . '"], "keys_all":"' . $keys . '", "story_url":"' . $ogUrl . '", "time":"' . $time . '", "body":"' . $body_p . '"}'; 


?>