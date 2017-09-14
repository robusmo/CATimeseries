<?php

$data = $_POST['data'];
$file = "/srv/www/dvpt/WWW/Data/Pages/FAPAR_ELIS/mapserver/temp/".md5(uniqid()) . '.png'; 
// remove "data:image/png;base64,"
$uri =  substr($data,strpos($data,",")+1); 
// save to file
file_put_contents($file, base64_decode($uri)); 
// return the filename
echo $file
?>