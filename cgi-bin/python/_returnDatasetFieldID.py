#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
#========================================================================
#========================================================================
# File: _returnDatasetFieldID.py
#========================================================================
#========================================================================
# File used to retrieve geometry and a specific value from a vector file
# when the user select a point identify by lat and long into the map.
#========================================================================
import os
import cgi
import cgitb
from owslib.wcs import WebCoverageService as w
from owslib.wms import WebMapService
import numpy as np
import gdal
import ast
import sys
from gdalconst import *
from array import *
import time
from datetime import date
from mdlFunctions import _returnReplaceDatasetIndicator,_returnDatasetIndicatorGroup,_returnEncodedArrayLayers,_returnOwnerFromArrayLayers,_returnGroupFromArrayLayers,_returnMetadataLink,_returnGraphSettings,_writeTrace
import json

cgitb.enable()

print "Content-type: application/json"
print


response={}
try:
	
	# reads input parameters
	form   = cgi.FieldStorage()
	# specific dataset name
	strReturn=str(form.getfirst("strReturn"))
	if (strReturn=="None"):
		strReturn=""	
	# blnOnlyValues
	blnOnlyValues= int(form.getfirst("blnOnlyValues"))
	#
	
	strType= (form.getfirst("strType"))
	# return array list from a specific section of ini file	

	arrayLayers=_returnEncodedArrayLayers(strType,strReturn,blnOnlyValues);
	#print arrayLayers
	
	# return owner	
	arrayOwner=_returnOwnerFromArrayLayers(arrayLayers,0)
	
	if (strReturn==""):
		arrayOwnerGraph=_returnOwnerFromArrayLayers(arrayLayers,1)
		
	# return group
	arrayGroups=_returnGroupFromArrayLayers(arrayLayers)
	arrayDatasetIndicatorGroup=_returnDatasetIndicatorGroup()	
	arrayReplaceDatasetIndicator=_returnReplaceDatasetIndicator()
	
	# json response
	response={'result': 1, 'error': ''}
	# dataset availables
	response["data"]=arrayLayers
	
	# owners list
	arrayOwner.sort(reverse=False)
	response["owner"]=arrayOwner
	
	response["datasetIndicatorGroup"]=arrayDatasetIndicatorGroup
	response["replaceDatasetIndicator"]=arrayReplaceDatasetIndicator
	
	# groups list
	arrayGroups.sort(reverse=False)
	response["groups"]=arrayGroups	
	response["GNpath"]=_returnMetadataLink('');
	response["ownerGraph"]=""
	if (strReturn==""):	
		arrayOwnerGraph.sort(reverse=False)
		response["ownerGraph"]=arrayOwnerGraph
	
	# the first time returns also graph configurations parameters
	if (blnOnlyValues==1):
		response["graphSettings"]=_returnGraphSettings();
	
	print(json.JSONEncoder().encode(response))			
except:
	_writeTrace(str(sys.exc_info()))	
	strError='There was an error with the request. Pleae, try again.'
	response={'result': 0, 'error': strError}
	print(json.JSONEncoder().encode(response))