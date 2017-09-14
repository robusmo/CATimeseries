#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
#========================================================================
#========================================================================
# File: _returnCSV.py
#========================================================================
#========================================================================
# File used to write and initialize the CSV file used to save the query
# by point, box or shape result.
#========================================================================
import os
import cgi
import cgitb
import sys
import json
from mdlFunctions import _returnGraphTitle,_returnPdfCopyright,strGGraph_xTitle, _returnFilename_csv,_formatCsvFile,_returnHttpFilename,_returnHttpAddress,_returnColorsScale, _writeTrace, _returnColorsScale_SC,_returnIniValue,returnVariableFeature,_returnDatasetAttributes
import json
import HTMLParser	

cgitb.enable()

print "Content-type: application/json"
print

arrayParams = json.load(sys.stdin)
response={}



# return Y1 description
response["strY1Descr"]=''
# return Y2 description
response["strY2Descr"]=''
# return graph title

try:
	h = HTMLParser.HTMLParser()		
	# operation as input parameter
	response["strOperation"]=arrayParams["operation"]	
	
	arrayUnits={}
	arrayLabels={}
	arrayColors={}
	arrayColorsGraph=[]
	arrayCopyright={}
	lngContSC=0;
	lngContB=1;
	lngContL=1;
	lngContH=1;
	lngColor=0;
	strHeader='Date,'
	blnBarChartY1=0
	blnLogY1=0
	# for each layer of Y1
	for arrayTemp in arrayParams["vars1"]:   	
		# save layer name
		strLayer=arrayTemp["value"]	
		# return layer feature
		arrayFName=returnVariableFeature(strLayer)					
		# return parameter from GN
		arrayVDataset=_returnDatasetAttributes(arrayFName["id"],arrayFName["type"])							
		# return Y1 description
		if (response["strY1Descr"]==""):
			if (len(arrayParams["vars1"]) >1):
				# if there are more than 1 variable, the system return the owner description
				# (all datasets must be of the save group)
				response["strY1Descr"]=arrayFName['owner']
			else:		
				# return layer description
				response["strY1Descr"]=str(arrayFName["description"])	
			# add the unit
			if (str(arrayVDataset["unit"])!=""):
				response["strY1Descr"]+='('+str(arrayVDataset["unit"])+')'
		
		arrayFormula = arrayFName["formula"].split('_')	

		# STEPCHART
		if (arrayFormula[0]=="STEPCHART"):
			# number of maximum fields
			lngMax=int(arrayVDataset["maxValue"])
			# return colors from ini files
			arrayGColors_2y_stepchart=_returnColorsScale_SC(str(arrayFName["colorsScale"]),"COLOR");				
			# and labels
			arrayGLabels_2y_stepchart=_returnColorsScale_SC(str(arrayFName["colorsScale"]),"LABEL");
			# save the header line of CSV file
			for ii in range(int(arrayVDataset["minValue"]),int(lngMax)+1,1):
				strVar=str('SCY1'+str(lngContSC+1))										
				strHeader+=strVar+','		
				# save the output label used from javascript to describe with the mouse over a specific value
				arrayLabels[str(strVar)]=arrayGLabels_2y_stepchart[lngContSC]
				# save the output unit
				arrayUnits[strVar]=arrayVDataset["unit"]				
				# save the color used to design the graph
				arrayColors[strVar]=arrayGColors_2y_stepchart[lngContSC]
				arrayColorsGraph.append(arrayGColors_2y_stepchart[lngContSC])
				
				lngContSC=lngContSC+1				
		else:
			# BARCHART
			if ((arrayFormula[0]=="BAR0") or (arrayFormula[0]=="BAR")):
				strVar=str('BY1'+str(lngContB))							
				lngContB=lngContB+1
				if (arrayFormula[0]=="BAR0"):
					blnBarChartY1=1
			else:
				# LINEBAR
				if (arrayFormula[0]=="LINEBAR"):
					strVar='LY1'+str(lngContL)					
					lngContL=lngContL+1
				else:
					# HISTOGRAM
					if (arrayFormula[0]=="HISTOGRAM"):
						strVar='HY1'+str(lngContH)
						lngContH=lngContH+1				
			strHeader+=strVar
			arrayLabels[str(strVar)]=str(arrayFName["description"]);
			
			# if deviation is enabled
			# add a string to describe if the returned value is standard or spatial deviation
			if (arrayParams["blnDeviation"]==1):
				if (arrayFName["sd"]!=""):								
					arrayLabels[str(strVar)]=arrayLabels[str(strVar)]+' (standard deviation)'
				else:
					if (arrayParams["operation"]!="POINT"):		
						arrayLabels[str(strVar)]=arrayLabels[str(strVar)]+' (spatial deviation)'			
			# return unit
			arrayUnits[str(strVar)]=arrayVDataset["unit"]			
			# color
			arrayGColors_2y_other=_returnColorsScale(str(arrayFName["colorsScale"]));			
			arrayColors[strVar]=arrayGColors_2y_other[lngColor]			
			arrayColorsGraph.append(arrayGColors_2y_other[lngColor]);
			strHeader+=','
			lngColor=lngColor+1			
		arrayCopyright[str(strVar)]=h.unescape(_returnPdfCopyright(arrayFName["id"]))
		if (arrayFormula[1]=="LOG"):
			blnLogY1=1

	lngContSC=0;
	lngContB=1;
	lngContL=1;		
	blnBarChartY2=0
	blnLogY2=0
	# the same for all variables of Y2
	for arrayTemp in arrayParams["vars2"]:   	
		strLayer=arrayTemp["value"]	
		
		arrayFName=returnVariableFeature(strLayer)			
		arrayVDataset=_returnDatasetAttributes(arrayFName["id"],arrayFName["type"])							
		
		if (response["strY2Descr"]==""):
			if (len(arrayParams["vars2"]) >1):
				response["strY2Descr"]=arrayFName['owner']
			else:		
				response["strY2Descr"]=str(arrayFName["description"])				
			if (str(arrayVDataset["unit"])!=""):
				response["strY2Descr"]+='('+str(arrayVDataset["unit"])+')'
		
		arrayFormula = arrayFName["formula"].split('_')	
		
		if (arrayFormula[0]=="STEPCHART"):
			lngMax=int(arrayVDataset["maxValue"])
			arrayGColors_2y_stepchart=_returnColorsScale_SC(str(arrayFName["colorsScale"]),"COLOR");				
			arrayGLabels_2y_stepchart=_returnColorsScale_SC(str(arrayFName["colorsScale"]),"LABEL");
			
			for ii in range(int(arrayVDataset["minValue"]),int(lngMax)+1,1):
				strVar=str('SCY2'+str(lngContSC+1))							
				strHeader+=strVar+','					
				arrayLabels[str(strVar)]=arrayGLabels_2y_stepchart[lngContSC]
				arrayUnits[strVar]=arrayVDataset["unit"]				
				arrayColors[strVar]=arrayGColors_2y_stepchart[lngContSC]
				arrayColorsGraph.append(arrayGColors_2y_stepchart[lngContSC])
				
				lngContSC=lngContSC+1	
		else:			
			if ((arrayFormula[0]=="BAR0") or (arrayFormula[0]=="BAR")):
				strVar=str('BY2'+str(lngContB))							
				lngContB=lngContB+1
				if (arrayFormula[0]=="BAR"):
					blnBarChartY2=1
			else:
				if (arrayFormula[0]=="LINEBAR"):
					strVar='LY2'+str(lngContL)
					lngContL=lngContL+1
				else:
					if (arrayFormula[0]=="HISTOGRAM"):
						strVar='HY2'+str(lngContH)
						lngContH=lngContH+1	
			
			strHeader+=strVar
			arrayLabels[str(strVar)]=str(arrayFName["description"]);
			if (arrayParams["blnDeviation"]==1):
				if (arrayFName["sd"]!=""):					
					arrayLabels[str(strVar)]=arrayLabels[str(strVar)]+' (standard deviation)'
				else:
					if (arrayParams["operation"]!="POINT"):		
						arrayLabels[str(strVar)]=arrayLabels[str(strVar)]+' (spatial deviation)'
			
			arrayUnits[str(strVar)]=arrayVDataset["unit"]
			
			arrayGColors_2y_other=_returnColorsScale(str(arrayFName["colorsScale"]));			
			arrayColors[strVar]=arrayGColors_2y_other[lngColor]			
			arrayColorsGraph.append(arrayGColors_2y_other[lngColor]);
			strHeader+=','
			lngColor=lngColor+1			
		arrayCopyright[str(strVar)]=h.unescape(_returnPdfCopyright(arrayFName["id"]))			
		if (arrayFormula[1]=="LOG"):
			blnLogY2=1
	# header to save into the CSV file
	strHeader=strHeader[:-1]+'\n'	

	# CSV filename
	strFilename=_returnFilename_csv()

	
	# initialize the CSV file
	_formatCsvFile(strHeader,strFilename);

	
	# return the http file
	strHttpFilename=_returnHttpFilename(strFilename);
	
	
	# save all output values into a json array
	response["units"]=arrayUnits
	response["labels"]=arrayLabels
	response["colors"]=arrayColors
	response["colorsGraph"]=arrayColorsGraph		
	response["strGraphTitle"]=_returnGraphTitle(arrayParams)
	response['strFilename']=strFilename
	response['strHttpFilename']=strHttpFilename
	response['blnBarChartY1']=blnBarChartY1
	response['blnBarChartY2']=blnBarChartY2
	response['blnLogaritmicY1']=blnLogY1
	response['blnLogaritmicY2']=blnLogY2
	strSource=_returnIniValue('PDF_CONFIGURATION','PDF_TITLE')			
	response['reference']=str(strSource)+', '+str(_returnHttpAddress())
	response['copyright']=arrayCopyright
	response['result']=1;
	response['error']='';	
	
	print(json.JSONEncoder().encode(response))
except:
	_writeTrace(str(sys.exc_info()))
	strError='There was an error with the request. Pleae, try again.'
	response={'result': 0, 'error': strError}
	print(json.JSONEncoder().encode(response))	