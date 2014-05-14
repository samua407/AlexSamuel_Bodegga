
<?php

#---get url + html
$html = file_get_html($url);

#---get title
foreach($html->find('h1') as $e) 
	$title = $e->plaintext;
	$title = str_replace('"', '\'', $title);


#---get img
$imgs = array();

foreach($html->find('#postcontent') as $e)
	foreach($e->find('img') as $i)
		array_push($imgs, $i->src);
				
if($imgs[0] != NULL){
	$img = $imgs[0];
}		

		
#---get keys
$keys = $html->find('.headerTopics');
$keys = $keys[0]->plaintext;
$keys = explode(" | ", $keys);
array_shift($keys);
foreach($keys as $k)
	$keys_all = $keys_all . $k . ', ';

#---get time
libxml_use_internal_errors(true);
$doc = new DomDocument();
$doc->loadHTML($html);
$xpath = new DOMXPath($doc);
$query3 = '//*/meta[starts-with(@name, \'CREATION_DATE\')]';
$metas3 = $xpath->query($query3);
foreach ($metas3 as $meta3) {
    $property = $meta3->getAttribute('name');
    $content = $meta3->getAttribute('content');
    $timemetas[$property] = $content;
}

$time = $timemetas['CREATION_DATE'];


#---get body
$body = $html->find('#postcontent');

foreach($body[0]->find('p') as $e) 
	$body_p = $body_p . $e->plaintext . '*#';

$body_p = preg_replace("/[\s-]+/", " ", $body_p);
$body_p = str_replace('"', '\"', $body_p);
$body_p = '' . $body_p;


?>



















