<?php

if($_SERVER['REQUEST_METHOD'] == 'GET') {
	
	$url = (key_exists('res', $_GET) ? $_GET['res'] : '');
	
	if($url == '') {
		die();
	}
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']); // mimic the same user agent as used for this request
	curl_setopt($ch, CURLOPT_URL,$url);
	curl_setopt($ch, CURLOPT_FAILONERROR, true);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_AUTOREFERER, true);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER,true);
	curl_setopt($ch, CURLOPT_TIMEOUT, 10);
	$css = curl_exec($ch);
	
	if (!$css) {
		echo "";
		die();
	}
	
	curl_close($ch);
	header("Content-Type: text/css");
	
	$dir = dirname($url) . "/";
	
	// clean all css imports
	$css = preg_replace_callback('%\@import url\((.+)\)%i', 'cleanImports', $css);
	// TODO clean all image resources
	
	echo $css;
}

function cleanImports($matches) {
	if(substr($matches[1], 0, 4) != "http") {
		return "@import url(p.php?res=" . $GLOBALS["dir"] . $matches[1] . ")";
	}
}
?>