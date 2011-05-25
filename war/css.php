<?php
/**
 * 	@author Dominik Guzei
 *	Project: StyleKit - Qualifikationsprojekt 1
 *	Fachhochschule Salzburg
 *
 * 	SERVICE to retrieve the css of a given project as file from the server
 */
require_once("functions.php");

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
	
	$id = (key_exists('id', $_GET) ? $_GET['id'] : false);
	
	if($id) {
		
		// secure the given id 
		$id = sanitize($id, false);
		
		$xmlFile = "projects/" . $id . ".xml";
			
		if (file_exists($xmlFile) && ($fp=fopen($xmlFile, "rb"))) {
			
			$xml = fread($fp, filesize($xmlFile));
			$doc = new DOMDocument();
			$doc->loadXML($xml);
			
			if($cssElem = $doc->getElementsByTagName("style")->item(0)) {
				$css = $cssElem->nodeValue;
				
				header("HTTP/1.1 200 Ok");
				header('Content-type: text/css');
				header('Content-Disposition: attachment; filename="' . $id . '.css"');
				
				echo $css;
			}
		} else {
			header("HTTP/1.1 404 Not Found");
			header('Content-type: text/html');
				
			echo "The project you requested does not exist.";
		}
	} else {
		header("HTTP/1.1 400 Bad Request");
		header('Content-type: text/html');
				
		echo "You did not specify any id for a project";
	}
}

?>