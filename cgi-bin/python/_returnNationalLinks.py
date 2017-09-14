#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
#========================================================================
#========================================================================
# File: _returnNationalLinks.py
#========================================================================
#========================================================================
# File used to retrieve all common dates for a list of coverages.
#========================================================================
import os
import cgi
import cgitb
from owslib.wcs import WebCoverageService as w  
from owslib.wms import WebMapService
import numpy as np
import gdal
import ast
from gdalconst import *
from array import *
import time
from datetime import date
import sys
import json
from mdlFunctions import _returnNationalLinks,_writeTrace
cgitb.enable()


print "Content-type: application/json"
print
try:
	
	# reads input parameters
	form   = cgi.FieldStorage()
	# from latitude and longiture as input parameters return national and meteo links
	lat= float(form.getfirst("lat"))
	lon= float(form.getfirst("lon"))

	# return national and meteo links for the selected point
	response=_returnNationalLinks(lat,lon);
	response["error"]=''
	response["result"]='1'
	print(json.JSONEncoder().encode(response))
except:
	_writeTrace(str(sys.exc_info()))
	strError='There was an error with the request. Pleae, try again.'
	response={'result': 0, 'error': strError}
	print(json.JSONEncoder().encode(response))	


			
