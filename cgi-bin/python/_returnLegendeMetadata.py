#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
#========================================================================
#========================================================================
# File: _returnLegendeMetadata.py
#========================================================================
#========================================================================
# File used to retrieve Legend and Metadata for a specific layer.
#========================================================================
import os
import cgi
import cgitb
from owslib.wcs import WebCoverageService as w  
from owslib.wms import WebMapService
import numpy as np
import gdal
import datetime
import ast
import sys
from gdalconst import *
from array import *
from mdlFunctions import returnVariableFeature,_returnDatasetAttributes,_returnLegendString,_writeTrace
import json

cgitb.enable()

print "Content-type: application/json"
print


response={}
strLegend='';

try:
	
	# read from input parameters
	form = cgi.FieldStorage()
	strCoverage = form.getfirst("coverage")	
	strDateCoverage = form.getfirst("dateCoverage")	
	
	# return dataset features
	arrayFName=returnVariableFeature(strCoverage)		
	# return dataset values from GN
	arrayVDataset=_returnDatasetAttributes(arrayFName["id"],arrayFName["type"])		
	
	# retunr Legend image of getLegend using WMS
	strLegend=_returnLegendString(arrayFName,arrayVDataset,strDateCoverage);
	
	# response
	response["description"]=arrayFName["description"]
	response["legendLink"]=strLegend
	#response["metadataLink"]=_returnMetadataLink(arrayFName["id"])	
	response["id"]=arrayFName["id"]
	response['result']=1;
	response['error']='';	
	# print the output json array
	print(json.JSONEncoder().encode(response))
	
except:
	_writeTrace(str(sys.exc_info()))	
	strError='There was an error with the request. Pleae, try again.'
	response={'result': 0, 'error': strError}
	print(json.JSONEncoder().encode(response))