#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
#========================================================================
#========================================================================
# File: _saveMap.py
#========================================================================
#========================================================================
# File used to publish a map of a specific layer into a pdf file.
#========================================================================
import os
import cgi
import base64
import socket
import datetime
from fpdf import FPDF
import HTMLParser	
import sys
from mdlFunctions import _writeTrace,_returnIniValue,_returnUniqueFilename,_returnGetMapLink,returnVariableFeature,_returnDatasetAttributes,_returnPdfCopyright,_returnLegendString,get_image_info,_returnHTMLDir,_returnTempDirectory,_returnHttpAddress

print "Content-Type: text/plain;charset=utf-8"
print

# read input parameter
try:
	form = cgi.FieldStorage()
	strLayer = form.getfirst("strLayer")				
	strYear = str(form.getfirst("strYear"))			
	strMonth = str(form.getfirst("strMonth"))			
	
	# html parser
	h = HTMLParser.HTMLParser()		

	# return output filename
	strName=_returnUniqueFilename()
	# save png and pdf extensions
	strOutFilenamePNG=strName+'.png';
	strOutFilenamePDF=strName+'.pdf';
	
	# pdf istance
	pdf=FPDF()
	# add page
	pdf.add_page()
	pdf.add_font('DejaVu', '', r'/var/lib/opengeo/geoserver/styles/DejaVuSansCondensed.ttf', uni=True)	
	pdf.set_font('Arial','B',16)
	cont=30
	# add title
	strTitle=_returnIniValue('PDF_CONFIGURATION','PDF_TITLE')
	pdf.cell(200, 10, txt=strTitle, ln=1, align="L")
	pdf.set_font('Arial','',16)
	strHttp=_returnHttpAddress();
	# add link
	pdf.cell(200,10,strHttp,0,1,'L')
	pdf.ln(10)
	cont=cont+10
	
	if (strLayer!=""):
		# add layer
		
		pdf.ln(5)
		pdf.set_x(10)
		cont=cont+10
		arrayFName=returnVariableFeature(strLayer)	
		if (strMonth!="None"):
			strDate=strYear+'-'+strMonth
		else:
			strDate=strYear
		
		strPrintDate=str(strDate)		
		arrayVDataset=_returnDatasetAttributes(arrayFName["id"],arrayFName["type"])					
		
		strLink=_returnGetMapLink(arrayFName,arrayVDataset,strYear,strMonth);		
		
		pdf.set_font('Arial','',12)
		# layer title
		pdf.cell(0,0,'Layer: ');		
		pdf.ln(5)		
		cont=cont+10
		pdf.set_x(15)
		pdf.set_font('DejaVu','',12)	
		
		strText=arrayFName['description']+', '+strPrintDate
		if (arrayVDataset["unit"]!=""):
			strText+=' ('+arrayVDataset["unit"]+')'	
		pdf.cell(0,0,strText.decode('UTF-8'))		
		pdf.ln(100)		
		# add image
		pdf.image(strLink,10,cont,180,100,'PNG')	
		cont=cont+110				
		# add legend
		
		if (arrayFName["legend"]==""):
			# return http image
			
			strLegend=_returnLegendString(arrayFName,arrayVDataset,strDate);
			import urllib2
			a=urllib2.urlopen(strLegend).read()		
			size=get_image_info(a)				
		else:		
			
			# return image info
			strPath=_returnHTMLDir()					
			with open(strPath+arrayFName["legend"], 'rb') as f:
				
				data = f.read()				
				size=get_image_info(data)				
				
			strLegend=strPath+arrayFName["legend"]	
		
		# calculate image size
		lngW=size[0]
		lngH=size[1]
		lngWMax=50
		lngHMax=30
		if (lngW>lngH):
			if (lngW>lngWMax):
				lngH=(lngWMax*lngH)/lngW
				lngW=lngWMax
		else:
			if (lngH>lngHMax):
				lngW=(lngHMax*lngW)/lngH
				lngH=lngHMax		
		# add image
		
		pdf.image(strLegend,10,cont,lngW,lngH)	
		pdf.ln(lngH+30)	
					
		# add copyright
		pdf.set_font('Arial','',12)
		pdf.cell(0,0,'Use limitation: ');
		strTextCopyright=_returnPdfCopyright(arrayFName["id"])
		pdf.ln(5)			
		pdf.set_font('DejaVu','',10)	
		# multi cell (text)
		pdf.multi_cell(180,5,strTextCopyright.decode('UTF-8'))	

	
	strOutputDirectory=_returnTempDirectory(0);
	strHTTPOutputDirectory=_returnTempDirectory(1);
	pdf.output(strOutputDirectory+strOutFilenamePDF,'F')
	# print and return the output link
	print strHTTPOutputDirectory+strOutFilenamePDF;
except:	  
	_writeTrace(str(sys.exc_info()))	
	print ""
