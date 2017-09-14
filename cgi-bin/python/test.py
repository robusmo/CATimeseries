#!/usr/bin/env python
# -*- coding: utf-8 -*-
from array import *
from datetime import *
from gdalconst import *
from owslib.etree import *
from owslib.namespaces import *
from owslib.ows import *
from owslib.util import *
from owslib.wcs import WebCoverageService as w
from owslib.wfs import WebFeatureService
from owslib.wms import WebMapService
from urllib import urlencode
from urllib2 import urlopen
from xml.dom.minidom import parse, parseString
from xml.dom.minidom import parseString
import ast
import base64
import ConfigParser
import gdal
import getopt
import json
import numpy
import socket
import sys
import time
import xml.etree.ElementTree as ET
import cgitb
import cgi
import os

cgitb.enable()

print "Content-Type: text/plain;charset=utf-8"
print

print "Python additional packages work correctly!";