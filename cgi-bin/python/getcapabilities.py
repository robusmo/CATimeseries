#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
#========================================================================
#========================================================================
# File: _getCapabilities.py
#========================================================================
#========================================================================
# File used to retrieve all information related to a specific layer name
# reads from GN.
#========================================================================
import sys
sys.path.insert(0, '/usr/lib64/python2.6/site-packages')
import os
import cgi
import cgitb
from owslib.wcs import WebCoverageService as w
from owslib.wms import WebMapService
import numpy as np
import gdal
import datetime
import ast
from gdalconst import *
from array import *
import json
import sys
from mdlFunctions import _returnDatasetAttributes,_returnIniValue,_returnDayConditions,returnVariableFeature,_verifyDatasetDate,returnShapeFile_replacekey,_returnLegendString,_returnMetadataLink,returnIfLeapYear,_writeTrace
cgitb.enable()

print "Content-type: application/json"
print

response={}

strTempCoverage=''
#_returnUniqueFilename();
# read from input parameters
form = cgi.FieldStorage()
try:
	# coverage
	strCoverage = form.getfirst("coverage")
	blnSortable = form.getfirst("blnSortable")
	responseData={}
	pos = strCoverage.find("REPLACESCENARIO")
	response={'result': 1, 'error': ''}

	if (pos!=-1):

		arrayFName=returnVariableFeature(strCoverage)

		strTemp=_returnIniValue("DATASET_SCENARIO",arrayFName["owner"])
		arrayScenario=strTemp.split(',')

		responseData["scenario"]=arrayScenario

		response["data"]=responseData

	else:
		# return layer features
		arrayFName=returnVariableFeature(strCoverage)




		if (blnSortable=="1"):

			if (arrayFName["scenario"]!=""):

				strTempCoverage=arrayFName["scenario"]
				# return all values for scenario dataset
				arrayFName=returnVariableFeature(arrayFName["scenario"])


				# translate with the scenario value
				if (arrayFName["scenario"]!=""):
					strTemp=_returnIniValue("DATASET_SCENARIO",arrayFName["scenario"])
					arrayScenario=strTemp.split(',')
					responseData["originalScenario"]=arrayScenario

		strFromDate=''
		strToDate=''
		strtext= ''
		strLegend=''
		strUnit=''
		strYearKey=''
		# return info from GN

		arrayVDataset=_returnDatasetAttributes(arrayFName["id"],arrayFName["type"])


		if ((arrayFName["type"]!="s_d") and (arrayFName["type"]!="s_m")):
			# RASTER: r_m or r_d
			#print arrayVDataset
			# date from and to
			if (arrayVDataset["fromDate"]!=""):
				strTempDate=str(arrayVDataset["fromDate"])[:10]
				arrayTempDate = strTempDate.split('-')
				fromY= int(arrayTempDate[0])
				fromM= int(arrayTempDate[1])
				fromD= int(arrayTempDate[2])
			if (arrayVDataset["toDate"]!=""):
				strTempDate=str(arrayVDataset["toDate"])[:10]
				arrayTempDate = strTempDate.split('-')
				toY= int(arrayTempDate[0])
				toM= int(arrayTempDate[1])
				toD= int(arrayTempDate[2])

			# return day conditions for layer selected
			dayconditions= _returnDayConditions(arrayFName["interval"],'');


			#print fromY
			#print toY
			if (int(toY)>int(fromY)):
				startYear=int(fromY)+1
			else:
				startYear=fromY
			#print dayconditions
			endYear=startYear+1

			# from year = to year
			# it must returns only the first year to complete the month combo
			# for one year
			for lngYear in range(startYear,endYear):
				# for all days into dayconditions

				for lngDay in dayconditions:
					dt = datetime.datetime(lngYear,1,1)
					dtdelta = datetime.timedelta(days=lngDay-1)
					a=dt + dtdelta
					#strTempDate=a.isoformat()

					# verify if the file exists
					strTempDate=returnIfLeapYear(lngDay,lngYear);
					strTempDate=strTempDate.isoformat()

					result=_verifyDatasetDate(strTempDate,arrayVDataset["fromDate"],arrayVDataset["toDate"]);

					# if yes, add into a string
					if (result==1):
						strtext=strtext+strTempDate+str('_')


			# return REPLACEKEY for coverage
			arrayDates=returnShapeFile_replacekey(strCoverage)

			if (arrayDates[0] != ''):
				strtext=''
				for strReplace in arrayDates:
					strtext=strtext+strReplace+str('_')
				strYearKey="YEARDAY_SPECIAL"
			else:
				strtext=strtext[:-1]
				strYearKey="YEAR"
		else:
			# SHAPE MOSAIC: s+mk or s_d
			# return dates for the layer
			arrayDates=returnShapeFile_replacekey(strCoverage)

			# for each date in arrayDates
			for strReplace in arrayDates:
				strtext=strtext+strReplace+str('_')
			strYearKey="YEAR_SPECIAL"
		# return the output string

		responseData["scenario"]=''


		responseData["strHttp"]=arrayVDataset["ows"]
		responseData["strEPSG"]=arrayVDataset["crs"]
		responseData["strServerType"]=arrayVDataset["serverType"]
		responseData["strDataType"]=arrayFName["type"]
		responseData["strDateFrom"]=str(arrayVDataset["fromDate"])
		responseData["strDateTo"]=str(arrayVDataset["toDate"])
		responseData["strDateList"]=strtext
		responseData["strDateType"]=str(strYearKey)
		responseData["strLegend"]=strLegend
		responseData["strUnit"]=str(arrayVDataset["unit"])
		responseData["strID"]=str(arrayFName["id"])
		if (strTempCoverage!=""):
			# if the temporary value is not blank
			# change the label with the new one
			responseData["strLabel"]=str(strTempCoverage)
			# save the old one as strLabelTranslate
			responseData["strLabelTranslate"]=str(strCoverage)
		else:
			responseData["strLabel"]=str(strCoverage)
		responseData["dateFormat"]=str(arrayFName["dateFormat"])
		responseData["strDateInterval"]=arrayFName["interval"]
		responseData["strDescription"]=str(arrayFName["description"])

		response["data"]=responseData

	print(json.JSONEncoder().encode(response))
except:
	_writeTrace(str(sys.exc_info()))
	strError='There was an error with the request. Pleae, try again.'
	response={'result': 0, 'error': strError}
	print(json.JSONEncoder().encode(response))