<?php
	
/**
 * 	@author Dominik Guzei
 *	Project: StyleKit - Qualifikationsprojekt 1
 *	Fachhochschule Salzburg
 *
 * 	PROXY SCRPIPT - takes a 'site' parameter which represents the url that gets fetched
 *	by curl. The returned source is then modified to change all src and href
 *	to absolute urls and links to point to this proxy script. This enables the user to 
 *	click on links on the websites which get relaid to this script and return the sandbox 
 *	source again. 
 */
	
if($_SERVER['REQUEST_METHOD'] == 'GET') {
	
	$url = (key_exists('site', $_GET) ? $_GET['site'] : '');
	
	if($url == '') {
		die();
	}
	
	// filter out protocoll
	preg_match('@http\w?://@i',$url, $treffer);
	$protocol = $treffer;
	if(sizeof($protocol) == 0) {
		$protocol = "http://";
	} else {
		$protocol = $protocol[0];
	}
			
	// filter out domain
	preg_match('@^(?:http://)?([^/]+)@i',$url, $treffer);
	$domain = $treffer[1];
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']); // mimic the same user agent as used for this request
	curl_setopt($ch, CURLOPT_URL,$url);
	curl_setopt($ch, CURLOPT_FAILONERROR, true);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_AUTOREFERER, true);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER,true);
	curl_setopt($ch, CURLOPT_TIMEOUT, 10);
	$html = curl_exec($ch);
	
	if (!$html) {
		echo "<html><head></head><body><p>The URL you entered could not be found!</p></body></html>";
		die();
	}
	curl_close($ch);
	
	$dom = new DOMDocument();
	@$dom->loadHTML($html);
	
	$xpath = new DOMXPath($dom);
	
	// correct urls for src and href attributes in the document
	$hrefs = $xpath->evaluate("//@src | //@href");
	
	for ($i = 0; $i < $hrefs->length; $i++) {
		$href = $hrefs->item($i);
		$url = $href->value;
		//echo $url  . "<br />";
		
		preg_match('@http\w?://@i',$url, $treffer);
		//var_dump($treffer);
		if(sizeof($treffer) == 0) {
			// here are only relative links
			$url = $protocol . $domain . "/" . $url;
			$safe_value = preg_replace('/&(?!\w+;)/', '&amp;', $url);
			if($safe_value) {
				$href->value = $safe_value;
				//echo "corrected: " . $safe_value  . "<br />";
			}
		}
		
		if($href->parentNode->nodeName == "a") {
			if($domain != $_SERVER['HTTP_HOST'] && $href->parentNode->getAttribute("class") != "stylekit-extern-link") {
				$href->value = str_replace("&", "&amp;", "extern.php?site=" . $href->value);
			}
		}	
		if($href->parentNode->nodeName == "link" && $href->parentNode->getAttribute("type") == "text/css") {
			if($domain != $_SERVER['HTTP_HOST']) {
				$href->value = str_replace("&", "&amp;", "./p.php?res=" . $href->value);
				$href->parentNode->setAttribute("rel", "stylesheet");
			}
		}
	}
	$html = $dom->saveHTML();
	$html = preg_replace('/<\/body>/', '<script id="webViewInitScript" type="text/javascript">(function(){window.frameElement._webViewInit();})();</script></body>', $html);
	//$html = preg_replace('/<\/head>/', '<script type="text/javascript" src="https://getfirebug.com/firebug-lite.js"></script></head>', $html);
	echo $html;

} else {
	die("wrong url");	
}
	
?>