#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
#========================================================================
#========================================================================
# File: _saveGraph.py
#========================================================================
#========================================================================
# File used to publish a graph into a pdf file.
#========================================================================
# ROBUSMON: 30/04/2015
# Replace Arial with Arial: font not installed at EEA.
#========================================================================
import os
import cgi
import base64
import socket
import datetime
import sys
from mdlFunctions import _returnMetadataAdditionalInfo,_returnMetadataLink,naive_unicode_fixer,_writeTrace,_returnIniValue,_returnUniqueFilename,returnVariableFeature,_returnPdfCopyright,_returnDatasetAttributes,_returnTempDirectory,_returnHttpAddress
from fpdf import FPDF
import HTMLParser	

print "Content-Type: text/plain;charset=utf-8"
print


try:
	print "porva"
	# reads input parameters
	form = cgi.FieldStorage()
	h = HTMLParser.HTMLParser()		
	
	data = form.getfirst("data")	
	
	strParams=form.getfirst("strParams")
	
	pos = data.find(",")			
	
	data=data[pos+1:]			
	
	arrayParams = strParams.split('<%%>')	
	data = base64.b64decode(data)
	
	# output directory
	strOutputDirectory=_returnTempDirectory(0);
	# return filename
	strName=_returnUniqueFilename()
	# png and pdf extensions
	strOutFilenamePNG=strName+'.png';
	strOutFilenamePDF=strName+'.pdf';
	# open png file for writing
	f = open(strOutputDirectory+strOutFilenamePNG, 'w')		
	f.write(data)	
	f.close()
	# parameters	
	


	#print arrayParams[1]
	#strText=arrayParams[1].encode("utf-8")
	
	#print strText
	#arrayParams[1]=h.unescape(arrayParams[1])
	#arrayParams[1]=arrayParams[1].replace("<br>", ", ");	
	#arrayParams[1]=arrayParams[1].replace("�", "");
	
	# variables
	arrayVars1 = arrayParams[2].split('#')	
	arrayVars2 = arrayParams[3].split('#')	
	
	# pdf istance
	pdf=FPDF()
	# add page
	pdf.add_page()
	#pdf.add_font('Arial', '', r'/var/lib/opengeo/geoserver/styles/ArialSansCondensed.ttf', uni=True)
	pdf.set_font('Arial', '', 14)
		
	
	
	pdf.set_font('Arial','B',16)
	cont=0
	# add title
	strTitle=_returnIniValue('PDF_CONFIGURATION','PDF_TITLE')
	pdf.cell(200, 10, txt=strTitle, ln=1, align="L")
	pdf.set_font('Arial','',16)
	strHttp=_returnHttpAddress();
	# add ce ll for address
	pdf.cell(200,10,strHttp,0,1,'L')
	pdf.ln(10)
	cont=cont+10
	# add cell for operation
	pdf.set_font('Arial','',12)
	pdf.cell(0,0,'Operation: ');
	pdf.ln(5)
	cont=cont+5
	pdf.set_x(15)
	# add cell for coordinates
	pdf.set_font('Arial','',12)
	pdf.cell(0,0,arrayParams[0].decode('UTF-8'))
	pdf.ln(5)
	cont=cont+5
	# add cell for coordinates
	pdf.set_font('Arial','',12)
	pdf.cell(0,0,'Coordinates: ');
	pdf.ln(5)
	cont=cont+5
	pdf.set_x(15)
	pdf.set_font('Arial','',12)
	pdf.cell(0,0,arrayParams[1].decode('UTF-8'))
	
	#pdf.write(8, text)
	pdf.ln(5)
	cont=cont+5
	pdf.set_font('Arial','',12)
	# variables list
	pdf.cell(0,0,'Variables Y1: ');
	pdf.ln(5)
	cont=cont+5
	strAdditionalInfo=''
	strTextCopyright=''
	for value in arrayVars1:
		if (value!=""):
			arrayFName=returnVariableFeature(value)	
			
			arrayVDataset=_returnDatasetAttributes(arrayFName["id"],arrayFName["type"])		
			pdf.set_font('Arial','',12)				
			strAdd=arrayFName["description"].decode('UTF-8')			
			if (arrayVDataset["unit"]!=""):
				strAdd+=' ('+arrayVDataset["unit"].decode('UTF-8')+')'
			
			pdf.set_x(15)			
			pdf.cell(0,0,strAdd)
			# for each variable add a description
			pdf.ln(5)
			cont=cont+5		
			# save the copyright for each variable in order to put the text after the graph
			strTextCopyright+='\n\n'+strAdd+'\n'+_returnPdfCopyright(arrayFName["id"]);	
			
			strAdditionalInfo+=_returnMetadataAdditionalInfo(arrayFName["id"]);			
			strAdditionalInfo+='\n\nMetadata link: \n'+_returnMetadataLink(arrayFName["id"])
			
	blnPrimaVolta=1
	
	for value in arrayVars2:
		if (value!=""):
			if (blnPrimaVolta==1):
				blnPrimaVolta=0;
				pdf.cell(0,0,'Variables Y2: ');
				pdf.ln(5)
				
			pdf.set_x(15)	
			arrayFName=returnVariableFeature(value)	
			arrayVDataset=_returnDatasetAttributes(arrayFName["id"],arrayFName["type"])		
			pdf.set_font('Arial','',12)				
			strAdd=arrayFName["description"].decode('UTF-8')			
			if (arrayVDataset["unit"]!=""):
				strAdd+=' ('+arrayVDataset["unit"].decode('UTF-8')+')'
			
			pdf.cell(0,0,strAdd)
			# for each variable add a description
			pdf.ln(5)
			cont=cont+5
			# save the copyright for each variable in order to put the text after the graph
			strTextCopyright+='\n\n'+strAdd+'\n'+_returnPdfCopyright(arrayFName["id"]);	
			strAdditionalInfo+='\n\n'+_returnMetadataAdditionalInfo(arrayFName["id"]);			
			strAdditionalInfo+='\n\nMetadata link: \n'+_returnMetadataLink(arrayFName["id"])
	# add graph image
	pdf.image(strOutputDirectory+strOutFilenamePNG,10,cont+40,180,120,'PNG')
	# add copyright
	if (strTextCopyright!=""):
		pdf.ln(130)		
		pdf.set_font('Arial','',12)
		pdf.cell(0,0,'Use limitation: ');
		pdf.ln(1)		
		pdf.set_font('Arial','',10)	
		pdf.multi_cell(180,5,strTextCopyright.decode('UTF-8'))
		strHTTPOutputDirectory=_returnTempDirectory(1);
	pdf.ln(5)					
	if (strAdditionalInfo!=""):			
		pdf.set_font('Arial','',10)	
		pdf.multi_cell(180,5,strAdditionalInfo.decode('UTF-8'))
		strHTTPOutputDirectory=_returnTempDirectory(1);
	pdf.ln(5)			
	
	pdf.output(strOutputDirectory+strOutFilenamePDF,'F')
	# print and return the output link	
	print strHTTPOutputDirectory+strOutFilenamePDF;
except:	  
	_writeTrace(str(sys.exc_info()))		
	print ""	
