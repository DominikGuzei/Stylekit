<?php

/**
 * 	@author Dominik Guzei
 *	Project: StyleKit - Qualifikationsprojekt 1
 *	Fachhochschule Salzburg
 *
 * 	PROJECTS SERVICE
 *	Accepts POST requests as xml which always contain css and url but
 *	can ommit the id tag. If so it is handled as request to create a new
 *	project and returns a new id. If the id tag is included it tries to
 *	find an existing project and save the contents.
 */

require_once("functions.php");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	// filter out id if we have to save a project
	$xml = file_get_contents('php://input');
	
	// save project
	$doc = new DOMDocument();
	if($xml && $xml != '' && ($doc->loadXML($xml))) {
		
		/* ----------- SAVE ---------- */
		if(($id = $doc->getElementsByTagName("id")->item(0))) {
			$id = $id->nodeValue;
			// clean id
			$id = sanitize($id, false);
			// try to open a file with given id
			$xmlFile = "projects/" . $id . ".xml";
			
			if (file_exists($xmlFile) && ($fp=fopen($xmlFile, "wb"))) {
				// if there is a valid file -> get data and save it
	    		fwrite($fp, $xml);
				fclose($fp);
				
				header("HTTP/1.1 200 Ok");
				echo "Saved project successfully!";
	        } else {
	        	header("HTTP/1.1 404 Nod Found");
	        	echo "The project id you presented was not found";
	        }
		} 
		/* ----------- CREATE NEW PROJECT ---------- */
		else { 
		
			// try to generate unique project id
			$tries = 0;
			do{
				$id = generateURL();
				if($tries > 1) {
					$id .= $tries;
				}
				$xmlFile = "projects/" . $id . ".xml";
				$htmlFile = "projects/" . $id . ".html";
				$tries++;
			} while(file_exists($xmlFile));
			
			// when we found an id create the xml project file
			$xml = file_get_contents('php://input'); 
			$doc = new DOMDocument();
			$doc->loadXML($xml);
			
			// proof if xml data was correctly sent
			if(($url = $doc->getElementsByTagName("url")->item(0)) && 
			   ($style=$doc->getElementsByTagName("style")->item(0))) {
				
				
				if(($fp=fopen($xmlFile, 'w+b'))) {
					
					// create correct project xml document
					$saveDoc = new DOMDocument("1.0");
					$root = $saveDoc->createElement('project');
					$root = $saveDoc->appendChild($root);
					// create id element
					$idElem = $saveDoc->createElement('id');
					$idElem->appendChild($saveDoc->createTextNode($id));
					
					$urlElem = $saveDoc->createElement('url');
					$urlElem->appendChild($saveDoc->createTextNode($url->nodeValue));
					
					$styleElem = $saveDoc->createElement('style');
					$styleElem->appendChild($saveDoc->createTextNode($style->nodeValue));
										
					$root->appendChild($idElem);
					$root->appendChild($urlElem);
					$root->appendChild($styleElem);
					
		    		fwrite($fp, $saveDoc->saveXML());
					fclose($fp);

					header("HTTP/1.0 201 Created");
					echo $id;
					
				} 
				else {
					header("HTTP/1.1 500 Internal Server Error");
					echo "Could not create new project file";
				}
			} 
			else {
				header("HTTP/1.1 400 Bad Request");
				echo "The Xml you presented was malformed.";
			}
		}
	} else {
		header("HTTP/1.1 400 Bad Request");
		echo "The Xml you presented could not be parsed.";
	}
} 

function generateURL() {
// generates 5 char word
  $vowels = str_split('aeiou');
  $const = str_split('bcdfghjklmnpqrstvwxyz');
  
  $word = '';
  for ($i = 0; $i < 9; $i++) {
    if ($i % 2 == 0) { // even = vowels
      $word .= $vowels[rand(0, 4)];
    } else {
      $word .= $const[rand(0, 20)];
    }
  }

return $word;
}

?>