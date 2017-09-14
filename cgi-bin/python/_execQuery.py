#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
#========================================================================
#========================================================================
# File: _execQuery.py
#========================================================================
#========================================================================
# File used to execute a query dy point, box or crop by shape.
# It returns in output the csv of the output filename and the result.
#========================================================================
import sys
sys.path.insert(0, '/usr/lib64/python2.6/site-packages')
import os
import cgi
import cgitb
from owslib.wcs import WebCoverageService as w
from owslib.wms import WebMapService
import gdal
import ast
from gdalconst import *
from array import *
import time
import numpy as np
from datetime import date
import sys
from datetime import datetime
from time import mktime, strptime
import json
from mdlFunctions import strGEPSGF4326Proj,_returnCommonDates,_returnCommonYears,_formatCsvFile,_returnHttpFilename,_savePid, _writeTrace,_returnMeanValue,_replaceDateFormat
from mdlFunctions import _verifyIfDateIsAvailable,_returnGetCapabilities_dates,returnVariableFeature,_returnDatasetAttributes,returnCoverageMeanValue,_returnTransformMean,returnCropCoverageMeanValue,queryFeature,convertPolygon,_returnIfLeapYear

cgitb.enable()

print "Content-Type: text/plain;charset=utf-8"
# "Content-type: application/json"
print


strError=''
blnDebug=0




response={'result': 0, 'error': ''}
try:
	arrayParams = json.load(sys.stdin)
	#arrayParams["strCSVFile"]="/srv/tmp/CA/20170609170140147041.csv"
	# save process id in order to delete when stop the process
	_savePid(arrayParams["strCSVFile"]+'.pid')




#	arrayParams["txtRLon"]=10.444722
#	arrayParams["txtLLon"]=10.444722
#	arrayParams["txtULat"]=51.084722
#	arrayParams["txtLLat"]=51.084722
#	arrayParams["strCSVFile"]="/var/www/html/temp/20140610144944074620.csv"
	# input parameters
	
	arrayParams["append"]=int(arrayParams["append"])

#	arrayParams["append"]=1;	
	
	arrayParams["txtRLon"]=float(arrayParams["txtRLon"])
	
	arrayParams["txtLLon"]=float(arrayParams["txtLLon"])
	arrayParams["txtULat"]=float(arrayParams["txtULat"])
	arrayParams["txtLLat"]=float(arrayParams["txtLLat"])
	
	arrayParams["originaltxtRLon"]=arrayParams["txtRLon"]
	arrayParams["originaltxtLLon"]=arrayParams["txtLLon"]
	arrayParams["originaltxtULat"]=arrayParams["txtULat"]
	arrayParams["originaltxtLLat"]=arrayParams["txtLLat"]
	arrayParams["fromMonth"]=int(arrayParams["fromMonth"]);
	arrayParams["toMonth"]=int(arrayParams["toMonth"]);
	arrayParams["fromYear"]=int(arrayParams["fromYear"]);
	arrayParams["toYear"]=int(arrayParams["toYear"]);
	strLayersDescr=''
	arrayLayers=[]	
	# collects all input vars
	
	for arrayTemp in arrayParams["vars1"]:   	
		arrayLayers.append(arrayTemp['value']);
	for arrayTemp in arrayParams["vars2"]:   	
		arrayLayers.append(arrayTemp['value']);
	blnDebug=0
	if (blnDebug==1):
		print arrayParams
	arrayFinalDates=[]
	arrayValues = []
	arrayFinal1= []
	arrayFinal2= []
	lngFinal=0;
	lngCont=0;
	blnContinueDate=0	
	lngIncr=1
	lngContSC=1;
	lngContB=1;
	lngContL=1;
	lngContH=1;
	strHeader='Date,'	
	arrayFName_total=[]
	arrayVDataset_total=[]	
	arrayFNameSD_total=[]
	arrayVDatasetSD_total=[]

	arrayParams["crs"]=strGEPSGF4326Proj

	blnFoundShapeFile=0
	strFoundShapeFile=''
	strFoundShapeFile_owner=''

	for arrayTemp in arrayParams["vars1"]:   	
		strLayer=arrayTemp['value']

		# return variable info
		arrayFName=returnVariableFeature(strLayer)

		# if the variable is a shape
		if (arrayFName["type"]=="s_d" or arrayFName["type"]=="s_m"):
			blnFoundShapeFile=1
			strFoundShapeFile_owner=arrayFName["owner"]
			if (strFoundShapeFile==""):
				strFoundShapeFile=strLayer

		arrayTemp = arrayFName["formula"].split('_')	
		# return dataset attributes from GN
		arrayVDataset=_returnDatasetAttributes(arrayFName["id"],arrayFName["type"])		
		
		if arrayVDataset:
			arrayVDataset_total.append(arrayVDataset)
		# return dates available reads from getCapabilities



		arrayDatesAv=_returnGetCapabilities_dates(arrayVDataset["ows"],arrayFName["type"],arrayFName["store"],arrayFName["name"],arrayVDataset["ows_version"],arrayFName["dateFormat"],arrayFName["interval"]);



		arrayFName["dates_available"]=arrayDatesAv		
		
		if arrayFName:		
			arrayFName_total.append(arrayFName)		
					
		if (arrayTemp[0]=="STEPCHART"):
			strEmptyString=''			
			lngMax=arrayVDataset["maxValue"]
			for ii in range(int(arrayVDataset["minValue"]),int(lngMax)+1,1):
				strEmptyString+='null,'
			strEmptyString=strEmptyString[:-1]
		# deviation
		if (arrayParams["blnDeviation"]==1):		
			# info about the deviation datates
			
			arrayFNameSD=returnVariableFeature(arrayFName['sd'])			
			
			arrayVDatasetSD=[]
			if arrayFNameSD:
				# return dataset attributes from GN
				arrayVDatasetSD=_returnDatasetAttributes(arrayFNameSD["id"],arrayFNameSD["type"])	
				
				# return dates available reads from getCapabilities				
				arrayDatesAvSD=_returnGetCapabilities_dates(arrayVDataset["ows"],arrayFNameSD["type"],arrayFNameSD["store"],arrayFNameSD["name"],arrayVDatasetSD["ows_version"],arrayFNameSD["dateFormat"],arrayFNameSD["interval"]);					
				
				arrayFNameSD["dates_available"]=arrayDatesAvSD
			arrayVDatasetSD_total.append(arrayVDatasetSD)
			arrayFNameSD_total.append(arrayFNameSD)		

	# same process for VARS2
	for arrayTemp in arrayParams["vars2"]:   			
		strLayer=arrayTemp['value']			
		arrayFName=returnVariableFeature(strLayer)						
		if (arrayFName["type"]=="s_d" or arrayFName["type"]=="s_m"):
			if (blnFoundShapeFile==1):
				# there is a shape on the VAR1
				if (strFoundShapeFile_owner!=""):				
					if (arrayFName["owner"]!=strFoundShapeFile_owner):
						strError="You cannot compare two shapefile at the same time: please, change it!"						
						# return an error if the user tries to compare 2 shapefiles at the same time				
						exit(0);											
			else:
				blnFoundShapeFile=1			
			if (strFoundShapeFile==""):			
				strFoundShapeFile=strLayer
						
		arrayTemp = arrayFName["formula"].split('_')	
		arrayVDataset=_returnDatasetAttributes(arrayFName["id"],arrayFName["type"])		
		if arrayVDataset:
			arrayVDataset_total.append(arrayVDataset)
		
		arrayDatesAv=_returnGetCapabilities_dates(arrayVDataset["ows"],arrayFName["type"],arrayFName["store"],arrayFName["name"],arrayVDataset["ows_version"],arrayFName["dateFormat"],arrayFName["interval"]);		

		arrayFName["dates_available"]=arrayDatesAv
		if arrayFName:		
			arrayFName_total.append(arrayFName)				
		
		if (arrayTemp[0]=="STEPCHART"):
			strEmptyString=''		
			lngMax=arrayVDataset["maxValue"]
			for ii in range(int(arrayVDataset["minValue"]),int(lngMax)+1,1):
				strEmptyString+='null,'
			strEmptyString=strEmptyString[:-1]
	
		if (arrayParams["blnDeviation"]==1):		
			
			arrayFNameSD=returnVariableFeature(arrayFName['sd'])	
			
			arrayVDatasetSD=[]
			if arrayFNameSD:
				arrayVDatasetSD=_returnDatasetAttributes(arrayFNameSD["id"],arrayFNameSD["type"])		
				arrayDatesAvSD=_returnGetCapabilities_dates(arrayVDataset["ows"],arrayFNameSD["type"],arrayFNameSD["store"],arrayFNameSD["name"],arrayVDatasetSD["ows_version"],arrayFNameSD["dateFormat"],arrayFNameSD["interval"]);					
				arrayFNameSD["dates_available"]=arrayDatesAvSD
			arrayVDatasetSD_total.append(arrayVDatasetSD)
			arrayFNameSD_total.append(arrayFNameSD)		


	# I found a shapefile
	if (blnFoundShapeFile==1 or arrayParams["operation"]=="SHAPE"):
	
		# original coordinates
		lngLatToFind=arrayParams["originaltxtLLat"]
		lngLonToFind=arrayParams["originaltxtLLon"]
		
		if (arrayParams["operation"]=="SHAPE"):			
			if (strFoundShapeFile!=""):
				strLayerToFind=strFoundShapeFile			
			else:
				strLayerToFind=arrayParams["layerCrop"]							
		else:
			strLayerToFind=strFoundShapeFile					
		strGeom=""
		if (strLayerToFind!=""):
			arrayFNameFeature=returnVariableFeature(strLayerToFind)
			arrayVDatasetFeature=_returnDatasetAttributes(arrayFNameFeature["id"],arrayFNameFeature["type"])

			#print arrayVDatasetFeature
			arrayParamsFeature=arrayParams
			arrayParamsFeature["strDate"]=""			
			if (arrayFNameFeature["type"]=="s_m"):		
				pos = arrayFNameFeature["fixed"].find("_")					
				if (pos==4):
					arrayParamsFeature["strDate"]=str(arrayVDatasetFeature["fromDate"])[:pos].replace("-","")
				else:
					arrayParamsFeature["strDate"]=str(arrayVDatasetFeature["fromDate"])[:10].replace("-","")
			
			if (arrayVDatasetFeature["serverType"]=="MAPSERVER"):
				arrayParamsFeature["crs"]="EPSG:900913"
			else:
				arrayParamsFeature["crs"]=arrayVDatasetFeature["crs"]			
			arrayParamsFeature["name"]=strLayerToFind
			arrayParamsFeature["txtLLon"]=lngLonToFind
			arrayParamsFeature["txtRLon"]=lngLonToFind
			arrayParamsFeature["txtLLat"]=lngLatToFind	
			arrayParamsFeature["txtULat"]=lngLatToFind				
			
			if (blnDebug==1):
				print arrayFNameFeature
				print arrayVDatasetFeature
				print arrayParamsFeature
				print arrayParamsFeature["crs"]

			# return the geometry converted to right projection
			result=queryFeature(arrayFNameFeature,arrayVDatasetFeature,arrayParamsFeature,'','the_geom',arrayParamsFeature["crs"])
			strGeom=''
			if (result["result"]==1):
				strGeom=result["value"]
			#cwa:wei_rb_ecf_REPLACEKEY_ann
			if (arrayVDatasetFeature["serverType"]=="MAPSERVER"):			
				inputEPSG = 3857
				outputEPSG = 4326
			else:
				inputEPSG = 4326
				outputEPSG = 4326
			# converted polygon

			arrayParams["convertedPolygon"]=convertPolygon(strGeom,inputEPSG,outputEPSG);			
			arrayParams["convertedCrs"]=strGEPSGF4326Proj
			latS=[]
			lonS=[]
			strGGeometry=''
			# save all points into two different arrays in order to extrapolate the min and max values for lat and long
			for values in arrayParams["convertedPolygon"]:    						
				latS.append(float(values[1]))			
				lonS.append(float(values[0]))	
				strGGeometry+=str(values[0])+' '+str(values[1])+','
			# save the geometry into the correct format for WPS
			strGGeometry=strGGeometry[0:-1]
			# save min and max
			strAreaToLon=np.max(lonS)+1
			strAreaFromLon= np.min(lonS)-1	
			strAreaToLat= np.max(latS)+1	
			strAreaFromLat= np.min(latS)-1			
			# save values into the structure
			arrayParams["strGGeometry"]=strGGeometry
			arrayParams["strAreaToLon"]=strAreaToLon
			arrayParams["strAreaFromLon"]=strAreaFromLon
			arrayParams["strAreaFromLat"]=strAreaFromLat
			arrayParams["strAreaToLat"]=strAreaToLat
			
		arrayParams["geom"]=strGeom
		if (blnFoundShapeFile==1):	
			arrayParams["operation"]="SHAPE"
	
	# return common dates
	arrayDates=_returnCommonDates(arrayFName_total)



	#print arrayDates
	# return common years 
	arrayYears=_returnCommonYears(arrayFName_total,arrayParams["fromYear"],arrayParams["toYear"])			
	#print arrayYears
	#print arrayYears
	#print arrayDates
	#print arrayLayers
	#exit(0);
	strPrevStepChart=''
	blnPrimaVoltaDebug=1
	# start the loop


	if (arrayParams["append"] ==1):
	# append to the csv file
		#f = open(arrayParams["strCSVFile"],'ab')
		import csv
		with open(arrayParams["strCSVFile"], 'rb') as csvfile:
			reader = csv.reader(csvfile, delimiter=' ', quotechar='|')
			#lastline = reader.next()

			rows = list(reader)
			lngNum=int(len(rows))
			
			if ( lngNum > 1):	
				strTemp=rows[lngNum-1]		
				
				arrayTemp = strTemp[0].split(',')	
				strDate=arrayTemp[0]
				arrayTempDate = strDate.split('-')	
				
				arrayParams["fromYear"]=int(arrayTempDate[0])
				arrayParams["fromMonth"]=int(arrayTempDate[1])								
				arrayNewYears=[]
				for lngYear in arrayYears:	
					if (lngYear>=arrayParams["fromYear"]):
						arrayNewYears.append(int(lngYear))	
				arrayYears=arrayNewYears

	for lngYear in arrayYears:		
		# loop over days
		for lngDay in arrayDates:			
			# verify if the year if a leap year
			strTempDate=_returnIfLeapYear(lngDay,lngYear);
			strTempDateOr=strTempDate;
			# extrapolate month
			lngMonth=int(strTempDate.month)
			# date
			strTempDate=strTempDate.isoformat() 
	
			# verify date with input parameters			
			blnContinueDate=1
			if (lngYear == arrayParams["fromYear"]):				
				if (lngMonth <arrayParams["fromMonth"]):
					blnContinueDate=0			
			if (lngYear == arrayParams["toYear"]):
				if (lngMonth >arrayParams["toMonth"]):
					blnContinueDate=0	
			
			# date
			if (blnContinueDate==1):
				
				strLine=str(strTempDate[:10])+','
				
				# for each layer
				for xx in range(0,len(arrayLayers),1):					

					strLayer=arrayLayers[xx]
					if (blnDebug==1):
						print strLayer
					lngCont=0;
					arrayValues=[]
					
					# shape dataset or mosaic
					arrayParams["strCoverage"]=strLayer
					
					arrayFName=arrayFName_total[xx]

										
					strLayersDescr+=arrayFName["description"]+'#'

					
									
					if arrayVDataset_total[xx]:
						arrayVDataset=arrayVDataset_total[xx]
					
					arrayFName_deviation=[]
					if (arrayParams["blnDeviation"]==1):						
						
						if ((arrayFNameSD_total) and (len(arrayFNameSD_total) > xx)):															
							arrayFName_deviation=arrayFNameSD_total[xx]						
												
						if ((arrayVDatasetSD_total) and (len(arrayVDatasetSD_total) > xx)):															
							arrayVDataset_deviation=arrayVDatasetSD_total[xx]						
						
					# input parameters		
					# if is a point, the system retrieve 3 x 3 pixels and extrapolate the 1,1
					if (arrayParams["operation"]=="POINT"):
						# return cell 3 * 3
						arrayParams["txtLLon"]= arrayParams["originaltxtLLon"]-(arrayVDataset["xsize"]*1.6)
						arrayParams["txtLLat"]= arrayParams["originaltxtLLat"]-(arrayVDataset["ysize"]*1.6)
						arrayParams["txtRLon"]= arrayParams["originaltxtRLon"]+(arrayVDataset["xsize"]*1.6)
						arrayParams["txtULat"]= arrayParams["originaltxtULat"]+(arrayVDataset["ysize"]*1.6)
					
					# calculare width and height
					widthValue= int(((arrayParams["txtRLon"]-arrayParams["txtLLon"])/arrayVDataset["xsize"]))
					heightValue= int(((arrayParams["txtULat"]-arrayParams["txtLLat"])/arrayVDataset["ysize"]))
					
					# minimun value
					if (widthValue <1):	widthValue=1
					if (heightValue <1):	heightValue=1
					arrayParams["widthValue"]= widthValue
					arrayParams["heightValue"]= heightValue																			
					
					lngValue=''
					blnContinueDateLayer=0																
					# verify if the dateset exists for the specific date
					if (blnDebug==1):		
						if (blnPrimaVoltaDebug==1):
							print arrayFName["dates_available"]
							blnPrimaVoltaDebug=0;
					
					
					strTempDateOrUp=_replaceDateFormat(strTempDateOr,arrayFName["dateFormat"]);					
					#print strTempDateOrUp
					#print strTempDateOrUp
					

					blnContinueDateLayer=_verifyIfDateIsAvailable(strTempDateOrUp,strLayer,arrayFName["type"],arrayFName["dates_available"],arrayFName["fixed"],arrayFName["dateFormat"]);										
					arrayTemp = arrayFName["formula"].split('_')
					#print arrayFName;

					if (blnContinueDateLayer==1):	
						if (blnDebug==1):					
							print "date ok: ";
							print strTempDateOrUp
						arrayParams["strCoverage"]=strLayer													
						#========================================================================================
						# SHAPEFILE (mosaic or dataset)
						#========================================================================================
						if ((arrayFName["type"]=="s_m") or (arrayFName["type"]=="s_d")):
							
							strResult_var=""
							if (arrayFName["type"]=="s_d"):			
								# no data to save if it is a dataset
								arrayParams["strDate"]=''																		
							else:
								# save info for date
								pos = arrayFName["fixed"].find("_")					
								if (pos==4):
									strTestDate=str(strTempDate)[0:pos]
								else:															
									strTestDate=str(strTempDate[:10]).replace("-", "");
								
								strTempNameOriginal=arrayFName["name"]									
								arrayParams["strDate"]=strTestDate	
							#========================================================================================							
							# QUERY FEATURE (WFS)
							#========================================================================================
							result=queryFeature(arrayFName,arrayVDataset,arrayParams,lngDay,arrayFName["returnid"],'')
							strResult_var=''
							if (result["result"]==1):
								strResult_var=result["value"]
							lngValue=''							
							if (strResult_var!=""):
								lngValue=float(strResult_var)								
						#========================================================================================
						# SHAPEFILE (mosaic or dataset) 
						#========================================================================================								
						else:

						#========================================================================================
						# RASTER (mosaic or dataset)
						#========================================================================================														

							if (arrayParams["operation"]=="POINT" or arrayParams["operation"]=="BOX"):									
								#========================================================================================							
								# COVERAGE (WCS)
								#========================================================================================															

								data=returnCoverageMeanValue(arrayParams["operation"],strTempDate,arrayParams,arrayFName,arrayVDataset,'',0)

								
							else:																				
								#========================================================================================							
								# CROP COVERAGE (WPS)
								#========================================================================================																						
								
								data=returnCropCoverageMeanValue(arrayParams["operation"],strTempDate,arrayParams,arrayFName,arrayVDataset,'',0)

							

							strResult_var=str(_returnMeanValue(arrayParams["operation"],data,arrayVDataset,arrayFName["formula"],'',0,arrayFName["colorsScale"]))
							
							# translate the value														
							lngValue=_returnTransformMean(strResult_var,arrayFName,arrayVDataset,0);						
							
							if (blnDebug==1):													
								print data
								
								print strResult_var
								print lngValue
						#========================================================================================
						# RASTER (mosaic or dataset)
						#========================================================================================								
						
						if (blnDebug==1):							
							print strResult_var;
							print lngValue
						lngValueDev=''		
						strResult_dev=''

						if (arrayTemp[0]!="HISTOGRAM"):	
							# if the dataset is a bar, the SD doesn't work
							# se e'un bar non funziona la standard deviation
							# quindi inutile recuperare il valore							
							if (arrayParams["blnDeviation"]==1):		
								if (blnDebug==1):		
									print "calcolo deviation"
								#========================================================================================
								# RASTER (mosaic or dataset)
								#========================================================================================									
								if ((arrayFName["type"]!="s_m") and (arrayFName["type"]!="s_d")):
									#print arrayFName_deviation
									if arrayFName_deviation:	
										if (blnDebug==1):		
											print "STANDARD deviation"
										#========================================================================================							
										# STANDARD DEVIATION
										#========================================================================================																					
										arrayParams["strCoverage"]=arrayFName['sd']																
										
										blnContinueDateLayer=_verifyIfDateIsAvailable(strTempDateOrUp,arrayParams["strCoverage"],arrayFName_deviation["type"],arrayFName_deviation["dates_available"],arrayFName_deviation["fixed"],arrayFName_deviation["dateFormat"]);
										
										# verify if the layername exists in getCapabilities
										if (blnContinueDateLayer==1):	
											
											if (arrayParams["operation"]=="POINT" or arrayParams["operation"]=="BOX"):

												#========================================================================================							
												# COVERAGE (WCS)
												#========================================================================================												
												data=returnCoverageMeanValue(arrayParams["operation"],strTempDate,arrayParams,arrayFName_deviation,arrayVDataset_deviation,strResult_var,0)
											else:				
												#========================================================================================							
												# CROP COVERAGE (WPS)
												#========================================================================================												
												data=returnCropCoverageMeanValue(arrayParams["operation"],strTempDate,arrayParams,arrayFName_deviation,arrayVDataset_deviation,strResult_var,0)						

											strResult_dev=str(_returnMeanValue(arrayParams["operation"],data,arrayVDataset_deviation,arrayFName_deviation["formula"],strResult_var,0,arrayFName["colorsScale"]))
											
											lngValueDev=_returnTransformMean(strResult_dev,arrayFName_deviation,arrayVDataset_deviation,1);																			
											
											if (blnDebug==1):							
												print data
												print strResult_dev;											
												print lngValueDev
											
											
											#exit(0);
									else:	
										if (blnDebug==1):		
											print "SPATIAL deviation"
										
										#========================================================================================							
										# SPATIAL DEVIATION
										#========================================================================================																					
										if (arrayTemp[0]!="STEPCHART"):
											
											#if (arrayParams["operation"]=="BOX"):											
											#	#========================================================================================							
											#	# COVERAGE (WCS)
											#	#========================================================================================												
											#	data=returnCoverageMeanValue(arrayParams["operation"],strTempDate,arrayParams,arrayFName,arrayVDataset,strResult_var,1)
											#else:		
											#	if (arrayParams["operation"]=="SHAPE"):											
											#	#========================================================================================							
											#	# CROP COVERAGE (WPS)
											#	#========================================================================================												
											#		#data=returnCropCoverageMeanValue(arrayParams["operation"],strTempDate,arrayParams,arrayFName,arrayVDataset,strResult_var,1)
											if (arrayParams["operation"]=="SHAPE" or arrayParams["operation"]=="BOX"):																							
												strResult_dev=str(_returnMeanValue(arrayParams["operation"],data,arrayVDataset,arrayFName["formula"],strResult_var,1,arrayFName["colorsScale"]))												
												lngValueDev=_returnTransformMean(strResult_dev,arrayFName,arrayVDataset,1);								
												if (blnDebug==1):																			
													print data
													print strResult_dev
													print strResult_var
													print lngValueDev
								#========================================================================================
								# RASTER (mosaic or dataset)
								#========================================================================================									
						
						if (arrayTemp[0]=="STEPCHART"):
							if (lngValueDev==""):															
								if (lngValue==""):
									if (strPrevStepChart!=""):
										lngValue=strPrevStepChart;
									else:
										lngValue=strEmptyString;
								
								lngValue=str(lngValue).replace(",", ",,");
								strPrevStepChart=str(lngValue)																			
								# add the standard deviation to null values for each value									
					else:						
						lngValueDev=''
						lngValue=''
						if (arrayTemp[0]=="STEPCHART"):														
							'''
							lngValue=strEmptyString;
							if (arrayParams["blnDeviation"]==1):
								lngValue=str(lngValue).replace(",", ",,");
							lngValueDev=''						
							'''
							lngValue=strPrevStepChart							
							if (strPrevStepChart==""):
								lngValue=strEmptyString;
								if (arrayParams["blnDeviation"]==1):
									lngValue=str(lngValue).replace(",", ",,");
							lngValueDev=''
							
						
					
					strLine+=str(lngValue)+','+str(lngValueDev)+','
				# save the line
				strLine=strLine[:-1]+'\n'
				if (blnDebug==1):
					print strLine
					sys.exit(0);
				# save the data into the .csv
				#print strLine
				#print arrayParams["strCSVFile"]
				#print arrayParams["strCSVFile"]
				_formatCsvFile(strLine,arrayParams["strCSVFile"]);

				#f = open("/srv/tmp/CA/monica.txt",'a')
				#f.write(strLine)
				#f.close()


				#exit(0);
	# return the http filename
	strHttpFilename=_returnHttpFilename(arrayParams["strCSVFile"]);	
	response['result']=1;
	response['error']='';
	# return
	print(json.JSONEncoder().encode(response))
except:
	_writeTrace(str(sys.exc_info()))	
	if (strError==""):
		strError='There was an error with the request. Pleae, try again.'
	response={'result': 0, 'error': strError}
	print(json.JSONEncoder().encode(response))