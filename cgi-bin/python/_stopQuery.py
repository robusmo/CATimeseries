#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
#========================================================================
#========================================================================
# File: _stopQuery.py
#========================================================================
#========================================================================
# File used to stop the execution of a script on server side when the
# user stop to execute the ajax call.
# When the system starts to execute a query, It creates a file called
# with the same name of csv file +'.pid' containing the instruction
# kill $pid.
# This script executes the content and delete the file.
#========================================================================

import os
import cgi
import cgitb
import sys
from mdlFunctions import _deleteFile,_killPid,_writeTrace

print "Content-Type: text/plain;charset=utf-8"
print

import json
# read input parameters
try:
	arrayParams = json.load(sys.stdin)
	print arrayParams
	# kill the pid
	_killPid(arrayParams["strFile"])
	# delete the temporary file
	#_deleteFile(arrayParams["strFile"])
except:
	_writeTrace(str(sys.exc_info()))		