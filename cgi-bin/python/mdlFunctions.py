#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
#import sys
#sys.path.insert(0, '/usr/lib64/python2.6/site-packages')
import os
import cgi
import cgitb
from owslib.wcs import WebCoverageService as w  
from owslib.wms import WebMapService
from owslib.wfs import WebFeatureService
import numpy as np
import gdal
import ast
from gdalconst import *
from array import *
import time
import datetime
from osgeo import ogr
from osgeo import osr
from datetime import datetime
from datetime import *
from urllib import urlencode
from owslib.util import openURL, testXMLValue
from urllib2 import urlopen
import ConfigParser
from xml.dom.minidom import parse, parseString
import xml.etree.ElementTree as ET
import socket
from statistics import mode,stdev,variance
#from collections import Counter

from math import log, exp
import sys

'''--------------------------------------------------------------------------
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
# ini file

# ROBUSMON: 30/04/2015
# Added python to EEA in order to retrieve the correct path of data.ini.
strGIniFile=os.getcwd()+'/data.ini'

# GeoServer
strGGS=''
# GeoNetwork
strGGN=''
# WPS
strGOWSWPS=''
# WFS
strGOWSWFS=''
# WMS
strGOWSWMS=''
# CSW
strGOWSCSW=''
# OWS
strGOWS=''

strGPhysPathTemporaryDir=""
strGHttpPathTemporaryDir=""

# WCS settings
strGWCSService='WCS'
strGWCSVersion='1.0.0'
strGWCSRequest='GetCoverage';

# WMS settings
strGWMSService='WMS'
strGWMSVersion='1.1.0'
strGWMSRequestMap='GetMap';
strGWMSRequestLegend='GetLegendGraphic';

# WFS settings
strGWFSService='WFS'
strGWFSVersion='1.0.0'
strGWFSRequest='GetFeature';

# WPS settings
strGWPSService='WPS'
strGWPSVersion='1.0.0'
strGWPSRequest='ras:CropCoverage';	

# CSW settings
strGCSWService='CSW'
strGCSWVersion='2.0.2'
strGCSWRequest='GetRecordById';	
strGCSWElementName='full';
strGCSWElementNameFull='full';	
strGCSWOutputSchema='csw:IsoRecord';	

# EPSG codes
strGEPSGF4326Proj='EPSG:4326'
strGEPSGF900913Proj='EPSG:900913'
cont=0
strGGeometry = ''
strGGetCap=''
blnFromGeoNetwork=1
strGBBox=''
# position of dataset string saved into the the configuration file
lngGPosIni_Enabled=0;
lngGPosIni_Name=1;
lngGPosIni_Description=2;
lngGPosIni_GeoNetID=3;
lngGPosIni_Colors=4;
lngGPosIni_DataType=5;
lngGPosIni_Formula=6;
lngGPosIni_Interval=7;
lngGPosIni_FixedInterval=8;
lngGPosIni_ReturnID=9;
lngGPosIni_OwnerGroup=10;
lngGPosIni_OwnerSubGroup=11;
lngGPosIni_Legend=12;
lngGPosIni_Sd=13;
lngGPosIni_ShapeValues=14;
lngGPosIni_dateFormat=15;
lngGPosIni_Scenario=16;

# Ini settings
strGIniCIndicatorDataset='CLIMATEINDICATOR_DATASET'

strGIniSectionPdf='PDF_CONFIGURATION';
strGIniPdf_copyrightConf='PDF_COPYRIGHT_CONF'
strGIniPdf_copyrightText='PDF_COPYRIGHT_TEXT'
strGIniPdf_copyrightReplace='PDF_COPYRIGHT_REPLACE'

strGIniNationalLinks='NATIONAL_LINKS'
strGIniNLink_layer='NATIONALLINK_LAYER'
strGIniNLink_cahttp='NATIONALLINK_CAHTTP'
strGIniNLink_natField='NATIONALLINK_NATFIELD'
strGIniNLink_meteoField='NATIONALLINK_METEOFIELD'

strGIniSystem='SYSTEM'
strGIniSystem_pathTempDir='PATH_TEMPORARY_DIR'
strGIniSystem_httpTempDir='HTTP_TEMPORARY_DIR'
strGIniSystem_pathHtmlDir='PATH_HTML_DIR'
strGIniSystem_httpGeoServer='HTTP_GS'
strGIniSystem_httpGeoNetwork='HTTP_GN'

strGIniSectionGraph='GRAPH_CONFIGURATION'
strGGraph_Title='GRAPH_TITLE'
strGGraph_xTitle='GRAPH_XTITLE'
strGGraph_width='GRAPH_WIDTH'
strGGraph_height='GRAPH_HEIGHT'
strGGraph_numY1Dataset='GRAPH_NUM_Y1_MAXDATASET'
strGGraph_numY2Dataset='GRAPH_NUM_Y2_MAXDATASET'
strGGraph_numDecPlaces='GRAPH_NUMDPLACES'
strGGraph_refreshMSec='GRAPH_REFRESH_MSECONDS'
strGMView_numMaxLayers='GRAPH_MVIEW_MAXLAYERS'
strGMView_latLongNPlaces='GRAPH_MVIEW_LATLONG_NUMDPLACES'

arrayValues=''
strGFileServiceHttp='' 

'''--------------------------------------------------------------------------	
 Function used to return the title of the graph.
--------------------------------------------------------------------------	'''
def _returnGraphTitle(arrayParams):	
	
	#print arrayParams
	strTitle=_returnIniValue('GRAPH_CONFIGURATION', 'GRAPH_TITLE');		
	
	if (arrayParams["shapeInfo"]=="selection"):
		strTitle+=': '+arrayParams["shapeInfo"]
	else:
		if (arrayParams["operation"]=="POINT"):
			strTitle+=': point (lat '+arrayParams["txtLLat"]+'&deg;, lon '+arrayParams["txtLLon"]+'&deg;)'		
		else:
			if (arrayParams["operation"]=="BOX"):
				strTitle+=': box (lat '+arrayParams["txtLLat"]+'&deg;;'+arrayParams["txtULat"]+'&deg;, lon '+arrayParams["txtLLon"]+'&deg;;'+arrayParams["txtRLon"]+'&deg;)'
			else:
				if (arrayParams["operation"]=="SHAPE"):
					strTitle+=': '+arrayParams["shapeInfo"]
				#else:
				#	if (arrayParams["operation"]=="SELECTION"):
				#		strTitle+=': selection'
		
	return strTitle

'''--------------------------------------------------------------------------	
--------------------------------------------------------------------------	'''

def _returnHttpGN():
	global strGIniSystem;
	global strGIniSystem_httpGeoNetwork;	
	global strGGN;
	if (strGGN==""):
		strGGN=_returnIniValue(strGIniSystem, strGIniSystem_httpGeoNetwork)		

	return strGGN;
'''--------------------------------------------------------------------------	
--------------------------------------------------------------------------	'''

def _returnHttpGS():
	global strGIniSystem;
	global strGIniSystem_httpGeoServer;	
	global strGGS;
	if (strGGS==""):
		#print strGIniSystem, strGIniSystem_httpGeoServer
		strGGS=_returnIniValue(strGIniSystem, strGIniSystem_httpGeoServer)		

	return strGGS;
'''--------------------------------------------------------------------------	
--------------------------------------------------------------------------	'''
def _returnVariableDef(strType):
	
	if (strType=="WPS"):
		# WPS
		global strGOWSWPS;
		if (strGOWSWPS==""):
			strGOWSWPS=_returnHttpGS()+"TestWfsPost"					
		return strGOWSWPS;
	else:
		if (strType=="WFS"):
			# WFS
			global strGOWSWFS;
			if (strGOWSWFS==""):

				strGOWSWFS=_returnHttpGS()+"CA_ANCILLARY/wfs?"
				#strGOWSWFS=_returnHttpGS()+"CA_LAND/ows?"
			return strGOWSWFS;
		else:
			if (strType=="WMS"):						
				# WMS				
				global strGOWSWMS;
				if (strGOWSWMS==""):				
					strGOWSWMS=_returnHttpGS()+"wms?"				
				return strGOWSWMS;
			else:
				if (strType=="OWS"):			
					# OWS
					global strGOWS;
					if (strGOWS==""):				
						#strGOWS=_returnHttpGS()+"/ows?strict=true"
						strGOWS=_returnHttpGS()+"CA_LAND/ows"
					return strGOWS;					
				else:
					if (strType=="CSW"):									
						# CSW
						global strGOWSCSW;		
						if (strGOWSCSW==""):							
							strGOWSCSW=_returnHttpGN()+"/srv/eng/csw?"		
						return strGOWSCSW;
						
					# WMS
					else:
						return "";
	return "";
'''--------------------------------------------------------------------------	
	Function used to trace each http execution.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _saveExec(strHTTP,strParams):
	global strGFileServiceHttp
	if (strGFileServiceHttp==''):
		strSection='TRACE'
		strKey='TRACE_HTTPSERVICE_FILE'	
		strGFileServiceHttp=str(_returnIniValue(strSection,strKey))	


	if (strGFileServiceHttp!=""):
		f = open(strGFileServiceHttp,'a')	
		f.write("\n"+strHTTP+' '+strParams)
		#print "\n"+strHTTP+' '+strParams
		f.close()
	return "";
'''--------------------------------------------------------------------------
	Function used to execute a http request.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _executeURL(strHTTP,strParams,strMethod):
	strData = urlencode(strParams)
	# trace
	_saveExec(strHTTP,strData);
	#print strHTTP,strData
	#import requests



	if (strHTTP[-1:]!="?"):
		strHTTP=strHTTP+'?'

	strHTTP=strHTTP+strData
	#print strHTTP

	#response = requests.get(strHTTP).text
	#strData='?service=CSW&outputSchema=csw%3AIsoRecord&request=GetRecordById&version=2.0.2&elementSetName=full&id=c48d4247-d499-44e4-91e8-6981cfe9270b'
	#strHTTP='http://139.191.148.153:8080/geonetwork//srv/eng/csw'
	#try:
	#print strHTTP
	#	print strData
	#	print strMethod

	try:
		import urllib2
		response=urllib2.urlopen(strHTTP)
		#output=openURL(strHTTP, strData, strMethod)
	except:

		strHTTP="http://h05-dev-lrmaps.jrc.it:8080/geoserver/CA_LAND/wms?"+strData
		try:
			response=urllib2.urlopen(strHTTP)
		except:
			print "errore"

	#print strHTTP, strData
	#print "result"
	#try:
	#	print output.read()
	#except:
	#		pass


	#print "---------------------------------"


	return response.read()
'''--------------------------------------------------------------------------	
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnEncodedArrayLayers(strType,strReturn,blnLoadOnlyValues):
	# for all layers saved into configuration file 
	arrayDatasets=returnVariablesList(strType);

	
	arrayLayers=[]
	arrayOrder=[]
	
	for singleDataset in arrayDatasets: 		
		
		blnExtract=0		
		if (strReturn == ""):
			blnExtract=1
		else:
			if (singleDataset[lngGPosIni_Name] == strReturn):
				blnExtract=1
		if (blnExtract==1):
			if (singleDataset[lngGPosIni_Enabled]!="0"):
				arrayReturn={}	
				arrayReturn["enabled"]=singleDataset[lngGPosIni_Enabled]

				arrayReturn["value"]=str(singleDataset[lngGPosIni_Name])
				arrayReturn["label"]=singleDataset[lngGPosIni_Description]
				arrayReturn["category"]=""
				arrayReturn["owner"]=singleDataset[lngGPosIni_OwnerGroup]				
				arrayReturn["subgroup"]=singleDataset[lngGPosIni_OwnerSubGroup]
				arrayReturn["scenario"]=''				
				if (lngGPosIni_Scenario<len(singleDataset)):
					arrayReturn["scenario"]=singleDataset[lngGPosIni_Scenario]					
				arrayReturn["datatype"]=singleDataset[lngGPosIni_DataType]
				arrayReturn["interval"]=singleDataset[lngGPosIni_Interval]
				arrayReturn["fixedinterval"]=singleDataset[lngGPosIni_FixedInterval]			
				arrayReturn["dateFormat"]='YYYYMMDD'
				if (lngGPosIni_dateFormat<len(singleDataset)):
					arrayReturn["dateFormat"]=singleDataset[lngGPosIni_dateFormat]			
				arrayReturn["id"]=singleDataset[lngGPosIni_GeoNetID]
				
				if (blnLoadOnlyValues==0):		
					# return attributes from GN
					arrayParams=_returnDatasetAttributes(singleDataset[lngGPosIni_GeoNetID],singleDataset[lngGPosIni_DataType])
					
					arrayReturn["fromDate"]=str(arrayParams["fromDate"])
					arrayReturn["toDate"]=str(arrayParams["toDate"])
				
				arrayLayers.append(arrayReturn);
				
				# save the order
				arrayOrder.append(singleDataset[lngGPosIni_Description]);
	#return the sorted array
	arrayPosition=sorted(range(len(arrayOrder)), key=lambda k: arrayOrder[k])
	
	arrayReturn=[]
	for pos in arrayPosition: 		
		arrayReturn.append(arrayLayers[pos]);		
	
	return arrayReturn
'''--------------------------------------------------------------------------	
	Function used to retrieve all groups.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnOwnerFromArrayLayers(arrayLayers,blnGraph):
	arrayOwner=[]
		
	# save the owner into an array
	for singleDataset in arrayLayers: 
		if (blnGraph==1):
			if (singleDataset["enabled"]=="1"):
				arrayOwner.append(singleDataset["owner"]);	
		else:
			if ((singleDataset["enabled"]!="0") and (singleDataset["scenario"]=="")):
				arrayOwner.append(singleDataset["owner"]);			
	# and then remove all empty and duplicate values
	yset = set(arrayOwner)
	arrayOwner=[]
	for singleDataset in yset: 		
		arrayOwner.append(singleDataset);	
	return arrayOwner	
'''--------------------------------------------------------------------------	
	Function used to read from configuration file all possible values (id_label)
	in order to split all dataset into sub-groups.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _returnSubOwnerDescr():
	global strGIniCIndicatorDataset;
	arrayValues=[]
	# [SUBOWNER_DATASET]
	# sowner_string=O_Observations<%%>P_Projections<%%>R<%%>Re-Analisys
	strTemp=_returnIniValue(strGIniCIndicatorDataset,"cidataset_string")		
	
	arrayTemp = strTemp.split('<%%>')				
	for strTemp in arrayTemp: 
		arrayValue=strTemp.split('_')				
		arrayToReturn={}
		arrayToReturn["id"]=arrayValue[0]
		arrayToReturn["label"]=arrayValue[1]
		arrayValues.append(arrayToReturn);	
	return arrayValues;
'''--------------------------------------------------------------------------	
	Function used to retrieve all groups available.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _returnGroupFromArrayLayers(arrayLayers):
	arrayGroup=[]	
	for singleDataset in arrayLayers: 
		arrayGroup.append(singleDataset["subgroup"]);	
	yset = set(arrayGroup)
	
	arraySubOwner=_returnSubOwnerDescr();
	
	arrayReturns=[]
	for singleDataset in yset: 		
		arrayReturn={}
		if (str(singleDataset)!=""):
			arrayReturn["groupid"]=str(singleDataset)
			for arrayToCheck in arraySubOwner: 	
				if (arrayToCheck["id"]==singleDataset):
					arrayReturn["grouplabel"]=arrayToCheck["label"];
			arrayGroup=[]
			for arrayLayer in arrayLayers: 		
				if (arrayLayer["subgroup"]==singleDataset):
					arrayGroup.append(arrayLayer);	
			arrayReturn["data"]=arrayGroup
			arrayReturns.append(arrayReturn);		
	return arrayReturns
'''--------------------------------------------------------------------------
	Function used to retrieve the metadata link.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnMetadataLink(lngID):	
	# return GN link
	#strMetadata=_returnHttpGN()+"/srv/en/metadata.show"+'?currTab=simple&uuid='+lngID+''
	strMetadata=_returnHttpGN()+"/srv/eng/catalog.search#/metadata/"+lngID+""
	return strMetadata;
'''--------------------------------------------------------------------------
	Function used to return the name of ini configuration file
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnIniFile():
	global strGIniFile
	# return global ini filename
	return strGIniFile;
'''--------------------------------------------------------------------------
	Function used to retrieve a map of a variable in order to put into a pdf file
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _returnGetMapLink(arrayFName,arrayVDataset,strYear,strMonth):
	strLink=''
		
	strLink=arrayVDataset["ows"]
	if (strMonth!="None"):
		strDate=strYear+strMonth
	else:
		strDate=strYear
	
	strDate=strDate.replace("-", "");
	
	if (arrayVDataset["serverType"] == "MAPSERVER"):	
		strLink+="&";		
		strTime=""
		
		if (arrayFName["type"]=="r_d"):
			strLayer=arrayFName["name"].replace("YYYYMMDD", strDate);
		else:
			if (arrayFName["type"]=="r_m"):
				strLayer=arrayFName["name"]				
				strTime=str(strDate)[:4]+'-'+str(strDate)[4:-2]+'-'+str(strDate)[6:]				
				#http://devfapar.ies.jrc.it/cgi-bin/mapserv?map=/srv/www/dvpt/WWW/Data/Pages/FAPAR_ELIS/mapserver/wms/ELIS/wms-t.map&service=WMS&version=1.1.0&request=GetMap&layers=test&styles=&bbox=-32,25,70.0,72.0&srs=EPSG:4326&format=image/png&width=600&height=400&time=2008-08-21
			else:
				if (arrayFName["type"]=="s_m"):
					strTempDate=str(strDate)				
					strLayer=arrayFName["name"].replace("REPLACEKEY", strTempDate);					
	else:		
		strLink+="?";				
		strTempName=''
		strTime=''
		
		if (arrayFName["type"]=="r_m"):
			strTempDate=str(strDate)[:4]+'-'+str(strDate)[4:-2]+'-'+str(strDate)[6:]
			strTime=strTempDate+'T00:00:00.000Z'
			strTempName=arrayFName["name"]	
		else:
			if (arrayFName["type"]=="s_m"):				
				strTempDate=str(strDate)				
				strTempName=arrayFName["name"].replace("REPLACEKEY", strTempDate);					
			else:
				if (arrayFName["type"]=="r_d"):
					strTempDate=str(strDate)[:4]+'-'+str(strDate)[4:-2]+'-'+str(strDate)[6:]
					strTempD=str(strTempDate)[:4]+str(strTempDate)[5:len(strTempDate)-3]+str(strTempDate)[8:len(strTempDate)];
					
					strTempName=arrayFName["name"].replace("YYYYMMDD", strTempD);
				else:
					strTempName=arrayFName["name"]
		strLayer=arrayFName["store"]+':'+strTempName
	
	global strGEPSGF4326Proj;
	
	# return reprojected values
	strBBox=_returnProjectedValues(str(arrayVDataset['westBoundLongitude']),str(arrayVDataset['southBoundLatitude']),str(arrayVDataset['eastBoundLongitude']),str(arrayVDataset['northBoundLatitude']),strGEPSGF4326Proj,strGEPSGF4326Proj);	
	

	global strGWMSService;
	global strGWMSVersion;
	global strGWMSRequestMap;

	# WMS link
	strLink+='service='+strGWMSService+'&version='+strGWMSVersion+'&request='+strGWMSRequestMap+'&layers='+strLayer+'&styles=&bbox='+strBBox+'&srs='+strGEPSGF4326Proj+'&format=image/png&width=600&height=400'	
	
	# add time
	if (strTime!=""):
		strLink+='&time='+strTime	
	# save and exec the link
	_saveExec(arrayVDataset["ows"],strLink);
	return strLink

'''--------------------------------------------------------------------------
	Function used to save the result of an http request into a file
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _saveFile(request,strHTTP):	
	try:
				
		#import urllib		
		#output = urlopen("http://emis.jrc.ec.europa.eu/cgi-bin/mapserv?map=%2Fsrv%2Fwww%2Fhtdocs%2Fwms%2Fwcs-t_4km.map&service=WCS&format=geotiff&crs=EPSG%3A4326&request=GetCoverage&height=3&width=3&version=1.1.0&BBox=-17.1708958225%2C42.598476950799999%2C-17.020504177499998%2C42.713723049199999&coverage=EMIS_T_ANO_SST&time=2000-02")
		#output = urlopen("http://fapar.jrc.ec.europa.eu/cgi-bin/mapserv?map=%2Fsrv%2Fwww%2Fhtdocs%2FWWW%2FData%2FPages%2FFAPAR_ELIS%2Fmapserver%2Fwms%2FELIS%2Fwms.map&service=WCS&format=geotiff&crs=EPSG%3A4326&request=GetCoverage&height=3&width=3&version=1.1.0&BBox=-17.121778619400001%2C42.638820588199998%2C-17.069621380600001%2C42.673379411799999&coverage=fapar_19980101")
		#print "=============================="
		#print output.read()
		#print "=============================="
		#exit(0);

		output=_executeURL(strHTTP, request, 'Post');

		
		# return the filename		
		strFilename=_returnFilename()
		#print strFilename


		f = open(strFilename,'wb')
		f.write(output)
		f.close()
		#print strFilename
		#print strFilename
		#print "================================="
		# open the tiff file with gdal
		from osgeo import gdal, gdalconst
		#print gdal.__version__
		ds = gdal.Open(strFilename, gdalconst.GA_ReadOnly)


		# numeber of cols
		cols = ds.RasterXSize
		# numeber of rows
		rows = ds.RasterYSize

		# number of bans
		bands = ds.RasterCount


		band = ds.GetRasterBand(1)
		data = band.ReadAsArray()

		_deleteFile(strFilename)


		return data	
	except:				
		#_deleteFile(strFilename)
		return "";	
def _returnReplaceDatasetIndicator():
	
	config = ConfigParser.ConfigParser()	
	strIniFile=_returnIniFile();		
	config.read(strIniFile)	
	
	
	strSection="DATASET_INDICATOR"
	
	lngTemp = config.get(strSection, "num_replacedatasetindicator")		
	
	arrayTemp = range(1,int(lngTemp)+1,1)	
	arrayReplace=[]
	for m in arrayTemp:
		strVarNum="replacedatasetindicator_"+str(m);				
		
		strTemp = config.get(strSection, strVarNum)
		
		arrayTemp = strTemp.split('<%%>')				
		arrayReplace.append(arrayTemp)	
		
	return arrayReplace
def _returnDatasetIndicatorGroup():
	arrayReturn=[]
	
	config = ConfigParser.ConfigParser()	
	strIniFile=_returnIniFile();		
	config.read(strIniFile)	
	

	strSection="DATASET_INDICATOR"
	
	lngTemp = config.get(strSection, "num_replacedatasetindicator")		
	arrayTemp = range(1,int(lngTemp)+1,1)	
	arrayReplace=[]
	for m in arrayTemp:
		strVarNum="replacedatasetindicator_"+str(m);				
		
		strTemp = config.get(strSection, strVarNum)
		arrayTemp = strTemp.split('<%%>')				
		arrayReplace.append(arrayTemp)	
		
	strKeyValue="datasetindicator_"	
	lngTemp = config.get(strSection, "num_datasetindicator")		
	arrayTemp = range(1,int(lngTemp)+1,1)	
	for m in arrayTemp:    			
		strVarNum=strKeyValue+str(m);		
		strTemp = config.get(strSection, strVarNum)
		arrayTemp = strTemp.split('<%%>')				
		arraySingleIndicator={}
		arraySingleIndicator["indicator"]=arrayTemp[0]
		arrayValues=arrayTemp[1].split('_')				
		
		arrayValues_graph=''
		for strTempV in arrayReplace:  					
			if (arrayTemp[1].find(strTempV[0])!=-1):						
				strTemp=arrayTemp[1].replace(strTempV[0], strTempV[1]);
				arrayValues_graph=strTemp.split('_')
				
		arraySingleIndicator["values_layer"]=arrayValues
		if (arrayValues_graph==''):
			arraySingleIndicator["values_graph"]=arrayValues
		else:
			arraySingleIndicator["values_graph"]=arrayValues_graph
		arrayReturn.append(arraySingleIndicator)	
	
	return arrayReturn			
'''--------------------------------------------------------------------------
	Function used to retrieve a filename used to save the data.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnFilename():
	# common dir
	global strGPhysPathTemporaryDir;
	
	if (strGPhysPathTemporaryDir==""):	
		strGPhysPathTemporaryDir=_returnTempDirectory(0);

	# filename
	strName=_returnUniqueFilename()+'.tiff'
	# return physical path
	return os.path.join(strGPhysPathTemporaryDir,strName)
'''--------------------------------------------------------------------------
	Return a filename used to save the coverage.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _returnUniqueFilename():
	import datetime
	
	#strValue=socket.gethostbyname(socket.gethostname())	
	strValue=''
	strValue+=str(datetime.datetime.now())
	strValue=strValue.replace(".", "");
	strValue=strValue.replace("-", "");
	strValue=strValue.replace(" ", "");
	strValue=strValue.replace(":", "");
	
	return strValue

'''--------------------------------------------------------------------------
	Function used to execute a query on a vector.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def queryFeature(arrayFName,arrayVDataset,arrayParams,lngDay,strTempKey,strOutputProjection):
	global strGEPSGF4326Proj;
	global strGEPSGF900913Proj;
	# change projection for mapserver
	if (arrayVDataset["serverType"]=="MAPSERVER"):
		strToProj=strGEPSGF900913Proj;
	else:
		strToProj=strGEPSGF4326Proj;	
		
	if (arrayFName["shape_values"]==""):		
		# replace the key REPLACEKEY with a valid date
		pos = arrayFName["name"].find("REPLACEKEY")					
		if (pos!=-1):				
			strTempDate=arrayParams["strDate"].replace("-", "");
			strTemp=arrayFName["name"].replace("REPLACEKEY", strTempDate);						
			if (strTempKey==""):		
				strTempKey=arrayFName["returnid"]	
		else:
			strTemp=arrayFName["name"]				
	else:	
		# replace the key REPLACEKEY with all fixed date saved into ini file
		pos = arrayFName["name"].find("REPLACEKEY")					
		if (pos!=-1):				
			strTempDate=arrayParams["strDate"].replace("-", "");			
			strTemp=arrayFName["name"].replace("REPLACEKEY", strTempDate);							
		else:		
			strTemp=arrayFName["name"]						
		
		cont=0			
		
		if ((strTempKey!="the_geom") and (lngDay!="")):		
			# read the day
			for value in arrayFName["shape_dates"]:			
				if (int(value)==int(lngDay)):
					strTempKey=arrayFName["shape_values"][cont]				
				else:
					cont=cont+1
	
	
	strStoreName=arrayFName["store"];	
	strHttp=arrayVDataset["ows"];	
	# save the request
	
	global strGWFSService;
	global strGWFSVersion;
	global strGWFSRequest;		
	request = {'service': strGWFSService, 'version': strGWFSVersion, 'request': strGWFSRequest,'srsname':str(strGEPSGF4326Proj)}	
	
	strBBox=_returnProjectedValues(str(arrayParams['txtLLon']),str(arrayParams['txtLLat']),str(arrayParams['txtLLon']),str(arrayParams['txtLLat']),arrayVDataset["crs"],strToProj);		
	request['BBox']=strBBox
	blnGeom=0
	if (strTempKey=="the_geom"):
		blnGeom=1	
	if (arrayVDataset["serverType"] == "MAPSERVER"):				
		request['typeName']=strTemp
		request['layer']=strTemp
		if (strTempKey=="the_geom"):
			strTempKey="msGeometry"
			if (strStoreName==""):
				arrayTemp = arrayFName["returnid"].split(':')									
				strTempKey=arrayTemp[0]+':'+strTempKey
	else:
		request['layer']=strStoreName+':'+strTemp
		request['typeName']=strStoreName+':'+strTemp
				
	if (strStoreName!=""):
		request['propertyName']=strStoreName+':'+strTempKey;
	else:
		request['propertyName']=strTempKey;
	
	# execute the request
	output=_executeURL(strHttp, request, 'Post');
	
	# XML output
	strXML=output
	
	# error messages
	strError1="WFS server error";	
	pos1 = strXML.find(strError1)		
	strError2="InvalidParameterValue";	
	pos2 = strXML.find(strError2)		
	#strError3="unknown";	
	#pos3 = strXML.find(strError3)			
	
	if (pos1==-1 and pos2==-1):
		xmldoc = parseString(strXML)
		try:		
			slides = xmldoc.getElementsByTagName(request['propertyName'])		
			if (blnGeom==1):	
								
				if (arrayVDataset["serverType"] == "MAPSERVER"):				
					try:
						strValue=slides[0].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue							
					except:
						strValue=slides[0].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue;	
				else:					
					strValue= slides[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeValue;				
							
			else:				
				strValue = str(slides[0].childNodes[0].nodeValue.encode('utf8'))	
			return {'result':1, 'value':strValue}				
		except:
			strValue=''	
			return {'result':0, 'error':"Select a valid geographical area."}							
	else:
		if (pos1!=-1):
			strError=strError1;
		else:
			if (pos2!=-1):
				strError=strError2;
			#else:
			#	if (pos3!=-1):
			#		strError="Select a valid geographical area.";
		return {'result':0, 'error':strError}
			
'''--------------------------------------------------------------------------
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def returnVariableFeature(strVar):
	# read from ini file and return all dataset saved
	global arrayValues;
	# ================
	# DATASET
	# ================
	if (strVar==""):
		return ""
	if (arrayValues==""):
		arrayValues=returnVariablesList('DATASET');		
	
	arrayDataset=[]
	strLegend=''
	strSD=''
	strReturnID=''		
	strReturnLabel='';
	count = 0
	blnFound=0
	while (count < len(arrayValues) and blnFound==0):
		
		if (arrayValues[count][lngGPosIni_Name]==strVar):
			blnFound=1
		else:
			count = count + 1
	strStore=''
	if (blnFound==1):
		
		arrayReturn=arrayValues[count]
		# LAYER NAME
		try:
			strEnabled=arrayValues[count][lngGPosIni_Enabled]
			pos = arrayValues[count][lngGPosIni_Name].find(":")
			if (pos != -1):
				arrayTemp = arrayValues[count][lngGPosIni_Name].split(':')
				# Geoserver configuration
				# STORE
				strStore=arrayTemp[0]		
				# LAYERNAME
				strLayerName=arrayTemp[1]
			else:			
				strLayerName=arrayValues[count][lngGPosIni_Name]			

		except:
			strEnabled="0"
			strLayerName='';
			strStore='';
		try:			
			
			if (arrayValues[count][lngGPosIni_ReturnID]!=""):
				pos = arrayValues[count][lngGPosIni_ReturnID].find("#")				
				if (pos != -1):
					arrayReturnValues = arrayValues[count][lngGPosIni_ReturnID].split('#')			
					
					strReturnID=arrayReturnValues[0]		
					strReturnLabel=arrayReturnValues[1]
				else:
					strReturnID=arrayValues[count][lngGPosIni_ReturnID]		
					strReturnLabel=strReturnID
					
		except:	
			strReturnID=''
			strReturnLabel=''

	else:	
		# ================
		# ANCILLARY
		# ================

		# read from ini file and return all ANCILLARY_DATASET saved
		arrayValues_ancillary=returnVariablesList('ANCILLARY_DATASET');
		count = 0
		blnFound=0
		
		while (count < len(arrayValues_ancillary) and blnFound==0):
		
			if (arrayValues_ancillary[count][lngGPosIni_Name]==strVar):
				
				blnFound=1
			else:
				count = count + 1		
		if (blnFound==1):
			strEnabled=arrayValues[count][lngGPosIni_Enabled]
			arrayReturn=arrayValues_ancillary[count]
			strStore=''
			
			pos = arrayReturn[lngGPosIni_Name].find(":")
			if (pos != -1):
				arrayTemp = arrayReturn[lngGPosIni_Name].split(':')
				strStore=arrayTemp[0]		
				strLayerName=arrayTemp[1]
			else:
				strLayerName=arrayReturn[lngGPosIni_Name]			
			
			if (len(arrayReturn)>lngGPosIni_ReturnID):				
				pos = arrayReturn[lngGPosIni_ReturnID].find("#")
				if (pos != -1):
					arrayReturnValues = arrayReturn[lngGPosIni_ReturnID].split('#')			
					strReturnID=arrayReturnValues[0]		
					strReturnLabel=arrayReturnValues[1]
				else:
					strReturnID=arrayReturn[lngGPosIni_ReturnID]				
					strReturnLabel=strReturnID
									
		else:	
			# ================
			# SD DATASETS
			# ================

			# read from ini file and return all DATASET_SD saved		
			arrayValues_sd=returnVariablesList('DATASET_SD');
			
			count = 0
			blnFound=0
			
			while (count < len(arrayValues_sd) and blnFound==0):
				 
				if (arrayValues_sd[count][lngGPosIni_Name]==strVar):
					blnFound=1
				else:
					count = count + 1		
			if (blnFound==1):
				strEnabled=arrayValues[count][lngGPosIni_Enabled]
				arrayReturn=arrayValues_sd[count]
				strStore=''				
				pos = arrayReturn[lngGPosIni_Name].find(":")
				if (pos != -1):
					arrayTemp = arrayReturn[lngGPosIni_Name].split(':')
					strStore=arrayTemp[0]		
					strLayerName=arrayTemp[1]
				else:
					strLayerName=arrayReturn[lngGPosIni_Name]			
				if (len(arrayReturn)>lngGPosIni_ReturnID):				
					pos = arrayReturn[lngGPosIni_ReturnID].find("#")
					if (pos != -1):
						arrayReturnValues = arrayReturn[lngGPosIni_ReturnID].split('#')			
						strReturnID=arrayReturnValues[0]		
						strReturnLabel=arrayReturnValues[1]
					else:
						strReturnID=arrayReturn[lngGPosIni_ReturnID]				
						strReturnLabel=strReturnID				
			else:		
				return arrayDataset
				
	
	# save results
	# store name
	arrayDataset = {'store': strStore}
	# color scale
	if (len(arrayReturn)>lngGPosIni_Colors):			
		arrayDataset['colorsScale']=arrayReturn[lngGPosIni_Colors]		
	# name
	
	arrayDataset['name']=strLayerName
	# enabled
	
	arrayDataset['enabled']=strEnabled
	# id
	
	arrayDataset['id']=arrayReturn[lngGPosIni_GeoNetID]	
	# interval
	
	arrayDataset['interval']=''
	if (len(arrayReturn)>lngGPosIni_Interval):		
		arrayDataset['interval']=arrayReturn[lngGPosIni_Interval]	
	# type
	arrayDataset['type']=''
	if (len(arrayReturn)>lngGPosIni_DataType):		
		arrayDataset['type']=arrayReturn[lngGPosIni_DataType]	
	# formula
	arrayDataset['formula']=''	
	if (len(arrayReturn)>lngGPosIni_Formula):		
		arrayDataset['formula']=arrayReturn[lngGPosIni_Formula]	
	# description
	
	arrayDataset['description']=''
	if (len(arrayReturn)>lngGPosIni_Description):					
		arrayDataset['description']=arrayReturn[lngGPosIni_Description]	
	# fixed interval
	arrayDataset['fixed']=arrayReturn[lngGPosIni_FixedInterval]	
	# return id
	arrayDataset['returnid']=strReturnID		
	# return label
	arrayDataset['returnlabel']=strReturnLabel
	# legend
	arrayDataset['legend']=''	
	
	if (len(arrayReturn)>lngGPosIni_Legend):		
		arrayDataset['legend']=arrayReturn[lngGPosIni_Legend]	
	# sd
	arrayDataset['sd']=''	
	if (len(arrayReturn)>lngGPosIni_Sd):		
		arrayDataset['sd']=arrayReturn[lngGPosIni_Sd]	
	# shape additional info
	arrayDataset['shape_dates']="";
	arrayDataset['shape_values']="";	
	if (len(arrayReturn)>lngGPosIni_ShapeValues):		
		pos = arrayReturn[lngGPosIni_ShapeValues].find("#")			
		
		if (pos!=-1):
			arrayTemp=arrayReturn[lngGPosIni_ShapeValues].split('#')		
			
			arrayDataset['shape_values']=arrayTemp[0].split(',')		
			
			if (arrayTemp[1]!=""):
				arrayDataset['shape_dates']=arrayTemp[1].split(',')
			
	arrayDataset['owner']=''
	if (len(arrayReturn)>lngGPosIni_OwnerGroup):		
		arrayDataset['owner']=arrayReturn[lngGPosIni_OwnerGroup]			
	arrayDataset['subgroup']=''
	if (len(arrayReturn)>lngGPosIni_OwnerSubGroup):		
		arrayDataset['subgroup']=arrayReturn[lngGPosIni_OwnerSubGroup]	
	arrayDataset['dateFormat']='YYYYMMDD'	
	if (len(arrayReturn)>lngGPosIni_dateFormat):		
		arrayDataset['dateFormat']=arrayReturn[lngGPosIni_dateFormat]	
	arrayDataset['scenario']="";
	if (len(arrayReturn)>lngGPosIni_Scenario):		
		arrayDataset['scenario']=arrayReturn[lngGPosIni_Scenario]	
		
	# return array
	return arrayDataset				
'''--------------------------------------------------------------------------
	Function used to retrieve all info saved into data.ini file for a single dataset
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def returnShapeFile_replacekey(strVar):
	# return all dataset saved into the configuration file
	arrayValues=returnVariablesList('DATASET');
	strReturnID=''
	count = 0
	blnFound=0
	while (count < len(arrayValues) and blnFound==0):		
		if (arrayValues[count][lngGPosIni_Name]==strVar):
			blnFound=1
		else:
			count = count + 1
	if (blnFound==1):
		strStore=''
		
		strReturn=arrayValues[count][lngGPosIni_FixedInterval]				
		arrayTemp = strReturn.split('_')		
		
		return arrayTemp
	else:		
		arrayTemp=[]
		arrayTemp.append("");
		return arrayTemp;		
'''--------------------------------------------------------------------------
	Function used to retrieve the copyright in order to save into pdf file.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''		
def _returnPdfCopyright(lngID):	
	global strGIniSectionPdf;
	global strGIniPdf_copyrightConf;
	global strGIniPdf_copyrightText;
	global strGIniPdf_copyrightReplace;
	
	# if read geonetwork
	strTextGN=_returnCSWText(lngID);					
	
	xmldoc = parseString(strTextGN)
	# from ini file
	strReadFrom=_returnIniValue(strGIniSectionPdf, strGIniPdf_copyrightConf)		
	strText=''
	if (strReadFrom=="GEONETWORK"):
		# read copyright from geonetwork
		try:		
		
			slides = xmldoc.getElementsByTagName("gmd:resourceConstraints")			
			strText=slides[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue	
		
		except:
			strTag=''
			strText=''
	else:
		if (strReadFrom=="TEXT"):
			# read copyright from ini file and replace variables		
			strText=_returnIniValue(strGIniSectionPdf, strGIniPdf_copyrightText)	
			strTextReplace=_returnIniValue(strGIniSectionPdf, strGIniPdf_copyrightReplace)	
			arrayTemp = strTextReplace.split(',')		
			for strTempValue in arrayTemp:    			
				
				arraySingleReplace = strTempValue.split('_')		
				slides = xmldoc.getElementsByTagName(arraySingleReplace[1])		
				# read the content of CharacterString
				# 
				# <gmd:individualName>
				# <gco:CharacterString>REMBOLD Felix</gco:CharacterString>
				# </gmd:individualName>
				strReplace=slides[0].childNodes[1].childNodes[0].nodeValue				
				strText=strText.replace(arraySingleReplace[0], strReplace);
		
	# return the text	
	return strText;	
'''--------------------------------------------------------------------------
	Function used to retrieve the geonetwork link in order to load dataset values.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _returnCSWText(lngID):
	
	strOWSCSW=_returnVariableDef("CSW");
# CSW settings
	global strGCSWService
	global strGCSWVersion
	global strGCSWRequest
	global strGCSWElementNameFull
	global strGCSWOutputSchema;

	# request 
	request = {'request': strGCSWRequest,'service': strGCSWService, 'version': strGCSWVersion, 'elementSetName': strGCSWElementNameFull, 'outputSchema': strGCSWOutputSchema, 'id': lngID}	
	# exec the request
	output=_executeURL(strOWSCSW, request, 'Post');	
	# return the output
	strText=output
	return strText
'''--------------------------------------------------------------------------
	Return array values for each type saved into the configuration file.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def returnVariablesList(strType):
	
	arrayValues=[]

	if (strType=='DATASET'):
		strSection='DATASET'
		strKeyNum='num_dataset'
		strKeyValue='dataset_'
	else:
		if (strType=='ANCILLARY_DATASET'):		
			strSection='ANCILLARY_DATASET'
			strKeyNum='num_ancillarydataset'
			strKeyValue='ancillarydataset_'
		else:
			strSection='DATASET_SD'
			strKeyNum='num_datasetsd'
			strKeyValue='datasetsd_'
	
	
	config = ConfigParser.ConfigParser()	
	strIniFile=_returnIniFile();		
	config.read(strIniFile)	
	
	lngTemp = config.get(strSection, strKeyNum)
	arrayTemp = range(1,int(lngTemp)+1,1)	
	for m in arrayTemp:    			
		strVarNum=strKeyValue+str(m);
		#print strVarNum
		strTemp = config.get(strSection, strVarNum)
		arrayTemp = strTemp.split('<%%>')		
		arrayValues.append(arrayTemp)
		
	return arrayValues

'''--------------------------------------------------------------------------
	Function used to check if a year is a leap year.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def is_leap_year(year):
	a=int(year)/4
	b=a*4
	if (b==year):
		return 1;
	else:
		return 0;
'''--------------------------------------------------------------------------
	Function used to retrieve a date from a DOY.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''		
def returnIfLeapYear(lngDay,lngYear):
	#
	lngDay=int(lngDay);
	
	lngYear=int(lngYear);
	strTempDate=date.fromordinal(date(lngYear, 1, 1).toordinal() + lngDay - 1)
	strTempDate = datetime.strptime(str(strTempDate),"%Y-%m-%d")
	lngMonth=int(strTempDate.month)
	blnLeap=is_leap_year(lngYear)
	# if the year is leap
	if (blnLeap==1):		
		if (lngMonth>=2):
			if (lngDay>52):
				lngDay=int(lngDay)+1;
				strTempDate=date.fromordinal(date(lngYear, 1, 1).toordinal() + lngDay - 1)
				strTempDate = datetime.strptime(str(strTempDate),"%Y-%m-%d")				
	# verify date	
	return strTempDate;
		
'''--------------------------------------------------------------------------
	Function used to retrieve all "days" conditions in order to laods all dates.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnDayConditions(strTemporalType,strTempDates):	

	arrayDays=[]
	if (strTempDates!=""):
		for day in strTempDates: 
			arrayDays.append(int(day))		
		return arrayDays
		
	if (strTemporalType=="10d"):
		lngCont=-1
		arrayD=[1,11,21]
		arrayM=range(1,13,1)		
		
		for m in arrayM:    		
			for d in arrayD:
				strDate = date(2011, m, d)	
				a=strDate.timetuple().tm_yday				
				arrayDays.append( a)										
				
	else:
		if (strTemporalType=="16d"):
			lngCont=16
		else:
			if (strTemporalType=="15d"):
				lngCont=15
			else:
				if (strTemporalType=="1d"):
					lngCont=1
				else:
					if (strTemporalType=="1m"):
						
						lngCont=-1
						arrayDays=[]
						arrayM = range(1,13,1)	
						
						for m in arrayM:    		
							strDate = date(2011, m, 1)	
							a=strDate.timetuple().tm_yday															
							arrayDays.append(a)
						
					else:
						if (strTemporalType=="1y"):
							lngCont=365
						else:
							if (strTemporalType=="10y"):
								lngCont=365
							else:						
								if (strTemporalType=="10d"):
									lngCont=1
								else:								
									lngCont=-1
									arrayDays=[1]
	
	if (lngCont!=-1):
		arrayDays = range(1,366,lngCont)		
		
	return arrayDays
'''--------------------------------------------------------------------------
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
#def _returnDayConditions_daily(strTemporalType):	
#	lngCont=1
#	arrayDays = range(1,366,lngCont)		
#		
#	return arrayDays
'''--------------------------------------------------------------------------
	Function that extrapolates from each dataset string saved into the configuration
	file all values and return an array with all values.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _readLayerName(strCoverage):
	arrayTemp = strCoverage.split(':')
	strStore=arrayTemp[0]
	arrayCoverage=arrayTemp[1].split('_')
	strGroup=arrayCoverage[0]
	strCoverageName=arrayCoverage[1]
	strID=arrayCoverage[2]
	strCoverageType=arrayCoverage[3]	#d: dataset, m: mosaic, s:shapefile
	strCoverageTemporal=""
	if (len(arrayCoverage)>3):
		strCoverageTemporal=arrayCoverage[4]
	
	arrayDataset = {'store': strStore, 'colorsScale': strGroup, 'name': strCoverageName,'id': strID,'interval': strCoverageTemporal,'type': strCoverageType}
	
	return arrayDataset
'''--------------------------------------------------------------------------
	Function used to retrieve all info from GN about the dataset.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _returnDatasetAttributes(lngID,strType):
# CSW settings
	global strGCSWService
	global strGCSWVersion
	global strGCSWRequest
	global strGCSWElementName
	global strGCSWOutputSchema;
	
	# request 
	# brief
	request = {'request': strGCSWRequest,'service': strGCSWService, 'version': strGCSWVersion, 'id': lngID, 'elementSetName': strGCSWElementName, 'outputSchema': strGCSWOutputSchema}
	#print request
	
	# exec the request
	strOWSCSW=_returnVariableDef("CSW");
	#print strOWSCSW
	#print request
	#strOWSCSW="http://139.191.148.153:8080/geonetwork/srv/eng/csw?"




	output=_executeURL(strOWSCSW, request, 'Post');

	a=output
	try:
		
		# identifier
		blnPrint=0
	

		
		xmldoc = parseString(a)

		
		#peakResponse
		try:
			strGetCap = xmldoc.getElementsByTagName("gmd:peakResponse")

			lngBadValues=strGetCap[0].childNodes[1].childNodes[0].nodeValue							
			
		except:
			lngBadValues=-1			
			
		# scaleFactor
		try:
			strGetCap = xmldoc.getElementsByTagName("gmd:offset")	
			lngOffset=strGetCap[0].childNodes[1].childNodes[0].nodeValue					
			
		except:
			lngOffset=-1
			
		#minValue
		try:
			strGetCap = xmldoc.getElementsByTagName("gmd:minValue")	
			lngMinValue=strGetCap[0].childNodes[1].childNodes[0].nodeValue									
			
		except:
			lngMinValue=-1		
			
		#maxValue
		try:
			strGetCap = xmldoc.getElementsByTagName("gmd:maxValue")	
			lngMaxValue=strGetCap[0].childNodes[1].childNodes[0].nodeValue									
		except:
			lngMaxValue=-1				
			
		# scaleFactor
		try:
			strGetCap = xmldoc.getElementsByTagName("gmd:scaleFactor")	
			lngScaleFactor=strGetCap[0].childNodes[1].childNodes[0].nodeValue															
		except:
			lngScaleFactor=-1
			
		# unit
		try:							
			strGetCap = xmldoc.getElementsByTagName("gmd:units")				
			strUnit=strGetCap[0].childNodes[1].childNodes[1].childNodes[0].nodeValue
			#try:
			strUnit=strUnit.encode('utf-8')				
			strUnit=strUnit.replace( '�', "");				
			strUnit=strUnit.replace( '�', "&deg;");				

		except:				
			strUnit=''
		
		# dimensionSize
		lngNumRows=-1			
		lngNumCols=-1			
		
		try:				
			strGetCap = xmldoc.getElementsByTagName("gmd:axisDimensionProperties")							
			strTemp = strGetCap[0].childNodes[1].childNodes[1].childNodes[1].attributes["codeListValue"].value				
			if (strTemp == "row"):					
				lngNumRows=float(strGetCap[0].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue)
			else:
				if (strTemp == "column"):					
					lngNumCols=float(strGetCap[0].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue)
		except:
			lngNumRows=-1			
			lngNumCols=-1	
		# dimensionSize
		
		try:
			
			strGetCap = xmldoc.getElementsByTagName("gmd:axisDimensionProperties")							
			strTemp = strGetCap[1].childNodes[1].childNodes[1].childNodes[1].attributes["codeListValue"].value								
			if (strTemp == "row"):					
				lngNumRows=float(strGetCap[1].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue)
			else:
				if (strTemp == "column"):					
					lngNumCols=float(strGetCap[1].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue)

		except:
			lngNumRows=-1			
			lngNumCols=-1	

		
		# westBoundLongitude
		try:				
			strGetCap = xmldoc.getElementsByTagName("gmd:westBoundLongitude")				
			westBoundLongitude=float(strGetCap[0].childNodes[1].childNodes[0].nodeValue)	
			
		except:
			westBoundLongitude=-1			
		# southBoundLatitude
		try:
			strGetCap = xmldoc.getElementsByTagName("gmd:southBoundLatitude")				
			southBoundLatitude=float(strGetCap[0].childNodes[1].childNodes[0].nodeValue)				
			
		except:
			southBoundLatitude=-1						
		# eastBoundLongitude
		try:
			strGetCap = xmldoc.getElementsByTagName("gmd:eastBoundLongitude")				
			eastBoundLongitude=float(strGetCap[0].childNodes[1].childNodes[0].nodeValue)				
		except:
			eastBoundLongitude=-1						
		try:
			# northBoundLatitude
			strGetCap = xmldoc.getElementsByTagName("gmd:northBoundLatitude")				
			northBoundLatitude=float(strGetCap[0].childNodes[1].childNodes[0].nodeValue)					
				
		except:
			northBoundLatitude=-1			
		# beginPosition
		try:

			strGetCap = xmldoc.getElementsByTagName("gml:beginPosition")
			#print strGetCap
			beginPosition=str(strGetCap[0].childNodes[0].nodeValue)													
			
		except:
			beginPosition=-1
		# endPosition
		
		try:
			strGetCap = xmldoc.getElementsByTagName("gml:endPosition")				
			endPosition=str(strGetCap[0].childNodes[0].nodeValue)								
		except:
			endPosition=-1		
		# endPosition
		strLink="";
		strGetCapabilities="";
		strGetWMS="";
		strGetWCS="";
		strGetWCSVersion=""

		try:	
			
			
			strGetCap = xmldoc.getElementsByTagName("gmd:MD_DigitalTransferOptions")


			strItem=strGetCap[0]


			
			strTemp = strItem.childNodes[1].childNodes[1].childNodes[7].childNodes[1].childNodes[0].nodeValue


			if (strTemp=="Online link"):
				strLink=str(strItem.childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)


			else:
				if (strTemp=="Get Capabilities"):
					strGetCapabilities=str(strItem.childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)


					strTemp = strItem.childNodes[1].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue												
					arrayTemp = strTemp.split('-')						
					strGetWMSVersion=arrayTemp[1]
					pos = strGetCapabilities.find("?")					
					strGetWMS=strGetCapabilities[0:pos]

				else:
					if (strTemp=="Web Coverage Service"):
						strGetWCS=str(strItem.childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)
						strTemp = strItem.childNodes[1].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue												
						arrayTemp = strTemp.split('-')						
						strGetWCSVersion=arrayTemp[1]							
					#else:
					#	if (strTemp=="View Map"):								
					#		strGetWMS=str(strItem.childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)
					#		strTemp = strItem.childNodes[1].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue												
					#		arrayTemp = strTemp.split('-')						
					#		strGetWMSVersion=arrayTemp[1]								

			if (len(strItem.childNodes)>3):
				try:
					# robusmo
					#strTemp = strItem.childNodes[3].childNodes[1].childNodes[7].childNodes[1].childNodes[0].nodeValue
					strTemp = strItem.childNodes[3].childNodes[1].childNodes[5].childNodes[1].childNodes[0].nodeValue


				except:
					pass


				if (strTemp=="Online link"):
					strLink=str(strItem.childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)
				else:
					#print strTemp
					if (strTemp=="Get Capabilities"):
						strGetCapabilities=str(strItem.childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)



						strTemp = strItem.childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue												
						arrayTemp = strTemp.split('-')	
						if (len(arrayTemp)>1):										
							strGetWMSVersion=arrayTemp[1]
						pos = strGetCapabilities.find("?")			
						if (pos!=-1):						
							strGetWMS=strGetCapabilities[0:pos]

						
					else:
						if (strTemp=="Web Coverage Service"):
							strGetWCS=str(strItem.childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)
							strTemp = strItem.childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue												
							arrayTemp = strTemp.split('-')		
							if (len(arrayTemp)>1):											
								strGetWCSVersion=arrayTemp[1]								
						#else:
						#	if (strTemp=="View Map"):

						#		strGetWMS=str(strItem.childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)
						#		strTemp = strItem.childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue												
						#		arrayTemp = strTemp.split('-')						
						#		strGetWMSVersion=arrayTemp[1]								
			
			if (len(strItem.childNodes)>5):

				strTemp = strItem.childNodes[5].childNodes[1].childNodes[7].childNodes[1].childNodes[0].nodeValue


				if (strTemp=="Online link"):
					strLink=str(strItem.childNodes[5].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)
				else:
					if (strTemp=="Get Capabilities"):
						strGetCapabilities=str(strItem.childNodes[5].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)
						strTemp = strItem.childNodes[5].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue												
						arrayTemp = strTemp.split('-')			
						if (len(arrayTemp)>1):						
							strGetWMSVersion=arrayTemp[1]
						pos = strGetCapabilities.find("?")	
						if (pos!=-1):						
							strGetWMS=strGetCapabilities[0:pos]
						
					else:
						if (strTemp=="Web Coverage Service"):
							strGetWCS=str(strItem.childNodes[5].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)
							strTemp = strItem.childNodes[5].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue												
							arrayTemp = strTemp.split('-')						
							if (len(arrayTemp)>1):
								strGetWCSVersion=arrayTemp[1]							
	

			if (len(strItem.childNodes)>7):

				try:
					strTemp = strItem.childNodes[7].childNodes[1].childNodes[7].childNodes[1].childNodes[0].nodeValue
				except:
					strTemp =''


				if (strTemp=="Online link"):
					strLink=str(strItem.childNodes[7].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)
				else:
					if (strTemp=="Get Capabilities"):
						strGetCapabilities=str(strItem.childNodes[7].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)

						strTemp = strItem.childNodes[7].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue												
						arrayTemp = strTemp.split('-')		
						if (len(arrayTemp)>1):						
							strGetWMSVersion=arrayTemp[1]
						pos = strGetCapabilities.find("?")											
						if (pos!=-1):
							strGetWMS=strGetCapabilities[0:pos]
					else:
						if (strTemp=="Web Coverage Service"):
							strGetWCS=str(strItem.childNodes[7].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue)							
							strTemp = strItem.childNodes[7].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue																			
							arrayTemp = strTemp.split('-')						
							if (len(arrayTemp)>1):
								strGetWCSVersion=arrayTemp[1]
							
	

		except:

			strLink=''
			strGetCapabilities=''
			strGetWMS=''
			strGetWCS=''
			strGetWMSVersion=''
			strGetWCSVersion=''
		# epsg
		try:

			strGetCap = xmldoc.getElementsByTagName("gmd:referenceSystemIdentifier")				
			strCRS=str(strGetCap[0].childNodes[1].childNodes[3].childNodes[1].childNodes[0].nodeValue)+":"+str(strGetCap[0].childNodes[1].childNodes[5].childNodes[1].childNodes[0].nodeValue)
		except:
			strCRS=''
			#endPosition=''
		if (strGetWCS==""):
			strGetWCS=strGetCapabilities
		
		if (strGetWCSVersion==""):
			#strGetWCSVersion=strGetWMSVersion			
			global strGWCSVersion
			strGetWCSVersion=strGWCSVersion			

		blnPrint=0
		#print a
		if (blnPrint == 1): print "beginPosition: "+str(beginPosition)		
		if (blnPrint == 1): print "endPosition: "+str(endPosition)		
		if (blnPrint == 1): print "strLink: "+str(strLink)		
		if (blnPrint == 1): print "strGetCapabilities: "+str(strGetCapabilities)		
		if (blnPrint == 1): print "strGetWMS: "+str(strGetWMS)						
		if (blnPrint == 1): print "strGetWMS version: "+str(strGetWMSVersion)		
		if (blnPrint == 1): print "strGetWCS: "+str(strGetWCS)						
		if (blnPrint == 1): print "strGetWCS version: "+str(strGetWCSVersion)						
		if (blnPrint == 1): print "strCRS: "+str(strCRS)		
		if (blnPrint == 1): print "westBoundLongitude: "+str(westBoundLongitude)
		if (blnPrint == 1): print "southBoundLatitude: "+str(southBoundLatitude)		
		if (blnPrint == 1): print "eastBoundLongitude: "+str(eastBoundLongitude)	
		if (blnPrint == 1): print "northBoundLatitude: "+str(northBoundLatitude)	
		if (blnPrint == 1): print "units: "+str(strUnit)				
		if (blnPrint == 1): print "rows: "+str(lngNumRows)
		if (blnPrint == 1): print "cols: "+str(lngNumCols)	
		if (blnPrint == 1): print "offset: "+str(lngOffset)		
		if (blnPrint == 1): print "bad values: "+str(lngBadValues)
		if (blnPrint == 1): print "maxValue: "+str(lngMaxValue)		
		if (blnPrint == 1): print "minValue: "+str(lngMinValue)				
		if (blnPrint == 1): print "scale factor: "+str(lngScaleFactor)		
		
		#exit(0);

						

		# -9999 not set
		datasetAttributes = {'peakResponse': lngBadValues}		
		datasetAttributes['scaleFactor']= lngScaleFactor
		datasetAttributes['offset']= lngOffset
		datasetAttributes['numRows']= lngNumRows
		datasetAttributes['numCols']= lngNumCols		
		
		datasetAttributes['westBoundLongitude']= westBoundLongitude
		datasetAttributes['southBoundLatitude']= southBoundLatitude
		datasetAttributes['eastBoundLongitude']= eastBoundLongitude
		datasetAttributes['northBoundLatitude']= northBoundLatitude
		
		datasetAttributes['minValue']=lngMinValue
		datasetAttributes['maxValue']=lngMaxValue
		
		if (strUnit==None):
			strUnit='';
		datasetAttributes['unit']=strUnit
		
		datasetAttributes['crs']= strCRS
		xsize=-1
		if (lngNumCols!=-1):
			xsize=abs(float(eastBoundLongitude)-float(westBoundLongitude))/float(lngNumCols)#0.016299137
		ysize=-1
		if (lngNumRows!=-1):
			ysize=abs(float(northBoundLatitude)-float(southBoundLatitude))/float(lngNumRows)#0.016299137
		datasetAttributes['xsize']= float(xsize)
		datasetAttributes['ysize']= float(ysize)
		datasetAttributes['externalLink']= strLink	
		
		pos = strGetCapabilities.find("geoserver")			
		if (pos==-1):
		# MAPSERVER
			strGetCapabilities=strGetCapabilities
			datasetAttributes['serverType']="MAPSERVER"
		else:
			datasetAttributes['serverType']="GEOSERVER"
			pos = strGetCapabilities.find("?")		
			if (pos!=-1):
				strGetCapabilities=strGetCapabilities[0:pos]
		pos = strGetWCS.find("geoserver")			
		if (pos==-1):
		# MAPSERVER
			strGetWCS=strGetWCS
			datasetAttributes['serverType']="MAPSERVER"
		else:
			datasetAttributes['serverType']="GEOSERVER"
			pos = strGetWCS.find("?")		
			if (pos!=-1):
				strGetWCS=strGetWCS[0:pos]				
				
		datasetAttributes['fromDate']=''
		datasetAttributes['ows']= strGetCapabilities		
		datasetAttributes['wcs']= strGetWCS	
		#print datasetAttributes
		
		# version of WMS				
		#strGetOwsVersion=''
		#pos = strGetWMSVersion.find("OGC:WMS-")				
		#if (pos!=-1):
		#	strGetWMSVersion=strGetWMSVersion[pos+len("OGC:WMS-"):]
		#	pos = strGetWMSVersion.find("-http-get-capabilities")		
		#	strGetOwsVersion=strGetWMSVersion[:pos]
		
		datasetAttributes['ows_version']= strGetWMSVersion
		datasetAttributes['wcs_version']= strGetWCSVersion
		
		if (beginPosition != -1):
			date_object = datetime.strptime(str(beginPosition)[:10], '%Y-%m-%d')	
			datasetAttributes['fromDate']= date_object		

		datasetAttributes['toDate']=''			
		if (endPosition != -1):
			#dt = datetime.strptime("21/11/06 16:30", "%d/%m/%y %H:%M")			
			date_object = datetime.strptime(str(endPosition)[:10], '%Y-%m-%d')					
			datasetAttributes['toDate']= date_object		
		#print datasetAttributes

		#datasetAttributes["ows"]="http://139.191.148.153:8080/geoserver/ows?"
		#datasetAttributes["wcs"]="http://139.191.148.153:8080/geoserver/ows?"

		#datasetAttributes["ows"]="http://h05-dev-lrmaps.jrc.it/geoserver/ows?"
		#datasetAttributes["wcs"]="http://h05-dev-lrmaps.jrc.it/geoserver/ows?"



		return datasetAttributes
	except:	
		return "";	
def _returnMetadataAdditionalInfo(lngID):
	strReturn=""
	arrayMetadata=_returnReadDatasetAttributes(lngID,["title","abstract","individualName","organisationName","positionName","electronicMailAddress"]);

	if (arrayMetadata["title"]!=""):
		strReturn+="\nTitle: "+arrayMetadata["title"]
	
	if (arrayMetadata["individualName"]!=""):
		strReturn+="\nContact: "+arrayMetadata["individualName"]+'\n'
		
		if (arrayMetadata["organisationName"]!=""):
			strReturn+="Organization: "+arrayMetadata["organisationName"]+'\n'
		if (arrayMetadata["positionName"]!=""):
			strReturn+="Position: "+arrayMetadata["positionName"]+'\n'
		if (arrayMetadata["electronicMailAddress"]!=""):
			strReturn+="Mail: "+arrayMetadata["electronicMailAddress"]+'\n'
	if (arrayMetadata["abstract"]!=""):
		strReturn+="\nAbstract: "+arrayMetadata["abstract"]
	
	return strReturn
'''--------------------------------------------------------------------------
	Function used to retrieve all info from GN about the dataset.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _returnReadDatasetAttributes(lngID,arrayAttributeName):
	
	strTextGN=_returnCSWText(lngID);										
	
	xmldoc = parseString(strTextGN)
	#print strTextGN
	arrayResults={}
	# from ini file
	for strValue in arrayAttributeName:
		slides = xmldoc.getElementsByTagName("gmd:"+strValue)			
		try:
			strText=slides[0].childNodes[1].childNodes[0].nodeValue	
		except:
			strText=""
		arrayResults[strValue]=strText

	return arrayResults;			
def naive_unicode_fixer(text):    
	while True:        
		match = POSSIBLE_UTF8_SEQUENCE.search(text)        
		if match:            
			fixed = match.group(1).encode('latin-1').decode('utf-8')            
			text = text[:match.start()] + fixed + text[match.end():]        
		else:            
			return text		
'''--------------------------------------------------------------------------
	Function used to retrieve the http request in order to load a legend image
	for a specific dataset if the image is not indicate into the configuration file
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''		
def _returnLegendString(arrayFName,arrayVDataset,strLayerDate):
	
	if (arrayFName["legend"]==""):
		strAdd='&'
		
		pos = arrayVDataset["ows"].find("?")			
		if (pos==-1):
			strAdd='?'	
		strTemp=strLayerDate
		if (arrayFName["type"]=="r_d"):			
			strTemp=arrayFName["name"].replace("YYYYMMDD", strLayerDate);
		else:
			if (arrayFName["type"]=="s_m"):			
				strTemp=arrayFName["name"].replace("REPLACEKEY", strLayerDate);		
			else:
				if (arrayFName["type"]=="s_d"):			
					strTemp=arrayFName["name"]
				else:
					if (arrayFName["type"]=="r_m"):						
						if (arrayVDataset["serverType"]=="GEOSERVER"):
							strTemp=arrayFName["store"]+':'+arrayFName["name"]
						else:
							strTemp=arrayFName["name"]


# WCS settings		
		global strGWMSService;
		global strGWMSRequestLegend;

		strReturn=arrayVDataset["ows"]+strAdd+"SERVICE="+strGWMSService+"&LAYER="+strTemp+"&FORMAT=image/png&TRANSPARENT=true&REQUEST="+strGWMSRequestLegend+"&STYLES=&SRS="+arrayVDataset["crs"]+"&VERSION="+arrayVDataset["ows_version"];
		return strReturn
	else:		
		return arrayFName["legend"];
					
'''--------------------------------------------------------------------------
	Function called to do a WCS request for a POINT or a BOX.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def returnCoverageMeanValue(strOperation,strDate,arrayParams,arrayFName,arrayVDataset,lngDatasetValue,blnSD):
	# get coverage
	data=[]	
	
	data=_getCoverage(strDate,arrayParams,arrayFName,arrayVDataset)
	#print data
	
	return data;
'''--------------------------------------------------------------------------
	Function called to do a WPS for a SHAPE.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def returnCropCoverageMeanValue(strOperation,strDate,arrayParams,arrayFName,arrayVDataset, lngDatasetValue,blnSD):
	# looking for coverage	
	data=[]	
	# crop coverage
	data=_getCropCoverageFromGeometry(strDate,arrayParams,arrayFName,arrayVDataset)	
	return data;
'''--------------------------------------------------------------------------
	Function used to replace the date from a format to another one
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _replaceDateFormat(strTempDate,strFormat):
	if (strFormat=="YYYY-MM"):		
		arrayDatesFT = str(strTempDate)[0:10].split('-')											
		strTempDate=str(arrayDatesFT[0])+'-'+arrayDatesFT[1]
		return strTempDate		
	else:
		return strTempDate;
'''--------------------------------------------------------------------------	
	Function used to verify if a specific date is available for a dataset.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _verifyIfDateIsAvailable(strDate,strLayer,strDataType,arrayDates,strFixed,strFormat):
	blnDebug=0
	#print strFormat
	if (strFormat=="YYYY-MM"):
		if (arrayDates):
			if strDate in arrayDates:
				if (blnDebug==1):			
					print "YES"
				return 1				
	else:
		# DEFAULT FOrmat

		if (strDataType=="r_m"):
			timezone_string = strDate.strftime('%z')[0:3] + "." + strDate.strftime('%z')[3:6]    	
			if (timezone_string=="."):
				timezone_string=".000Z";	
		
			strLook= str(strDate.strftime('%Y-%m-%dT%H:%M:%S'))+str(timezone_string)	
		else:
			pos = strFixed.find("_")					
			if (pos==4):
				strTempDate=str(strDate)[0:pos]
			else:	
				strTempDate=str(strDate)[0:10]
				strTempDate=strTempDate.replace("-", "");	

			pos = strLayer.find("REPLACEKEY")
			if (pos!=-1):
				strLook=strLayer.replace("REPLACEKEY", strTempDate);	
			else:
				strLook=strLayer.replace("YYYYMMDD", strTempDate);	

		if (blnDebug==1):
			print strLook
			print arrayDates
		if (arrayDates):
			if strLook in arrayDates:
				if (blnDebug==1):			
					print "YES"
				
				return 1
		
	return 0;
'''--------------------------------------------------------------------------	
	Function used to retrieve all dates from the getCapabilities string.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _returnGetCapabilities_dates(strHttp,strType,strStoreName,strLayername,strVersion,strDateFormat,strInterval):
	arrayDates=[]
	try:
		
		
		#getCapabilities text
		#print strHttp
		#print strVersion
		#strVersion="1.3.0"
		#print "ciao"
		strGGetCap=_returnGetCapabilities_text(strHttp,strVersion);



		#print "ciao2"

		#exit(0);
		# found the position of layername
		pos = strGGetCap.find(strLayername)			
		
		if (strStoreName!=""):
			strLayername=strStoreName+':'+strLayername;

	
		
		if ((strType=="s_d") or (strType=="r_d") or (strType=="s_m")):			
			xmldoc = parseString(strGGetCap)						
			
			layers = xmldoc.getElementsByTagName("Layer")	
			
			pos = strLayername.find("REPLACEKEY")
			if (pos!=-1):
				strTempLayer=strLayername[0:pos];	
				
			else:
				pos = strLayername.find("YYYYMMDD")
				if (pos!=-1):
					strTempLayer=strLayername[0:pos];	
			
			for layer in layers:    
				strName=layer.childNodes[1].childNodes[0].nodeValue
				pos = strName.find(strTempLayer)
				if (pos!=-1):
					arrayDates.append(strName);		
			
			return arrayDates;		
		else:
			# r_m
			if (pos!=-1):
				
				strGGetCap=strGGetCap[pos:]				
				
				pos = strGGetCap.find("</Layer>")				
				strGGetCap=strGGetCap[0:pos]
				strGGetCap="<Layer>\n<Name>"+strGGetCap+"</Layer>"									
				#print strGGetCap
				# if on geoserver the user add the metadata link referred to GN, the getCapabilities of WMS must be replaced as follow:
				# <MetadataURL type="other">
				# <Format>text/plain</Format>
				# <OnlineResource xlink:type="simple" xlink:href="http://139.191.148.153:8080/geonetwork/srv/eng/csw?request=GetRecordById&amp;service=CSW&amp;version=2.0.2&amp;elementSetName=full&amp;outputSchema=csw:IsoRecord&amp;id=f5234534-0d76-4159-87d1-4412414c3416"/>
				# </MetadataURL>
				# ==>
				# <MetadataURL type="other">
				# <Format>text/plain</Format>
				# <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="http://139.191.148.153:8080/geonetwork/srv/eng/csw?request=GetRecordById&amp;service=CSW&amp;version=2.0.2&amp;elementSetName=full&amp;outputSchema=csw:IsoRecord&amp;id=f5234534-0d76-4159-87d1-4412414c3416"/>
				# </MetadataURL>	
				# ==> added: xmlns:xlink="http://www.w3.org/1999/xlink" otherwise the system cannot parse the string
				pos=strGGetCap.find('OnlineResource xlink:type="simple"')				
				if (pos!=-1):
					strGGetCap=strGGetCap.replace('OnlineResource xlink:type="simple"', 'OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple"');					
				
				xmldoc = parseString(strGGetCap)	
				try:
					strTag="Dimension"
					slides1 = xmldoc.getElementsByTagName(strTag)		
					strDates=str(slides1[0].childNodes[0].nodeValue)

					pos = strDates.find("T00:00:00.000Z")		
					if (pos==-1):
						
						# extent: from to
						# explode dates
						arrayDatesFT = strDates.split('/')											
						strFromDate=arrayDatesFT[0]
						strToDate=arrayDatesFT[1]
						arrayDates=_returnArrayFromToDate(strFromDate,strToDate,strDateFormat,strInterval);
						#print arrayDates
						return arrayDates;

				except:
					strTag="Extent"
					slides1 = xmldoc.getElementsByTagName(strTag)		
					strDates=slides1[0].childNodes[0].nodeValue		
					pos = strDates.find("T00:00:00.000Z")		
					if (pos==-1):
						
						# extent: from to
						# explode dates
						arrayDatesFT = strDates.split('/')											
						strFromDate=arrayDatesFT[0]
						strToDate=arrayDatesFT[1]
						arrayDates=_returnArrayFromToDate(strFromDate,strToDate,strDateFormat,strInterval);
						#print arrayDates
						
						return arrayDates;

				arrayDates = strDates.split(',')											
		
	except:
		arrayDates=[]
	#print arrayDates		
	return arrayDates;
'''--------------------------------------------------------------------------	
	--------------------------------------------------------------------------'''	
def _returnArrayFromToDate(strFrom,strTo,strDateFormat,strInterval):
	arrayDates=[]
	# Format: YYYY-MM
	if (strDateFormat=="YYYY-MM"):
		# Interval: 1month
		if (strInterval=="1m"):
			arrayTemp=strFrom.split('-')		
			lngFY=int(arrayTemp[0])
			lngFM=int(arrayTemp[1])		
			arrayTemp=strTo.split('-')		
			lngTY=int(arrayTemp[0])
			lngTM=int(arrayTemp[1])
			
			for lngY in range(lngFY,lngTY+1,1):			
				for lngM in range(1,13,1):
					blnAdd=1
					if (lngY == lngFY):
						if (lngM < lngFM):
							blnAdd=0
					else:
						if (lngY == lngTY):
							if (lngM > lngTM):
								blnAdd=0	
					if (blnAdd==1):
						strTempMonth=str('0'+str(lngM))
						arrayDates.append(str(lngY)+'-'+str(strTempMonth)[len(strTempMonth)-2:])
		
	return arrayDates;
'''--------------------------------------------------------------------------	
	Function used to retrieve the getCapabilities request.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnGetCapabilities_text(strHttp,strVersion):
	
	# save parameters
	
	#print strHttp
	#print strVersion
	request = {'service': 'WMS', 'request': 'GetCapabilities','version':strVersion} 	#print "aaa"
	# execute the request

	output=_executeURL(strHttp, request, 'Post');


	# return the output

	strGGetCap=output

	return strGGetCap
	
'''--------------------------------------------------------------------------
	Verify if a date if between from and to date range of a specific dataset.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _verifyDatasetDate2(lngYear,lngDay,dateFrom,dateTo,strTempInterval):
	blnReturn=0	
	lngOrYear=lngYear
	lngDay=int(lngDay);

	strTempDateFrom=date.fromordinal(date(int(lngYear), 1, 1).toordinal() + int(lngDay) )
	
	lngAddYears=0
	lngAdd=0;	
	if (strTempInterval=="16d"):
		lngAdd=16;
	else:
		if (strTempInterval=="15d"):
			lngAdd=15;
		else:
			if (strTempInterval=="1d"):
				lngAdd=1;
			else:
				# 10 days
				if (strTempInterval=="10d"):
					
					lngMonth=int(strTempDateFrom.month)									
					lngAdd = lngDay+9					
					lngDay=0;	
				else:
					#1 month
					if (strTempInterval=="1m"):
						lngMonth=int(strTempDateFrom.month)		
						lngAdd = date(lngYear, lngMonth+1, 1).timetuple().tm_yday-1
						lngDay=0;		

					
	if ((lngDay==0)and(lngAdd==0)):
		return 0
	else:
		strTempDateTo=date.fromordinal(date(lngYear, 1, 1).toordinal() + lngDay +lngAdd - 1)	


	dateFrom=dateFrom.isoformat() 
	dateTo=dateTo.isoformat() 
	
	strTempDateFrom=str(strTempDateFrom)+" 00:00"		
	strTempDateFrom= datetime.strptime(strTempDateFrom, "%Y-%m-%d %H:%M")	
	strTempDateFrom=strTempDateFrom.isoformat() 
	
	strTempDateTo=str(strTempDateTo)+" 00:00"		
	strTempDateTo= datetime.strptime(strTempDateTo, "%Y-%m-%d %H:%M")		
	strTempDateTo=strTempDateTo.isoformat() 

	if (strTempDateFrom >= dateFrom and strTempDateTo<=dateTo):		
		blnReturn=1	

	return blnReturn;	
'''--------------------------------------------------------------------------
	Function used to verify if a date is between date min and max.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _verifyDatasetDate(strTempDate,dateFrom,dateTo):
	blnReturn=0	
		
	dateFrom=dateFrom.isoformat() 
	dateTo=dateTo.isoformat() 
	
	
	if (strTempDate >= dateFrom and strTempDate<=dateTo):
		blnReturn=1
	
	# return boolean
	return blnReturn;

'''--------------------------------------------------------------------------
	Function used to delete a file saved into the temporary directory.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _deleteFile(strFile):
	global strGPhysPathTemporaryDir;
	if (strGPhysPathTemporaryDir==""):
		strGPhysPathTemporaryDir=_returnTempDirectory(0);
	
	# delete tiff file
	os.system('rm -rf '+strFile+'>>'+strGPhysPathTemporaryDir+'log.txt');
'''--------------------------------------------------------------------------
	Function used to convert a polygon from a projection to another one.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def convertPolygon(strPoint,inputEPSG,outputEPSG):
	
	arrayPoint = strPoint.split(' ')
	latS=[]
	lonS=[]
	arrayConverts=[]
	for r in arrayPoint:    		
		arrayTemp = r.split(',')
		if (arrayTemp[0]!=""):
			pointX = float(arrayTemp[0])
			pointY = float(arrayTemp[1])
			
			# Spatial Reference System

			arrayValues=[]
			if (inputEPSG!=outputEPSG):
				# create a geometry from coordinates
				point = ogr.Geometry(ogr.wkbPoint)
				
				point.AddPoint(pointX, pointY)
				
				# create coordinate transformation
				inSpatialRef = osr.SpatialReference()
				inSpatialRef.ImportFromEPSG(inputEPSG)
				
				outSpatialRef = osr.SpatialReference()
				outSpatialRef.ImportFromEPSG(outputEPSG)
				
				coordTransform = osr.CoordinateTransformation(inSpatialRef, outSpatialRef)

				# transform point
				point.Transform(coordTransform)	
				arrayValues.append(point.GetX());			
				arrayValues.append(point.GetY());			
			else:
				arrayValues.append(pointX);
				arrayValues.append(pointY);
			arrayConverts.append(arrayValues);

	return arrayConverts
'''--------------------------------------------------------------------------	
	Function used to verify if a WCS is greater than a maximum width and height.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
	
def _checkWidthHeightValues(lngW, lngH):

	strSection='WCS'
	strKey='WCS_CHECKMAXSIZE'	
	blnGCheckMaximunSize=_returnIniValue(strSection, strKey)	
	
	
	arrayValues={}	
	if (blnGCheckMaximunSize==0):
		arrayValues["W"]=lngW
		arrayValues["H"]=lngH
	else:	
		strKey='MAXSIZE_W'
		lngMaximunSizeW = _returnIniValue(strSection, strKey)	
		strKey='MAXSIZE_H'
		lngMaximunSizeH = _returnIniValue(strSection, strKey)		
		
		if (lngW>lngMaximunSizeW or lngH>lngMaximunSizeH):
			if (lngW>lngMaximunSizeW and lngH>lngMaximunSizeH):
				if (lngW>lngH):
					lngWTemp=lngMaximunSizeW
					lngHTemp=(lngWTemp*lngH)/lngW
				else:
					lngHTemp=lngMaximunSizeH
					lngWTemp=(lngHTemp*lngW)/lngH
			else:	
				if (lngW>lngMaximunSizeW):
					lngWTemp=lngMaximunSizeW
					lngHTemp=(lngWTemp*lngH)/lngW
				else:
					lngHTemp=lngMaximunSizeH
					lngWTemp=(lngHTemp*lngW)/lngH
			arrayValues["W"]=lngWTemp
			arrayValues["H"]=lngHTemp

		else:
			arrayValues["W"]=lngW
			arrayValues["H"]=lngH	
	
	return arrayValues;
	
'''--------------------------------------------------------------------------
	Function used to execute a crop coverage from a predefined geometry.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _getCropCoverageFromGeometry(strDate,arrayParams,arrayFName,arrayVDataset):
	global strGWCSService;
	global strGWCSVersion;
	global strGWCSRequest;
	
	# set the request
	request = {'version': strGWCSVersion, 'request': strGWCSRequest, 'service':strGWCSService}	
	strMap=''
	strTempCoverage=''
	strTempDate=str(strDate)[:10]	
	
	if (arrayVDataset["serverType"] == "MAPSERVER"):		
		arrayTemp = arrayVDataset["wcs"].split('?')
		strHTTP=arrayTemp[0]+'?'
		strMap=arrayTemp[1][4:]
		request['map']=strMap
		request['format']="geotiff"				
		strTempD=str(strTempDate)[:4]+str(strTempDate)[5:len(strTempDate)-3]+str(strTempDate)[8:len(strTempDate)];
		strTempCoverage=arrayParams["strCoverage"].replace("YYYYMMDD", strTempD);
		if (arrayFName["type"]=="r_m"):
			strTempD=str(strDate)[:4]+'-'+str(strDate)[4:-2]+'-'+str(strDate)[6:];
			
			request['time']=_returnTimeFormat(strTempDate,arrayFName["dateFormat"])
	else:
		strHTTP=arrayVDataset["wcs"]
		request['format']="geotiff"			
			
		
		if (arrayFName["type"]=="r_m"):
			strTempD=str(strDate)[:4]+'-'+str(strDate)[4:-2]+'-'+str(strDate)[6:];
			
			request['time']=_returnTimeFormat(strTempDate,arrayFName["dateFormat"])
			strTempCoverage=arrayParams["strCoverage"]
		else:
			strTempD=str(strTempDate)[:4]+str(strTempDate)[5:len(strTempDate)-3]+str(strTempDate)[8:len(strTempDate)];
			strTempCoverage=arrayParams["strCoverage"].replace("YYYYMMDD", strTempD);
		
	
	request['coverage']=strTempCoverage	
	# box reprojected values
	strGBBox=_returnProjectedValues(arrayParams["strAreaFromLon"],arrayParams["strAreaFromLat"],arrayParams["strAreaToLon"],arrayParams["strAreaToLat"],arrayParams["convertedCrs"],arrayVDataset["crs"]);	
	request['BBox']=strGBBox;
	request['crs']=arrayVDataset["crs"]		
	
	global strGEPSGF4326Proj;
	if (arrayVDataset["crs"]==strGEPSGF4326Proj):
		arrayTemp = strGBBox.split(',')
		widthValue= int(((float(arrayTemp[2])-float(arrayTemp[0]))/float(arrayVDataset["xsize"])))	
		heightValue= int(((float(arrayTemp[3])-float(arrayTemp[1]))/float(arrayVDataset["ysize"])))			
	else:		
		widthValue= int(((float(arrayParams["strAreaToLon"])-float(arrayParams["strAreaFromLon"]))/float(arrayVDataset["xsize"])))	
		heightValue= int(((float(arrayParams["strAreaToLat"])-float(arrayParams["strAreaFromLat"]))/float(arrayVDataset["ysize"])))	
		
	# width and height maximum values
	arrayTemp=_checkWidthHeightValues(widthValue,heightValue)		
	request['width']=arrayTemp["W"]
	request['height']=arrayTemp["H"]
	#print request
	# send the request
	data = urlencode(request)		
	strCoverageHttp=(strHTTP+"?"+data)	

	strCoverageHttp=strCoverageHttp.replace("&", "&amp;");	

	
	strOWS=_returnVariableDef("OWS");
	strOWSWPS=_returnVariableDef("WPS")
	
	global strGWPSService;
	global strGWPSVersion;
	global strGWPSRequest;

	# CRS if different from 4326
	if (arrayVDataset["crs"]!=strGEPSGF4326Proj):	
		# output of the request
		output=_executeURL(strHTTP, request, 'Post');				
		
		strFilename=_returnFilename()	

		strInputProj=arrayVDataset["crs"].replace("EPSG:","");
		strOutputProj="4326";
		
		strFilenameInput=strFilename.replace(".tiff", "_"+strInputProj+".tiff");
		strFilenameOutput=strFilename.replace(".tiff", "_"+strOutputProj+".tiff");

		request = {}
		f = open(strFilenameInput,'wb')
		#print output.read()
		f.write(output)
		f.close()
		# reproject the dataset
		global strGPhysPathTemporaryDir,strGHttpPathTemporaryDir;
		if (strGPhysPathTemporaryDir==""):
			strGPhysPathTemporaryDir=_returnTempDirectory(0);

		if (strGHttpPathTemporaryDir==""):
			strGHttpPathTemporaryDir=_returnTempDirectory(1);
		# reproject from one projection to 4326 in order to crop it
		
		#print strFilenameInput
		#print strFilenameOutput
		os.system('gdalwarp '+strFilenameInput+' '+strFilenameOutput+' -t_srs "+proj=longlat +ellps=WGS84">>'+strGPhysPathTemporaryDir+'/log.txt');		
		#print 'gdalwarp '+strFilenameInput+' '+strFilenameOutput+' -t_srs "+proj=longlat +ellps=WGS84">>'+strGPhysPathTemporaryDir+'/log.txt'
		
		
		
			
		strOnlyFilenameOutput=strFilenameOutput.replace(strGPhysPathTemporaryDir, "");
			
		strInputFile=strGHttpPathTemporaryDir+strOnlyFilenameOutput;
		strCoverageHttp=strGHttpPathTemporaryDir+strOnlyFilenameOutput;
		
		request = {}
		# WPS		
		
		

		request['body']='<?xml version="1.0" encoding="UTF-8"?> <wps:Execute version="'+strGWPSVersion+'" service="'+strGWPSService+'" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/'+strGWPSVersion+'" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/'+strGWPSVersion+'" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/'+strGWPSVersion+' http://schemas.opengis.net/wps/'+strGWPSVersion+'/wpsAll.xsd"> <ows:Identifier>'+strGWPSRequest+'</ows:Identifier> <wps:DataInputs> <wps:Input> <ows:Identifier>coverage</ows:Identifier> <wps:Reference mimeType="image/tiff" xlink:href="'+strInputFile+'" method="GET"/> </wps:Input> <wps:Input> <ows:Identifier>cropShape</ows:Identifier> <wps:Data> <wps:ComplexData mimeType="text/xml; subtype=gml/3.1.1"><![CDATA[POLYGON (('+arrayParams["strGGeometry"]+'))]]></wps:ComplexData> </wps:Data> </wps:Input> </wps:DataInputs> <wps:ResponseForm> <wps:RawDataOutput mimeType="image/tiff"> <ows:Identifier>result</ows:Identifier> </wps:RawDataOutput> </wps:ResponseForm> </wps:Execute>';			
		request['form_hf_0']=''
		request['username']=''
		request['password']=''		
		request['url']=strOWS;			
		
		
		# execute the req	uest
		output=_executeURL(strOWSWPS, request, 'Post');			
		
		request = {}
		# save the file
		f = open(strFilename,'wb')		
		f.write(output)
		f.close()			
		
		try:
			# extracts all values
			ds = gdal.Open(strFilename, GA_ReadOnly)		
			cols = ds.RasterXSize
			rows = ds.RasterYSize			
			band = ds.GetRasterBand(1)
			data = band.ReadAsArray(0, 0, cols, rows)				
			
		except:			
			data=''						
						
		_deleteFile(strFilenameInput);
		_deleteFile(strFilenameOutput);		
		_deleteFile(strFilename)
		
		return data
	else:
		request = {}				
		request['body']='<?xml version="1.0" encoding="UTF-8"?> <wps:Execute version="'+strGWPSVersion+'" service="'+strGWPSService+'" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/'+strGWPSVersion+'" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/'+strGWPSVersion+'" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/'+strGWPSVersion+' http://schemas.opengis.net/wps/'+strGWPSVersion+'/wpsAll.xsd"> <ows:Identifier>'+strGWPSRequest+'</ows:Identifier> <wps:DataInputs> <wps:Input> <ows:Identifier>coverage</ows:Identifier> <wps:Reference mimeType="image/tiff" xlink:href="'+strCoverageHttp+'" method="GET"/> </wps:Input> <wps:Input> <ows:Identifier>cropShape</ows:Identifier> <wps:Data> <wps:ComplexData mimeType="text/xml; subtype=gml/3.1.1"><![CDATA[POLYGON(('+arrayParams["strGGeometry"]+'))]]></wps:ComplexData> </wps:Data> </wps:Input> </wps:DataInputs> <wps:ResponseForm> <wps:RawDataOutput mimeType="image/tiff"> <ows:Identifier>result</ows:Identifier> </wps:RawDataOutput> </wps:ResponseForm> </wps:Execute>';

	#strOWSWPS="http://h05-dev-lrmaps.jrc.it:8080/geoserver/TestWfsPost";
	#strOWS="http://h05-dev-lrmaps.jrc.it:8080/geoserver/CA_LAND/ows"


	request['form_hf_0']=''
	request['username']=''
	request['password']=''
	request['url']=strOWS;		

	result=_saveFile(request,strOWSWPS)
	return result

'''--------------------------------------------------------------------------
	Function used to return the correct time format.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''		
def _returnTimeFormat(strTempDate,strFormat):
	strTemp=''
	if (strFormat=='YYYY-MM'):
		arrayTemp = strTempDate.split('-')
		strTemp=arrayTemp[0]+'-'+arrayTemp[1]
	else:
		strTemp=strTempDate+'T00:00:00.000Z'
	return strTemp
'''--------------------------------------------------------------------------
	Function used to execute a coverage.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''		
def _getCoverage(strDate,arrayParams,arrayFName,arrayVDataset):
	
	global strGWCSService
	global strGWCSVersion
	global strGWCSRequest


	# save all input parameters
	request = {'version': strGWCSVersion, 'request': strGWCSRequest, 'service': strGWCSService}
	
	strMap=''
	strTempCoverage=''
	strTempDate=str(strDate)[:10]	
	if (arrayVDataset["serverType"] == "MAPSERVER"):		
		arrayTemp = arrayVDataset["wcs"].split('?')
		strHTTP=arrayTemp[0]+'?'
		strMap=arrayTemp[1][4:]
		request['map']=strMap
		request['format']="geotiff"		
		
		strTempD=str(strTempDate)[:4]+str(strTempDate)[5:len(strTempDate)-3]+str(strTempDate)[8:len(strTempDate)];
		strTempCoverage=arrayParams["strCoverage"].replace("YYYYMMDD", strTempD);
		if (arrayFName["type"]=="r_m"):
			request['time']=_returnTimeFormat(strTempDate,arrayFName["dateFormat"])
			
	else:
		strHTTP=arrayVDataset["wcs"]

		request['format']="geotiff"						
		
		if (arrayFName["type"]=="r_m"):				
			request['time']=_returnTimeFormat(strTempDate,arrayFName["dateFormat"])	
			strTempCoverage=arrayParams["strCoverage"]
		else:
			strTempD=str(strTempDate)[:4]+str(strTempDate)[5:len(strTempDate)-3]+str(strTempDate)[8:len(strTempDate)];
			strTempCoverage=arrayParams["strCoverage"].replace("YYYYMMDD", strTempD);
	
	assert len(arrayParams["strCoverage"]) > 0	
	# coverage
	request['coverage']=strTempCoverage

	# reproject the box
	#print arrayParams["crs"]
	#print arrayVDataset["crs"]
	strGBBox=_returnProjectedValues(arrayParams["txtLLon"],arrayParams["txtLLat"],arrayParams["txtRLon"],arrayParams["txtULat"],arrayParams["crs"],arrayVDataset["crs"]);





	request['BBox']=strGBBox;

	# set the crs
	request['crs']=arrayVDataset["crs"]

	
	# checks max width and height values
	arrayTemp=_checkWidthHeightValues(arrayParams["widthValue"],arrayParams["heightValue"])		
	request['width']=arrayTemp["W"]
	request['height']=arrayTemp["H"]
	
	# save the output

	result=_saveFile(request,strHTTP)

	
	return result
'''--------------------------------------------------------------------------
	Translate projection values.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _transformProjectedValues(strFromProj,strToProj,txtLLon,txtLLat,txtRLon,txtULat,strType):
	# set the source projection
	source = osr.SpatialReference()

	lngFrom=int(strFromProj.replace("EPSG:", ""))

	if (lngFrom==900913):
		lngFrom=3857	
	source.ImportFromEPSG(lngFrom)
	# set the target projection
	target = osr.SpatialReference()					
	lngTo=int(strToProj.replace("EPSG:", ""))

	if (lngTo==900913):
		lngTo=3857
	target.ImportFromEPSG(lngTo)
	transform1 = osr.CoordinateTransformation(source,target)

	
	if (strType == 'LL'):
		strTemp="POINT ("+str(txtLLon)+" "+str(txtLLat)+")"
	else:
		strTemp="POINT ("+str(txtRLon)+" "+str(txtULat)+")"


	point1 = ogr.CreateGeometryFromWkt(strTemp)
	try:
		point1.Transform(transform1)
	except:
		LLpoint=strTemp
	# transform point
	LLpoint=str(point1.ExportToWkt())[7:-1]

	LLpoint=LLpoint.replace(" ", ",");	
	point1.Destroy()
	return LLpoint
'''--------------------------------------------------------------------------
	Translate points from a projection to another one.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def _returnProjectedValues(txtLLon,txtLLat,txtRLon,txtULat,strFromProj,strToProj):
	# Lower left point
	#print strFromProj
	#print strToProj
	LLpoint=_transformProjectedValues(strFromProj,strToProj,txtLLon,txtLLat,txtRLon,txtULat,'LL');

	# Upper right point
	URpoint=_transformProjectedValues(strFromProj,strToProj,txtLLon,txtLLat,txtRLon,txtULat,'UR');
	# return it
	return str(LLpoint)+','+str(URpoint)		
'''--------------------------------------------------------------------------
	Function used to return the meaning value.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''		
def _returnMeanValue(strOperation,data,arrayVDataset,strFormula,lngDatasetValue,blnCalculateSD,strColorScale):
	
	clean_data=[]
	lngMaxValue=''
	arrayValues=[]
	
	strTemp=strFormula
	arrayTemp = strTemp.split('_')
	strType=arrayTemp[0]
	
	if (strOperation=="BOX" or strOperation=="SHAPE"):	
		# BOX or SHAPE
		# for each row
		for r in data:
			# for each column
			for c in r:			

				# verify if the value is lower than the maximum value and greater than the minimum value
				if ((float(c) >=float(arrayVDataset["minValue"])) and  (float(c)<=float(arrayVDataset["maxValue"]))):													
					# append it
					clean_data.append(c)							
	else:				
		# POINT		
		#print arrayVDataset["minValue"]
		#print arrayVDataset["maxValue"]
		
		if (len(data)==3 and (len(data[0])==3)):
			if ((data[1,1] >=float(arrayVDataset["minValue"])) and  (data[1,1]<=float(arrayVDataset["maxValue"]))):							
				clean_data.append(data[1,1])
		
		else:			
			return ''
	
	# =======================
	# STEPCHART_PERC
	# =======================
	if (strFormula=='STEPCHART_PERC'):
		strTemp=''		
		if (len(clean_data)>0):
			blnMax=0			
			clean_data_values= list(set(clean_data))			
			
			# return an array witout duplicated and empry values
			clean_data.sort();	
			# sort the array
			lngMax=0
			lngValue=''
			if (blnMax==0):
				# num of elements
				lngNumElements=len(clean_data);		
				
				# group all values and return an array with keys and values
				a = np.array(clean_data)		
				
				c=Counter(a)
				
				# keys
				colors=c.keys();
				
				# number of keys
				values=c.values();
				
				result=np.bincount(a)
				strTemp=''
				strColors=''

				arrayFinal=[]
				# return the number of elements
				
				lngNumMax=int(_returnColorsScale_SC(strColorScale,"NUMFIELDS"));				
				listaVars = range(1,lngNumMax+1,1)	
				
				
				# count the number of elements
				for cont in listaVars: 					
					arrayFinal.append(0);
					
				if (colors[0]==0):
					lngNumElements=lngNumElements-values[0]
				for pos in listaVars: 											
					cont=0;
					lngOutput=-1
					for value in colors: 					
						if (value==pos):
						
							lngOutput=cont
						cont=cont+1
					
					if (lngOutput!=-1):					
						arrayFinal[pos-1]=values[lngOutput]
				cont=0
				
				# calculate the %
				for value in arrayFinal:
					
					lngPerc=0															
					if (value>0):			
						lngPerc=float((float(value)*100.0)/float(lngNumElements))
					#save it into a string
					strTemp+=str(lngPerc)+','																	
					cont=cont+1
				strTemp=strTemp[:-1]				
		return strTemp
	
	if len(clean_data)>0:
		# BOX and SHAPE
		if (strOperation=="BOX" or strOperation=="SHAPE"):					
			# if the meaning value is valorized
			if (str(lngDatasetValue)==""):	
				# return the meaning value
				return np.mean(clean_data)
			else:
				# calculate Spatial Deviation
				if (int(blnCalculateSD)==1):
					
					lngSum=0;
					numValues=len(clean_data)								
					for r in clean_data:						
						lngSum+=abs(r-float(lngDatasetValue))											
					lngReturn=lngSum/numValues
					# return value
					return lngReturn;
					
				else:
					# return mean value
					return np.mean(clean_data)									
		else:
			# POINT
			if (int(blnCalculateSD)==1):
				return "";
			else:
				return np.mean(clean_data)
	else:
		return ''	
'''--------------------------------------------------------------------------
	Function that returns the minimum and maximun values for a dataset.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''		
def _returnMinMaxValue(arrayFName,arrayVDataset):
	lngMinNewValue=""
	lngMaxNewValue=""
	
	strTemp=arrayFName["formula"]	
	arrayTemp = strTemp.split('_')	
	strType=arrayTemp[1]

	# SLOPE
	if (strType=='SLOPE'):					
		lngMinNewValue=float(arrayVDataset["minValue"])*float(arrayVDataset["scaleFactor"])+float(arrayVDataset["offset"])
		lngMaxNewValue=float(arrayVDataset["maxValue"])*float(arrayVDataset["scaleFactor"])+float(arrayVDataset["offset"])	
	else:
		# INTERCEPT
		if (strType=='INTERCEPT'):		
			lngMinNewValue=float(arrayVDataset["minValue"])-float(arrayVDataset["offset"])*float(arrayVDataset["scaleFactor"])
			lngMaxNewValue=float(arrayVDataset["maxValue"])-float(arrayVDataset["offset"])*float(arrayVDataset["scaleFactor"])	
		else:
			# NO FORMULA
			lngMinNewValue=float(arrayVDataset["minValue"])
			lngMaxNewValue=float(arrayVDataset["maxValue"])

	return str(lngMinNewValue)+'<%%>'+str(lngMaxNewValue);
'''--------------------------------------------------------------------------
	Translate the meaning with a formula.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def	_returnTransformMean(meanValue,arrayFName,arrayVDataset, blnDeviation):
	
	strTemp=arrayFName["formula"]	
	arrayTemp = strTemp.split('_')	
	strType=arrayTemp[1]
	
	if (meanValue!=''):
		if (strType=='SLOPE'):						
			return float(meanValue)*float(arrayVDataset["scaleFactor"])+float(arrayVDataset["offset"])
		else:
			if (strType=='INTERCEPT'):						
				if (blnDeviation==0):
					return ((float(meanValue)-float(arrayVDataset["offset"]))*float(arrayVDataset["scaleFactor"]))
				else:
					return float(meanValue)
			else:
				if (strType=='PERC'):
					return str(meanValue)
				else:
					if (strType=='LOG'):						
						if (float(meanValue)!=0.0):							
							meanValue=float(meanValue)							
							meanValue=10**meanValue
							return float(meanValue)
						else:
							return ''
					else:
						return float(meanValue)
	return ''		
'''--------------------------------------------------------------------------
	Verify if a date is including in min and max values
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def checkDate(fromYear,toYear,lngYearCheck,fromMonth,toMonth,lngMonthCheck):
	blnContinue=False;

	if (fromYear==lngYearCheck and toYear==lngYearCheck):
		if (int (lngMonthCheck) >= int (fromMonth)) and (int (lngMonthCheck) <= int (toMonth)):
			blnContinue=True	
	else:
		if (fromYear==lngYearCheck):
			if (int (lngMonthCheck) >= int (fromMonth)):
				blnContinue=True
		else:
			if (toYear==lngYearCheck):
				if (int (lngMonthCheck) <= int (toMonth)):
					blnContinue=True
			else:
				blnContinue=True
	return blnContinue		
'''--------------------------------------------------------------------------
	Function that returns meteo and national link.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnNationalLinks(lat,lon):	
		
	
	global strGIniNationalLinks;
	global strGIniNLink_layer;
	global strGIniNLink_cahttp;
	global strGIniNLink_natField;
	global strGIniNLink_meteoField;
	# read input parameters from ini file
	
	strLayerName=_returnIniValue(strGIniNationalLinks,strGIniNLink_layer)
	strHttp=_returnIniValue(strGIniNationalLinks,strGIniNLink_cahttp)
	strNationalLinkField=_returnIniValue(strGIniNationalLinks,strGIniNLink_natField)
	strMeteoLinkField=_returnIniValue(strGIniNationalLinks,strGIniNLink_meteoField)
	
	
	global strGWFSService;
	global strGWFSVersion;
	global strGWFSRequest;	
	global strGEPSGF4326Proj;

	request = {'service': strGWFSService, 'version': strGWFSVersion, 'request': strGWFSRequest,'srsname':str(strGEPSGF4326Proj)}	
	

	request['BBox']=str(lon)+','+str(lat)+','+str(lon)+','+str(lat);		
	request['layer']=strLayerName
	request['typeName']=request['layer']
	

	strOWSWFS=_returnVariableDef("WFS");

	#strOWSWFS="http://lrm-maps.jrc.ec.europa.eu:8080/geoserver/wfs"
	output=_executeURL(strOWSWFS, request, 'Post');
	# read the output
	a=output

	strNational='';
	strMeteo='';
	try:
		# parse the xml string
		xmldoc = parseString(a)	
		# retrieve the national link
		slides1 = xmldoc.getElementsByTagName(strNationalLinkField)		
		strMeteo=slides1[0].childNodes[0].nodeValue		
		# retrieve the nation id
		slides2 = xmldoc.getElementsByTagName(strMeteoLinkField)		
		strNational=strHttp+slides2[0].childNodes[0].nodeValue
	except:
		pass
	response={}
	response["meteo"]=strMeteo
	response["national"]=strNational
	return response;
'''--------------------------------------------------------------------------	
	Function used to analyze if a year is leap or not.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''

def _returnIfLeapYear(lngDay,lngYear):
	
	lngDay=int(lngDay);
	
	lngYear=int(lngYear);
	strTempDate=date.fromordinal(date(lngYear, 1, 1).toordinal() + lngDay - 1)
	strTempDate = datetime.strptime(str(strTempDate),"%Y-%m-%d")
	lngMonth=int(strTempDate.month)
	blnLeap=is_leap_year(lngYear)

	if (blnLeap==1):		
		if (lngMonth>=2):
			if (lngDay>52):
				lngDay=int(lngDay)+1;
				strTempDate=date.fromordinal(date(lngYear, 1, 1).toordinal() + lngDay - 1)
				strTempDate = datetime.strptime(str(strTempDate),"%Y-%m-%d")				
	# verify date	
	return strTempDate;	
'''--------------------------------------------------------------------------	
	Return http address.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnHttpAddress():
	
	strHttp="http://"+os.environ["HTTP_HOST"]+'/';
	
	return strHttp;
'''--------------------------------------------------------------------------	
	Return the temporary directory.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnTempDirectory(blnHttp):		
	global strGIniSystem;
	global strGIniSystem_pathTempDir;
	global strGIniSystem_httpTempDir;
	# ini file	
	if (blnHttp==0):		
		# FS
		strPath=_returnIniValue(strGIniSystem, strGIniSystem_pathTempDir)	
	else:
		# HTTP
		
		strPath =_returnHttpAddress()+_returnIniValue(strGIniSystem, strGIniSystem_httpTempDir)	
	
	return strPath
'''--------------------------------------------------------------------------	
	Return the HTML directory path.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnHTMLDir():
	global strGIniSystem;
	global strGIniSystem_pathHtmlDir;
	# ini file
	strPath=_returnIniValue(strGIniSystem, strGIniSystem_pathHtmlDir)	
	
	return strPath

import struct
'''--------------------------------------------------------------------------	
	Function used the retrieve info from an image.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def get_image_info(data):
    #if is_png(data):
    w, h = struct.unpack('>LL', data[16:24])
    width = int(w)
    height = int(h)
    #else:
    #    raise Exception('not a png image')
    return width, height
'''--------------------------------------------------------------------------	
	Return if an image is a png file.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def is_png(data):
    return (data[:8] == '\211PNG\r\n\032\n'and (data[12:16] == 'IHDR'))
'''--------------------------------------------------------------------------	
	Retrieve the ini value reading the result from section and value.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnIniValue(strSection,strKey):
	
	strValue='';
	# ini file
	config = ConfigParser.ConfigParser()	
	global strGIniFile;

	if (strGIniFile==""):
		strIniFile=_returnIniFile();
		strGIniFile=strIniFile;
	
	config.read(strGIniFile)		
	strValue = config.get(strSection, strKey)
	
	return strValue;
'''--------------------------------------------------------------------------	
	Read the colors scale STEPCHART from ini file.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnColorsScale_SC(strKey,strReturn):
	global strGIniSectionGraph;
	if (strReturn=="LABEL"):		
		strKey=strKey.replace("_COLORS", "_LABELS");
		arrayValues=_returnColorsScale(strKey)
	else:
		if (strReturn=="COLOR"):	
			arrayValues=_returnColorsScale(strKey)
		else:
			if (strReturn=="NUMFIELDS"):	
				#print strKey
				arrayValues=_returnColorsScale(strKey)
				return int(len(arrayValues))
				#strKey=strKey.replace("_COLORS", "_NUMFIELDS");
				#strTemp=_returnIniValue(strGIniSectionGraph,strKey)	
				#return strTemp
	return arrayValues
'''--------------------------------------------------------------------------	
	Read the colors scale from ini file.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnColorsScale(strKey):
	global strGIniSectionGraph;
	arrayColors=[]
	
	strTemp=_returnIniValue(strGIniSectionGraph,strKey)	
	arrayColors = strTemp.split(',')				
	return arrayColors;
'''--------------------------------------------------------------------------	
	Read the trace filename from ini file.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnTraceFile():
	strSection='TRACE'
	strKey='TRACE_FILE'
	strTemp=_returnIniValue(strSection,strKey)			
	return strTemp;
'''--------------------------------------------------------------------------	
	Write an error into the trace file.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _writeTrace(strError):

	strFile=_returnTraceFile();
	#print strFile
	f = open(strFile,'a')
	f.write("\n"+strError)
	f.close()
	
	return "";
'''--------------------------------------------------------------------------	
	Function used to save a file used to delete the PID from the processes list.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _savePid(strFilename):

	strText="kill "+str(os.getpid())

	f = open(strFilename,'wb')
	f.write(strText)
	f.close()
	
	return "";
'''--------------------------------------------------------------------------	
	Function used to execute the previous delete file.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _killPid(strFilename):
	os.system('bash '+strFilename);	
	
	return "";
'''--------------------------------------------------------------------------	
	Return the translate http address.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnHttpFilename(strFilename):
	global strGIniSystem;
	global strGIniSystem_pathHtmlDir;
	
	strFrom=_returnIniValue(strGIniSystem,strGIniSystem_pathHtmlDir)
	strTo=_returnHttpAddress()+'CA/temp/';
	strHttp=strFilename.replace(strFrom, strTo);

	return strHttp;

'''--------------------------------------------------------------------------	
	Return the csv filename.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnFilename_csv():
	global strGIniSystem;
	global strGIniSystem_pathTempDir;
	
	strPath=_returnIniValue(strGIniSystem,strGIniSystem_pathTempDir)			

	strName=_returnUniqueFilename()+'.csv'
	return os.path.join(strPath,strName)
'''--------------------------------------------------------------------------	
	Init the CSV file.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _formatCsvFile(strText,strFilename):


	if (os.path.isfile(strFilename)):
		f = open(strFilename,'ab')

	else:
		f = open(strFilename,'wb')


	f.write(strText)
	f.close()
	os.system("chmod 777 "+strFilename);


	return "";
	
'''--------------------------------------------------------------------------	
	Function used to retrieve all common years for a group of layers.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnCommonYears(arrayFNameS,lngFromYear,lngToYear):
	arrayDays=[]
	arrayIncr=[]
	blnSpecialDates=0
	
	
	for arrayFName in arrayFNameS:		
		strTempDates=''		
		if (arrayFName["shape_dates"]!=""):
			strTempDates=arrayFName["shape_dates"]
		
		strTemporalType=arrayFName["interval"]						

		if ((strTemporalType=="10d") or (strTemporalType=="16d") or (strTemporalType=="15d") or (strTemporalType=="1d") or (strTemporalType=="1m") or (strTemporalType=="1y")):				
			arrayIncr.append(1)				
		else:
			if (strTemporalType=="10y"):				
				arrayIncr.append(10)
			else:
				blnSpecialDates=1
				arrayIncr.append(-1)
	
	lngStepYear=0
	arrayReturn=[]
	if ((blnSpecialDates == 1) and (len(arrayIncr) == 1)):
				
		arrayYears = arrayFName["fixed"].split('_')				
		arrayReturn=[]
		for strTemp in arrayYears:	
			arrayReturn.append(int(strTemp[:4]))
	else:
		lngStepYear=1		
		arrayReturn = range(int(lngFromYear),int(lngToYear)+1,lngStepYear)		

	return arrayReturn
'''--------------------------------------------------------------------------	
	Escape funcionality.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''	
def escape(s, quote=None):
	s = s.replace("&", "&") # Must be done first!
	s = s.replace("<", "<")
	s = s.replace(">", ">")
	
	if (quote):
		s = s.replace('"', '"')	
	return s
'''--------------------------------------------------------------------------	
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _verifyXss_array(arrayParams):
	
	for strTemp in arrayParams:	

		blnArray=isinstance(arrayParams[strTemp], list)		
		if (blnArray==False):					
			arrayParams[strTemp]=escape(str(arrayParams[strTemp]));								
		else:			
			for strVar in arrayParams[strTemp]:					
				for strVar1 in strVar:						
					blnArray=isinstance(strVar[strVar1], list)							
					if (blnArray==False):											
						arrayParams[strTemp][0][strVar1] = escape(str(arrayParams[strTemp][0][strVar1])) 			
												
	return arrayParams
'''--------------------------------------------------------------------------	
	Function used to retrieve common dates.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''
def _returnCommonDates(arrayFNameS):
	arrayDays=[]
	for arrayFName in arrayFNameS:		

		strTempDates=''				
			
		if (arrayFName["shape_dates"]!=""):
			strTempDates=arrayFName["shape_dates"]
			
		strTempInterval=arrayFName["interval"]			
		dayconditions= _returnDayConditions(strTempInterval,strTempDates);
		arrayDays=arrayDays+dayconditions	
					
	resultList= list(set(arrayDays))
	resultList.sort(reverse=False)
	return resultList
'''--------------------------------------------------------------------------	
	Function used the first time to return graph setting values.
   --------------------------------------------------------------------------
   --------------------------------------------------------------------------'''		
def _returnGraphSettings():
	global strGIniSectionGraph;

	global strGGraph_Title;
	global strGGraph_xTitle;
	global strGGraph_width;
	global strGGraph_height;
	global strGGraph_numY1Dataset;
	global strGGraph_numY2Dataset;
	global strGGraph_numDecPlaces;
	global strGGraph_refreshMSec;
	global strGMView_numMaxLayers;
	global strGMView_latLongNPlaces;	

	arraySettings={}
	arraySettings["title"]=_returnIniValue(strGIniSectionGraph,strGGraph_Title)	
	arraySettings["xtitle"]=_returnIniValue(strGIniSectionGraph, strGGraph_xTitle)		
	arraySettings["width"]=_returnIniValue(strGIniSectionGraph, strGGraph_width)			
	arraySettings["height"]=_returnIniValue(strGIniSectionGraph, strGGraph_height)				
	arraySettings["numY1Dataset"]=_returnIniValue(strGIniSectionGraph, strGGraph_numY1Dataset)					
	arraySettings["numY2Dataset"]=_returnIniValue(strGIniSectionGraph, strGGraph_numY2Dataset)					
	arraySettings["numDPlaces"]=_returnIniValue(strGIniSectionGraph, strGGraph_numDecPlaces)						
	arraySettings["refreshMs"]=_returnIniValue(strGIniSectionGraph, strGGraph_refreshMSec)			
	arraySettings["mViewerMaxLayers"]=_returnIniValue(strGIniSectionGraph, strGMView_numMaxLayers)			
	arraySettings["mViewernumDPlaces"]=_returnIniValue(strGIniSectionGraph, strGMView_latLongNPlaces)						

	return arraySettings
def naive_unicode_fixer(text):
    while True:
        match = POSSIBLE_UTF8_SEQUENCE.search(text)
        if match:
            fixed = match.group(1).encode('latin-1').decode('utf-8')
            text = text[:match.start()] + fixed + text[match.end():]
        else:
            return text
