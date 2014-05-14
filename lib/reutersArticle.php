
<?php

#---get url + html
$html = file_get_html($url);

#---get og:meta tags
libxml_use_internal_errors(true);
$doc = new DomDocument();
$doc->loadHTML($html);
$xpath = new DOMXPath($doc);
$query = '//*/meta[starts-with(@property, \'og:\')]';
$metas = $xpath->query($query);
foreach ($metas as $meta) {
    $property = $meta->getAttribute('property');
    $content = $meta->getAttribute('content');
    $ogmetas[$property] = $content;
}

$title = $ogmetas['og:title'];
$ogUrl = $ogmetas['og:url'];
$img = $ogmetas['og:image'];


#---get keyword:meta tags
$query2 = '//*/meta[starts-with(@name, \'keywords\')]';
$metas2 = $xpath->query($query2);
foreach ($metas2 as $meta2) {
    $property = $meta2->getAttribute('name');
    $content = $meta2->getAttribute('content');
    $keymetas[$property] = $content;
}
$keys = $keymetas['keywords'];


#---get date:meta tags
$query3 = '//*/meta[starts-with(@name, \'REVISION_DATE\')]';
$metas3 = $xpath->query($query3);
foreach ($metas3 as $meta3) {
    $property = $meta3->getAttribute('name');
    $content = $meta3->getAttribute('content');
    $timemetas[$property] = $content;
}
$time = $timemetas['REVISION_DATE'];


#---get body
$body = $html->find('#articleText');

foreach($body[0]->find('p') as $e) 
	$body_p = $body_p . $e->plaintext . '*#';

$body_p = preg_replace("/[\s-]+/", " ", $body_p);
$body_p = str_replace('"', '\"', $body_p);
$body_p = '' . $body_p;


?>



















