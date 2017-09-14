
	// style of polygon contour when the user selects a shapefile
	var polygonStyle = new OpenLayers.Style();				 	
	polygonStyle.strokeColor   = "#FF0000";
	polygonStyle.strokeWidth   = 5;
	polygonStyle.strokeOpacity = 0.7;
	polygonStyle.fillColor     = "#FFA500";
	polygonStyle.fillOpacity   = 0.3;	
	var boxStyle = new OpenLayers.Style();				 	
	boxStyle.strokeColor   = "#FF0000";
	boxStyle.strokeWidth   = 1;
	boxStyle.strokeOpacity = 0.7;
	boxStyle.fillColor     = "#FFA500";
	boxStyle.fillOpacity   = 0.3;		
	
	var strGLegend='';
	var strGwmsLayerDate='';
	var strGLayerName='';
	var strUUID="";
	//var blnGEnabled=true;
	
	var lngGContLayers=0;	
	var reqAjax='';
	var strGVars1='';
	var strGVars2='';
	var monthsName=new Array();
		monthsName[0]="January";
		monthsName[1]="February";
		monthsName[2]="March";
		monthsName[3]="April";
		monthsName[4]="May";
		monthsName[5]="June";
		monthsName[6]="July";
		monthsName[7]="August";
		monthsName[8]="September";
		monthsName[9]="October";
		monthsName[10]="November";
		monthsName[11]="December";	
		
	var lngGCounterAjax=0;	
	var strGPdfFile='';
	var arrayGDataset=new Array();
	var arrayGCSV=new Array();
	var strGType='';
	var strGwmsLayer="";
	var strGPrevwmsLayer="";
	var myWindow="";
	var dateGFromGraph="";
	var dateGToGraph="";
	var _returnMetadataLink="";
	var allFields = '';
	var arrayGDataset='';
	var arrayGGroups='';
	var arrayGSettings='';
	var arrayGDatasetAncillary='';
	var arrayGDataVar1_list=new Array();
	var arrayGDataVar2_list=new Array();
	var arrayGVar1=new Array();
	var arrayGVar2=new Array();		
	var blnEnabledGRaster=true;		
	var strGDefaultShapeDescription = " *** selection ***";
	var myVar='';
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to show the indicator.						      */
//------------------------------------------------------------------
//------------------------------------------------------------------		
function showIndicator(blnSet){	
	if (blnSet==1)
	{		
		$("#draggable_indicator").css("display", "block");
		$("#draggable_indicator2").css("display", "block");		
	}
	else
	{		
		$("#draggable_indicator").css("display", "none");
		$("#draggable_indicator2").css("display", "none");		
	}
}	
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Show graph indicator											  */
//------------------------------------------------------------------
//------------------------------------------------------------------
function showIndicatorG(blnSet){	
	if (blnSet==1)
	{
		$("#draggable_indicatorG").css("display", "block");		
		$("#draggable_indicator").css("display", "none");
		$("#draggable_indicator2").css("display", "none");			
	}
	else
	{	
		$("#draggable_indicatorG").css("display", "none");		
	}
}	
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to select a value from the layers list popup.    */
//------------------------------------------------------------------
//------------------------------------------------------------------
function selectVal(lngID,strVar){
	showIndicator(1);
	i=0;
	var blnExit=false;
	var blnVisibility=false;
	// all map variables
	while ((i<mapObj.getNumLayers())  && (blnExit===false) )
	{			
		// check the name
		if (lngID==mapObj.layers[i].name)
		{	
			blnExit=true;
			var layerToRemove=mapObj.getLayer(mapObj.layers[i].id);			
			// found it
			blnVisibility=layerToRemove.visibility;			
		}
		else
			i++;
	}
	
	if (blnExit==false)
	{	
		// load the dataset
		result=loadDataset(1,1,lngID);
		if (result==true)
		{
			_resetAndselectLastDataset(lngID);
			// add the variable to the graph configuration tab
			addGraphVar(lngID);			
		}
	}
	
	showIndicator(0);
	return true;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to return date from-to for a layer.			  */
//------------------------------------------------------------------
//------------------------------------------------------------------
function _returnDateFromTo(strVar,blnReloadDate){
	
	if (typeof blnReloadDate=="undefined")		blnReloadDate=0;
	var strValue='';
	arrayTemp=arrayGDataset;
	
	if (strVar=="VAR1")
	{		
		// variable axix1
		strValue=document.getElementById("gvar1-id").value;
	}
	else
	{
		if (strVar=="VAR2")
		{
			// variable axix2
			strValue=document.getElementById("gvar2-id").value;
		}
		else
		{
			// from home
			strValue=document.getElementById("layer_field-id").value;
		}
	}

	// looking into the array
	var queryResult = Enumerable.From(arrayTemp)
	.Where(function (x) { return x.value == strValue})
	.OrderBy(function (x) { return x.label })
	.Select(function (x) { 
		// found it
		// set from-to dates
		_setDateJS(1,x.fromDate);					
		_setDateJS(0,x.toDate);
					
		return x.label + ':' + x.value })
	.ToArray();
	if (blnReloadDate==1)
	{
		// configure graph
		_configureGraph(0,1);
	}	
	return true;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to translate a string date into date format.     */
//------------------------------------------------------------------
//------------------------------------------------------------------
function _returnDate(strTempDate){
	var strTemp='';
	if (typeof strTempDate=="undefined")		strTempDate='';
	if (strTempDate!="")
	{
		// 1998-01-01 00:00:00: input format
		strTemp=strTempDate.replace(":","-"); 															
		strTemp=strTemp.replace(":","-"); 															
		strTemp=strTemp.replace(" ","-"); 															
		
		var arrayTemp=strTemp.split("-");			
		// return date
		var strTemp = new Date(arrayTemp[0],arrayTemp[1]-1,arrayTemp[2],arrayTemp[3],arrayTemp[4],arrayTemp[5])
	}
	return strTemp;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to set min-man date for a layer.				  */
//------------------------------------------------------------------
//------------------------------------------------------------------
function _setDateJS(blnFrom,strTempDate){
	// return date
	var strDate=_returnDate(strTempDate);
	if (blnFrom==1)
	{		
		if (dateGFrom=="")	
			dateGFrom=strDate;
		else
		{
			// verify if the global from date is greater than the value
			if (dateGFrom>strDate)
			{
				// change it
				dateGFrom=strDate;
			}
		}
	}
	else
	{
		if (dateGTo=="")	
			dateGTo=strDate;
		else
		{	
			if (dateGTo<strDate)
			{
				dateGTo=strDate;
			}
		}
	}	
	return true;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to configure the configuation tab for graph.	  */
//------------------------------------------------------------------
//------------------------------------------------------------------
function _configureGraph(blnOpen,blnChangeDate,blnAlreadyChanged){
	// indicator off when the configuration tab is shown
	
	// if opened
	if (blnOpen==1)
	{
		if ($('#buttonMaximize').attr('class')=="_buttonMaximize DivShow")
		{	
			// restore window
			_maximazeWin();
			return true;
		}
		else
		{
			// clear graph and status result
			document.getElementById("graphResult").innerHTML="";
			document.getElementById("status").innerHTML="";
			document.getElementById("graphSection_PLAYInit").innerHTML="<br><a href='' onClick="+'"'+"submitGraph();return false;"+'"'+"><img src='/CA/comm/images/play.png'></a>";			
			document.getElementById("graphSection_PLAY").innerHTML="<br><a href='' onClick="+'"'+"submitGraph();return false;"+'"'+"><img src='/CA/comm/images/play.png'></a>";			
		}
	}	
	
	// configure export graph section
	_setTextExportGraphSection("ALL_DIS");
	
	// disabled from and to date from configuration graph section
	$( "#dateFrom" ).datepicker( "option", "disabled", false );
	$( "#dateTo" ).datepicker( "option", "disabled", false );

	if (typeof blnAlreadyChanged=="undefined")		blnAlreadyChanged=0;
	if (typeof blnOpen=="undefined")		blnOpen=1;
	if (typeof blnChangeDate=="undefined")		blnChangeDate=0;
	// set min and max date for from and to date
	
	$("#dateFrom").datepicker( "option", "minDate", dateGFromGraph );
	$("#dateFrom").datepicker( "option", "maxDate", dateGToGraph );
	if (blnChangeDate==1)
	{
		// set date
		$("#dateFrom").datepicker( "setDate", dateGFromGraph );	
		$("#dateFrom").datepicker("refresh");		
	}	
	$("#dateTo").datepicker( "option", "minDate", dateGFromGraph );
	$("#dateTo").datepicker( "option", "maxDate", dateGToGraph );	
	if (blnChangeDate==1)
	{
		$("#dateTo").datepicker( "setDate", dateGToGraph );
		$("#dateTo").datepicker("refresh");	
	}
	// configure all other values
	$("#spanValidateTips_Graph").html("Configure the graph:");	

	var strAdd=''
	var strText="";
	// query by 
	
	if (blnGFoundVectorY1==1 || blnGFoundVectorY2==1)
	{
		// confinue		
	}
	else
	{	
	
		if (blnAlreadyChanged==0)
		{
			$("#spanGQueryBy_params").html("");
			$("#spanGQueryBy").html("");


			
			if ($('#draggable_querybypoint').css('display')=="block")	
			{
				// POINT
				$("#spanGQueryBy").html("point");				
				if (parseFloat(document.getElementById('txtLat').value)>0)	strAdd='+';
				strText+="Latitude: "+strAdd;
				if (document.getElementById('txtLat').value!="")
					strText+=parseFloat(document.getElementById('txtLat').value).toFixed(arrayGSettings.mViewernumDPlaces)+' &deg;';
				else
					strText+='--'
				strAdd=''
				if (parseFloat(document.getElementById('txtLon').value)>0)	strAdd='+';
				strText+=", Longitude: "+strAdd;
				if (document.getElementById('txtLon').value!="")
					strText+=parseFloat(document.getElementById('txtLon').value).toFixed(arrayGSettings.mViewernumDPlaces)+' &deg;';		
				else
					strText+='--'			
			}
			else
			{
			
				if ($('#draggable_querybybox').css('display')=="block")
				{
					// BOX
					$("#spanGQueryBy").html("box");					
					strText+="Latitude: "
					strAdd=''
					if (parseFloat(document.getElementById('txtLLat').value)>0)	strAdd='+';
					strText+=" from "+strAdd;
					if (document.getElementById('txtLLat').value!="")
						strText+=parseFloat(document.getElementById('txtLLat').value).toFixed(arrayGSettings.mViewernumDPlaces)+'&deg;';
					else
						strText+='--'
					
					if (parseFloat(document.getElementById('txtULat').value)>0)	strAdd='+';
					strText+=" to "+strAdd;
					if (document.getElementById('txtLLat').value!="")
						strText+=parseFloat(document.getElementById('txtULat').value).toFixed(arrayGSettings.mViewernumDPlaces)+"&deg;"
					else
						strText+='--'
						
					strText+=", Longitude: from ";
					strAdd=''
					if (parseFloat(document.getElementById('txtLLon').value)>0)	strAdd='+';
					strText+=strAdd;
					if (document.getElementById('txtLLat').value!="")
						strText+=parseFloat(document.getElementById('txtLLon').value).toFixed(arrayGSettings.mViewernumDPlaces)+"&deg;";
					else
						strText+='--'
						
					strAdd=''
					if (parseFloat(document.getElementById('txtRLon').value)>0)	strAdd='+';			
					strText+=" to "+strAdd;
					if (document.getElementById('txtLLat').value!="")
						strText+=parseFloat(document.getElementById('txtRLon').value).toFixed(arrayGSettings.mViewernumDPlaces)+'&deg;';									
					else
						strText+='--'
						
				}
				else
				{				
					if ($('#draggable_querybyshape').css('display')=="block")
					{
					
						// SHAPE				
						var strToAdd="";
						var strValue="";
						if (document.getElementById("shape_select").disabled==false)
						{
							strToAdd=document.getElementById("shape_select").options[document.getElementById("shape_select").selectedIndex].text;
							strValue=document.getElementById('txtFSelectedValue').value;
							strToAdd=strToAdd.substr(0,strToAdd.length-1);
						}
						else
						{
							strToAdd=" shape";
							strValue=' --'
						}				
						$("#spanGQueryBy").html(strToAdd);												
						strText+=strValue;					
					}
				}
			}
		// set the text
		$("#spanGQueryBy_params").html(strText);						
		
		}
	}
	$("#txtSetMinValueGraphY1").val("");						
	$("#txtSetMaxValueGraphY1").val("");						
	$("#txtSetMinValueGraphY2").val("");						
	$("#txtSetMaxValueGraphY2").val("");						

	// open the window			
	if (blnOpen==1)
	{	
		showIndicatorG(0);
		$( "#dialog_configureGraphParams" ).dialog("open");	
	}
	
	return true;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to load all layers into a popup page.		      */
//------------------------------------------------------------------
//------------------------------------------------------------------
function _showAllVariables(){

	_loadLikeLayers();
	$( "#dialog_variables" ).dialog("open");
	
	return true;
}
 
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to return an unique array: It returns an array
 removing duplicate and empty elements.*/
//------------------------------------------------------------------
//------------------------------------------------------------------
function getUnique(a) {
	var b = [a[0]], i, j, tmp;
	for (i = 1; i < a.length; i++) 
	{
		tmp = 1;
		for (j = 0; j < b.length; j++) {
		  if (a[i] == b[j]) {
			tmp = 0;
			break;
		  }
		}
		if (tmp) {
		  b.push(a[i]);
		}
	}
	return b;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Load dataset.					*/
//------------------------------------------------------------------
//------------------------------------------------------------------

function loadDatasets(strType,strReturnVar){
	if (typeof strReturnVar=="undefined")	
	{
		strReturnVarValue='';
		strReturnVar='';
	}
	if (strReturnVar!="")
	{
		// from VAR		
		strReturnVarValue=document.getElementById(strReturnVar).value;		
	}
	var data_graph =  new Array();
	if (arrayGDataset=='')
	{
		var data =  new Array();
		var arrayLayers=new Array();
		// first time: async ajax script to load only name for all dataset (without GN)
		showIndicator(1);
		var url='/cgi-bin/python/_returnDatasetFieldID.py?strReturn='+strReturnVarValue+'&strType=DATASET&blnOnlyValues=1'
		
		$.ajax({    
		url : url,    
		type: "GET",    		
		dataType: "json",	
		async: false,
		success: function(response, textStatus, jqXHR)    
		{     					
			arrayGDataset=response.data;
			arrayGGroups=response.groups;
			arrayUniqueOwner=response.owner;
			arrayUniqueOwnerGraph=response.ownerGraph;
			arrayUniqueIndicator=response.datasetIndicatorGroup;
			arrayReplaceIndicator=response.replaceDatasetIndicator;
			strGMetadataPath=response.GNpath;
			arrayGSettings=response.graphSettings;
			if (arrayGSettings.numY1Dataset!="")	$("#LeftYMax").html(", maximum "+arrayGSettings.numY1Dataset+' datasets');
			if (arrayGSettings.numY2Dataset!="")	$("#RightYMax").html(", maximum "+arrayGSettings.numY2Dataset+' datasets');
								
			return '';
		},    
		
		error: function (jqXHR, textStatus, errorThrown){     
		}});				
		
		// return all datasets with GN information
		
		var url='/cgi-bin/python/_returnDatasetFieldID.py?strReturn='+strReturnVarValue+'&strType=DATASET&blnOnlyValues=0'		
		$.ajax({    
		url : url,    
		type: "GET",    		
		dataType: "json",	
		async: true,
		success: function(response, textStatus, jqXHR)    
		{     		
			// save it in memory
			arrayGDataset=response.data;
			return '';
		},    
		
		error: function (jqXHR, textStatus, errorThrown){     

		}});

		// Loads all layers for layers'list in homepage
		
		//_loadFromGroupValues("cboLayerID","",1,0);				
		_loadOwnerY_Indicator("cboOwnerID",arrayUniqueOwner,arrayUniqueIndicator,"values_layer");
		// Loads all variables for selection1 and 2
		//_loadOwnerY("cboLayerID",arrayUniqueOwner);
		// graph combo1
		//_loadOwnerY("selVarY1",arrayUniqueOwnerGraph);
		_loadOwnerY_Indicator("selVarY1",arrayUniqueOwner,arrayUniqueIndicator,"values_graph");
		// graph combo2
		//_loadOwnerY("selVarY2",arrayUniqueOwnerGraph);
		_loadOwnerY_Indicator("selVarY2",arrayUniqueOwner,arrayUniqueIndicator,"values_graph");
	
		if (arrayGDatasetAncillary=='')
		{
			// Load all ancillary dataset						
			
			var url='/cgi-bin/python/_returnDatasetFieldID.py?strReturn='+strReturnVarValue+'&strType=ANCILLARY_DATASET&blnOnlyValues=0'
			var arrayAncillaryLayers=new Array();
			$.ajax({    
			url : url,    
			type: "GET",    		
			dataType: "json",	
			async: false,
			success: function(response, textStatus, jqXHR)    
			{     					
				arrayGDatasetAncillary=response.data;
				return '';
			},    			
			error: function (jqXHR, textStatus, errorThrown){     
			}});			
			// load all aoncillary dataset
			loadAncillaryDataset();
		}
		return arrayGDataset;
	}
	return '';
}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to reset all graph variables.				*/
//------------------------------------------------------------------
//------------------------------------------------------------------
function _resetGraphVariables(lngVar){
	// stop graph creation
	_stopGraph();
	if (lngVar==1)
	{		
		arrayGVar1 = [];	
		arrayGDataVar1_list=data;
	}
	else
	{
		arrayGVar2 = [];	
	}	
	if ((arrayGVar1.length==0)&&(arrayGVar2.length==0))
	{	
		dateGFrom='';
		dateGTo='';		
		$( "#dateFrom" ).datepicker( "option", "disabled", true );
		$( "#dateTo" ).datepicker( "option", "disabled", true );
	}
	return false;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* 
 Function used to load into a combobox all ancillary dataset as 
 single options. 												  */
//------------------------------------------------------------------
//------------------------------------------------------------------
function loadAncillaryDataset(){	
	$('#shape_select').prop('options').length = 0;
	
	for(var i = 0;  i < arrayGDatasetAncillary.length; i++) 
	{
		// Create new option element for each ancillary dataset
		var addOption= document.createElement("option");				
		// set value and text		
		addOption.value =  arrayGDatasetAncillary[i]["value"] ; // Insted of calling setAttribute 
		addOption.innerHTML = arrayGDatasetAncillary[i]["label"] // <a>INNER_TEXT</a>			
		// append it to the end
		document.getElementById('shape_select').appendChild(addOption);		
	}
	return true;
}

//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to verify when a user select a shapefile to compare, 
for example, with another layer on a selected point. The point will 
be transform into the shape contour of the shape file returned by 
the point selected. */
//------------------------------------------------------------------
//------------------------------------------------------------------
function _checkIfSelectAShapeFile(strType){
	switch(trim(strType)){
		// if is a shapefile
		case "s_d":	// shape dataset
		case "s_m": // shape collection
			if (document.getElementById("spanGQueryBy").innerHTML!=" shape")
			{
				document.getElementById("spanGQueryBy").innerHTML=" shape";	
				document.getElementById("spanGQueryBy_params").innerHTML=" selected shape";					
				_displayErrorMsg('The variable selected is a vector: the system will compare the area identified by x and y identified from spatial selection.','W');				
				var tips = $( ".validateTips_graph" );	
				_displayError('You select a shapefile.',tips,$("gvar1"));				
			}
		break;
	}
	return true;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to add a graph to configuration mask			*/
//------------------------------------------------------------------
//------------------------------------------------------------------
function addGraphVar(lngID){

	// Climate indicator
	var lngCI=$("#cboOwnerID").val();

	//$("#cboOwnerID").val("Habitat Sustainability");
	// Layer ID
	var lngD=$("#cboLayerID").val();

	// select the first element of owner select
	var obj = document.getElementById("selVarY1");
	var i=obj.length-1;
	var blnFound=false;
	while((i>=0)&&(blnFound==false))
	{
		if (obj[i].value==lngCI){
			obj[i].selected=true;	
			blnFound=true;
		}
		i--;
	}	
	if(blnFound==false)
	{	
		// looking for a scenario
		var i=arrayReplaceIndicator.length-1;
		var blnFound=false;
		while((i>=0)&&(blnFound==false))
		{			
			var k=obj.length-1;
			while((k>=0)&&(blnFound==false))
			{	

				if (arrayReplaceIndicator[i][1]==obj[k].value){								
					obj[k].selected=true;	
					blnFound=true;			
				}
				k--;
			}
			i--;
		}		
		
		var spltemp=lngID.split("REPLACESCENARIO");																		
		//strGScenarioID=spltemp[1];	
		
		lngD=lngD.replace("REPLACESCENARIO",$("#cboScenarioID").val()); 		
		
	}	
	// if found
	
	if(blnFound==true)
	{
		
		_loadVar_Layers("selVarY1",0);		
		// looking for the value
		var obj = document.getElementById("selVarY1_list");
		for (var i=obj.length-1;i>=0;i--)		
		obj[i].selected=false;
		var i=obj.length-1;
		var blnFound=false;
		while ((i>=0)&& (blnFound==false))
		{	
			if (obj[i].value==lngD)
			{
				blnFound=true;
				obj[i].selected=true;
				obj[i].focus();
				
				_setMaximumSelected(obj,'selVarY1');				
			}
			else
				i--;		
		}
	}
	else
	{	
		var obj = document.getElementById("selVarY1");
		var i=obj.length-1;
		var blnFound=false;
		while((i>=0)&&(blnFound==false))
		{
			if (obj[i].value.substr(0,lngCI.length)==lngCI){
				obj[i].selected=true;	
				blnFound=true;
				
			}
			i--;
		}	
	}
	
	return true;
	
	
}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to display an error.			*/
//------------------------------------------------------------------
//------------------------------------------------------------------

function _displayErrorMsg(strErr,strDialogTitle){
	if (typeof strDialogTitle=="undefined")		strDialogTitle='W';
	if (strErr=="")	return;	
	switch(strDialogTitle)
	{
		case "W":
			$('#dialog_error').dialog('option', 'title', 'Warning');
		break;
		case "E":
			$('#dialog_error').dialog('option', 'title', 'Error');
		break;		
	}
	$("#spanDialogError").html(strErr);							
	$( "#dialog_error" ).dialog( "open" );	
}

//------------------------------------------------------------------
//------------------------------------------------------------------
/* 
 Function used to display an error.
 Input parameters:
	strErr: string, to show the error
	tips: object, where to put the error string
	strObj, object, HTML object that generate the error		      */
//------------------------------------------------------------------
//------------------------------------------------------------------
/*
	function _displayError(strErr,tips,strObj){
	
		allFields = $( [] ).add( strObj )
		updateTips(strErr,tips);
		strObj.addClass( "ui-state-error" );
		strObj.focus();	
		
		
		setTimeout(function() {
		
				document.getElementById("spanValidateTips").innerHTML='&nbsp;';										
				strObj.removeClass( "ui-state-error" );				
				
			}, 5000 );
		
	}
*/
/*	-----------------------------------------------------------------------	
	-----------------------------------------------------------------------
	-----------------------------------------------------------------------
	-----------------------------------------------------------------------
	Function used to clean all "state-error" classes.
	-----------------------------------------------------------------------  */	
	function _cleanAllFields(){
		if (allFields!="")
		{
			setTimeout(function() {
					allFields.removeClass( "ui-state-error", 1500 );
					allFields='';
				}, 500 );	
		}
		return true;
	}
/*	-----------------------------------------------------------------------	
	-----------------------------------------------------------------------
	-----------------------------------------------------------------------
	-----------------------------------------------------------------------
	Function used to change the input stylesheet in case of error.
	-----------------------------------------------------------------------  */	
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function updateTips( t,tips) {
			tips
				.text( t )
				.addClass( "ui-state-highlight" );
			setTimeout(function() {
				tips.removeClass( "ui-state-highlight", 1500 );
			}, 500 );
			
		}	
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to create a graph.								*/
//------------------------------------------------------------------
//------------------------------------------------------------------			
	function submitGraph(){
			
		// enabled/disabled all configuration options
		enDisConfigurationGraphInput(0);
			
		var tips = $( ".validateTips_graph" );	
		// No variable selected
		if ((arrayGVar1.length==0) && (arrayGVar2.length==0))
		{
			enDisConfigurationGraphInput(1);
			_displayErrorMsg("Select a dataset.",'E')
			
			return false;
		}
		// No tool selected
		
		
		
		if(($('#draggable_querybyshape').css('display')!="block") && ($('#draggable_querybypoint').css('display')=="block") && ($('#draggable_querybybox').css('display')=="block"))	
		{
			enDisConfigurationGraphInput(1);
			_displayErrorMsg("Select a dataset.",'E')
			//_displayError('Please, choose a variable to activate the tool section.',tips,$("#layer_field"));
		}
		else
		{
			var strTo=new Date(document.getElementById('dateTo').value);
			var strFrom=new Date(document.getElementById('dateFrom').value);
			// Date from greater than dateto
			
			if (strTo<=strFrom)
			{
				enDisConfigurationGraphInput(1);
				_displayErrorMsg("Date To must be greater than Date From.",'E')
				//_displayError('Please, Date To must be greater than Date From.',tips,$("imgQueryShape"));
				return false;
			}
		}							
		
		
		if (($('#draggable_querybyshape').css('display')=="block")&& (document.getElementById('featureToggle').disabled==false))
		{
			if (document.getElementById('txtFSelectedValue').value!="")
			{				
				// SHAPE
				result=_execQuery('SHAPE');
			}
			else
			{
				enDisConfigurationGraphInput(1);				
			
				_displayErrorMsg("Select a valid geographical area.",'E')
			}
		}
		else
		{			
			
			if (($('#draggable_querybypoint').css('display')=="block") && (document.getElementById('pointToggle').disabled==false))
			{			
				if (document.getElementById('txtLon').value!="")
					// POINT					
					result=_execQuery('POINT');
				else
				{
					enDisConfigurationGraphInput(1);			
					_displayErrorMsg('Select a valid point.','E');
				}
			}		
			else
			{
			
				if (($('#draggable_querybybox').css('display')=="block") && (document.getElementById('boxToggle').disabled==false))
				{				
					if (document.getElementById('txtRLon').value!="")
						// BOX
						result=_execQuery('BOX');
					else
					{
						enDisConfigurationGraphInput(1);			
						_displayErrorMsg('Select a valid box.','E');
					}
				}
				else
				{
					enDisConfigurationGraphInput(1);			
				
					_displayErrorMsg('Select a valid geographical area.','E');
				}
			}
		}
		return true;		
	}

//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to export a map to a pdf file.					  */
//------------------------------------------------------------------
//------------------------------------------------------------------
function createPdfMap(strLayer,strYear,strMonth){
		
	if (typeof strLayer=="undefined")		strLayer="";
	if (typeof strYear=="undefined")		strYear="";
	if (typeof strMonth=="undefined")		strMonth="";
	
	if (strLayer=="")
	{
		var arrayLayers=$('#ulDatasetLists').sortable('toArray');		
		strLayer=_returnSpanLayerName(arrayLayers[0]);		
		strYear=$('#year_select').val();
		strMonth=$('#date_select').val();
	}
	
	if (strLayer!="")
	{	
		// ajax script to save the map
		
		showIndicator(1);
		$.ajax({
			type: "POST",
			url: '/cgi-bin/python/saveMap.py',
			async: false,
			data: ({ strLayer: strLayer, strYear: strYear, strMonth: strMonth}),
			
			success: function(strHttp) {		
				if (strHttp!="")	openMetadataWin(strHttp)				
			},
			error: function() {
				_displayErrorMsg("There was an error with the request.",'E');		
			}	
		});
		
	}
	showIndicator(0);
	return true;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to translate the name of the dataset.		*/
//------------------------------------------------------------------
//------------------------------------------------------------------
	function _returnLayerName_tiled(strOriginalLayer,strDateTime){
		strOriginalLayer=strOriginalLayer.replace("YYYYMMDD",strDateTime); 	
		return strOriginalLayer;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Load a dataset.*/
//------------------------------------------------------------------
//------------------------------------------------------------------
var blnGLoadFromAncillary=false;
	function loadDataset(blnDate,blnLoadFromVariable,strLayerValue,blnSortable,blnLoadFromAncillary) {	
	
		showIndicator(1);
		$('#txtFLat').val('');
		$('#txtFLon').val('');								
		$('#txtFSelectedValue').val('');							
		
		if (typeof blnLoadFromVariable=="undefined")	blnLoadFromVariable=1
		if (typeof strLayerValue=="undefined")	strLayerValue=''		
		if (typeof strType=="undefined")	strType=''		
		if (typeof blnSortable=="undefined")	blnSortable=0;		
		if (typeof blnLoadFromAncillary=="undefined")	blnLoadFromAncillary=0;		
		blnGLoadFromAncillary=blnLoadFromAncillary;
		
		var strVarDescr="";
		var strVarValue="";
		var result=true;
		if (blnLoadFromVariable)
		{		
			if (strLayerValue=="")
			{				
				// Load from Variable			
				strVarDescr=document.getElementById("cboLayerID").value;				
				if (strVarDescr=="")	return true;
				
				strVarValue=document.getElementById("cboLayerID").value;
				strGwmsLayer=document.getElementById("cboLayerID").value;
				strGwmsLayer=_returnSpanLayerName(strGwmsLayer);
			}
			else
			{						
				// drag and drop functionality: 
				// reload the first variable 
				strVarTemp=_returnSpanLayerName(strLayerValue);							

				strVarDescr=strVarTemp;
				strVarValue=strVarTemp;
				strGwmsLayer=strVarTemp;
				blnDate=1;
				if (document.getElementById("cboOwnerID").value!="")
				{	
					var strOwnerDescr=document.getElementById("cboLayerID").value;
				}
				if (strVarDescr!="")		
				{										
					document.getElementById("cboLayerID").value=strVarDescr;							
				}
				_removeLayer(strVarTemp);							
			}
			if (strGPrevwmsLayer!=strGwmsLayer)
			{			
				blnDate=0;
			}			
		}
		else
		{	
			
			if (document.getElementById('featureToggle').checked==true)
			{		

				strVarDescr=document.getElementById("shape_select").options[document.getElementById("shape_select").selectedIndex].text;
				strVarValue=document.getElementById("shape_select").options[document.getElementById("shape_select").selectedIndex].value;
				
				strGwmsLayer=document.getElementById('shape_select').value;
				$("#txtFSelectedName").html(strVarDescr);													
				// Remove ancillary dataset
				_removeLayer("shape");			
			}
			else
			{
				//showIndicator(0);
				return true;
			}
		}
		
		if (strVarDescr!="")
		{
			if (blnDate!=0)
			{
				tempdateGFrom=dateGFrom
				tempdateGTo=dateGTo
				spltemp=arrayGDataset_values;			
			}
			else
			{		
				// reload info about variable
				// loads abstract info from capabilities
				strGwmsLayer=_returnSpanLayerName(strGwmsLayer);														
				strGLayerName=strGwmsLayer;
		
				//showIndicator(1);
				var url='/cgi-bin/python/getcapabilities.py?coverage='+strGwmsLayer+'&blnSortable='+blnSortable
				$.ajax({    
					url : url,    
					type: "GET",    
					dataType: "json",	
					async: true,
					success: function(response, textStatus, jqXHR)    
					{   
						//showIndicator(0);
						if (response.data.scenario=="")
						{
	
				
						
							//document.getElementById("cboScenarioID").disabled=true;
							if (strGwmsLayer!=response.data.strLabel)
							{
								strVarDescr=strGwmsLayer;
								strGPrevwmsLayer=strGwmsLayer;
								if (typeof response.data.strLabelTranslate!="undefined")		response.data.strLabel=response.data.strLabelTranslate;								

								var a=_selectComboValue(document.getElementById('cboLayerID'),response.data.strLabel);									
								if (a!=-1)
								{				
								
									result= analyzeDataset(1,response.data,blnLoadFromVariable,strVarDescr,blnSortable);						
									//showIndicator(0);
									return true;
									
								}
															
							}
							
							strGwmsLayer=response.data.strLabel					
							
							result= analyzeDataset(1,response.data,blnLoadFromVariable,strVarDescr,blnSortable);						
							if (blnLoadFromAncillary==1)
							{									
								return true;
							}
							
							if (result==true)
							{

								addDataset(response.data.strLabel,response.data.strDescription);	
								
							}
							
							//showIndicator(0);
							return result;
						}
						else
						{
							
							// load scenario							
							_addScenario(response.data.scenario);							
							if (strGScenarioID!="")				$('#cboScenarioID').val(strGScenarioID);
							addGraphVar(strGwmsLayer);
							showIndicator(0);
							return true;
						}
					},    
					
					error: function (jqXHR, textStatus, errorThrown){     
						//showIndicator(0);
					}
				});												
				return result;		

			}			
			
			result=analyzeDataset(0,spltemp,blnLoadFromVariable,strVarDescr,blnSortable);
			if (result==true)	
			{			
				addDataset(spltemp.strLabel,spltemp.strDescription);		
			}
		
		}

		return result;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/*Function used to select a value from a combo.					*/
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function _selectComboValue(objCombo,strFound){
		i=0;
		var blnExit=true;						
		while ((i<objCombo.length)  && (blnExit==true) )
		{												
			if (strFound==objCombo.options[i].value)			
				blnExit=false;
			else
				i++;
		}
		if (blnExit==false)
			return i;
		else
			return -1;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Add scenario dataset into the combo.							*/
//------------------------------------------------------------------
//------------------------------------------------------------------
	
	function _addScenario(arrayTemp){		

		// enabled the object
		$('#cboScenarioID').removeAttr('disabled');			
		// select the object
		var objSelect=document.getElementById("cboScenarioID");	
		// add empty option
		var addOption= document.createElement("option");	
		addOption.value='';
		addOption.text='';
		objSelect.appendChild(addOption);	
		
		for (var i=0;i<arrayTemp.length;i++)		
		{
			var addOption= document.createElement("option");	
			addOption.value=arrayTemp[i];
			addOption.text=arrayTemp[i];
			objSelect.appendChild(addOption);	
		}
		objSelect.setAttribute("onChange","_addLayer();return false;");
		//showIndicator(0);
		return true;
	}
	var spltemp='';
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function analyzeDataset(blnReload,spltemp,blnLoadFromVariable,strVarDescr,blnSortable){
		if (typeof blnSortable=="undefined")	blnSortable=0;
			//showIndicator(1);
			if (blnReload==1)
			{
				var tempdateGFrom = "";				
				strGLegend=spltemp.strLegend;					

				if (spltemp.strDateFrom!="")
				{
					var strTempDateFrom=spltemp.strDateFrom;
					var arrayDate=strTempDateFrom.substr(0,10).split("-");		
					// date from
					var tempdateGFrom = new Date(arrayDate[0],arrayDate[1]-1,arrayDate[2],0,0,0)											
				}
				var tempdateGTo ="";
				if (spltemp.strDateTo!=""){
					var strTempDateTo=spltemp.strDateTo;
					var arrayDate=strTempDateTo.substr(0,10).split("-");	
					// date to						
					var tempdateGTo = new Date(arrayDate[0],arrayDate[1]-1,arrayDate[2],23,59,59)																								
				}

				var strDateList=spltemp.strDateList;
				if (blnLoadFromVariable==1)
				{
					changeDateSelect_forDataset(spltemp.strDateType,strDateList,tempdateGFrom,tempdateGTo,spltemp.strDateInterval)
					if (dateGFrom=='')	dateGFrom=tempdateGFrom
					else
					{
						if (tempdateGFrom<dateGFrom)	dateGFrom=tempdateGFrom
					}
			
					if (dateGTo=='')	dateGTo=tempdateGTo
					else
					{			
						if (tempdateGTo>dateGTo)	dateGTo=tempdateGTo
					}				
					changeDateSelect_forDataset('TIMES',strDateList,dateGFrom,dateGTo,spltemp.strDateInterval)
								
					var strLegend=spltemp.strLegend;
					var strUnit=spltemp.strUnit;
					strUUID=spltemp.strID;
				}				
			}		
	
			// save the date
			var strDate = $('#date_select').val();		
			var strDateWMS = $('#year_select').val()+'-'+$('#date_select').val()		
			var arrayDate=document.getElementById('date_select').value.split("-");		
			var blnCheckDate=true;
			if (arrayDate[0]=="")
			{
				var blnCheckDate=false;
				arrayDate[0]=2;
				arrayDate[1]=1;			
			}
			
			var strCheckDate = new Date($('#year_select').val(),parseInt(arrayDate[0])-1,parseInt(arrayDate[1]))
			var strwmsLayerDate=strGwmsLayer.replace("DATE",strDate); 
			
			var blnLoad=0;
			if (blnCheckDate===true)
			{
				if (dateGFrom!="" && dateGTo!="")
				{
					// verify date
					if (strCheckDate >= dateGFrom && strCheckDate <= dateGTo)
						blnLoad=1;
				}
				else
					blnLoad=1;
			}
			else
				blnLoad=1;

			// Verify the date
			if (blnLoad==1)
			{			
					
				var blnFound=0;
				var blnRemove=0;					
				i=0;
				blnExit=0;
				
				// replace the description
				strVarDescr=_returnSpanLayerName(strVarDescr);
				
				while ((i<mapObj.getNumLayers())  && (blnExit=1) )
				{			
							
					switch(trim(spltemp.strDataType)){					
						case "r_m":	// raster_mosaic
						case "r_d":	// raster_dataset
						
							if (strVarDescr==mapObj.layers[i].name)
							{
								var layerToRemove=mapObj.getLayer(mapObj.layers[i].id);			
								blnExit=1;																										
								blnFound=0;
								blnRemove=1;
							}
						break;
						case "s_d":	// shape_dataset
						case "s_m":	// shape_mosaic
							
							if (typeof mapObj.layers[i].name!="undefined")
							{
								if (strVarDescr==mapObj.layers[i].name)
								{						
									var layerToRemove=mapObj.getLayer(mapObj.layers[i].id);								
									blnFound=1;
									blnRemove=1;
									strDateWMS="";
								}
								blnExit=1;
							}
						break;
					}
					i++;
				}
				var blnCheck=false;
				if (blnRemove==1)
				{				
					blnFound=0;
					if (typeof wmsLayerObj!="undefined"){

						mapObj.removeLayer(layerToRemove);					
						//lngGContLayers--;
						
				
						blnCheck=true;
					}
				}			
				if (blnFound==0)
				{
					// s_d
					// s_m
					// or raster
						strHttp=spltemp.strHttp
						strEpsg=spltemp.strEPSG
						strServerType=spltemp.strServerType
						blnEnabledGRaster=true;
						//strHttp='http://h05-dev-lrmaps.jrc.it:8080/geoserver/CA_LAND/wms?'
						//showIndicator(1);									
						if(strServerType=="GEOSERVER")
						{						
							switch(trim(spltemp.strDataType)){
								case "s_m":	// shapefile
									// remove ancillary dataset
									_removeLayer("shape");								
									blnEnabledGRaster=false;
																
									var strDescr="";
									if (blnLoadFromVariable)
									{
										strDescr=strGwmsLayer;
										strGPrevwmsLayer=strGwmsLayer;
										arrayGDataset_values=spltemp;
									}
									else
									{
										strDescr="shape";											
									}
									var yearValue=$('#year_select').val();
									
									
									var strwmsLayerDate=strGwmsLayer.replace("REPLACEKEY",yearValue); 												
		
									wmsLayerObj = new OpenLayers.Layer.WMS(strDescr,strHttp,{layers: strwmsLayerDate, transparent:true, format:'image/png',srs:toGProj});					

									strwmsLayerDate='';
								break;
								case "s_d":	// shapefile
								
									_removeLayer("shape");
	
									blnEnabledGRaster=false;
								
									var strDescr="";
									if (blnLoadFromVariable)
									{
										strDescr=strGwmsLayer;
										strGPrevwmsLayer=strGwmsLayer;
										arrayGDataset_values=spltemp;
									}
									else
									{
										strDescr="shape";		
									}																
										
									wmsLayerObj = new OpenLayers.Layer.WMS(strDescr,strHttp,{layers: strGwmsLayer, transparent:true, format:'image/png',srs:toGProj});					
									

								break;
								case "r_m":	// raster_mosaic		

														
									wmsLayerObj = new OpenLayers.Layer.WMS(strGwmsLayer,strHttp,{layers: strGwmsLayer, transparent:true, format:'image/png',srs:toGProj,time: strDateWMS});														
									strGPrevwmsLayer=strGwmsLayer;
									arrayGDataset_values=spltemp;
																	
									
								break;
								case "r_d":	// raster_dataset									
									var strDateWMSTemp=strDateWMS.replace("-","","g"); 		
									strDateWMSTemp=strDateWMSTemp.replace("-","","g"); 																
									strwmsLayerDate=_returnLayerName_tiled(strGwmsLayer,strDateWMSTemp);
									
									wmsLayerObj = new OpenLayers.Layer.WMS(strGwmsLayer,strHttp,{layers: strwmsLayerDate, transparent:true, format:'image/png',srs:toGProj});												
									strGPrevwmsLayer=strwmsLayerDate;
									arrayGDataset_values=spltemp;
								break;
							}					  
						}
						else
						{
						
							pos=strGwmsLayer.indexOf(":")
							strGwmsLayer=strGwmsLayer.substr(pos+1)
						
							switch(trim(spltemp.strDataType)){
								case "s_m":	// shapefile
								
									_removeLayer("shape");
									var blnLoadShape=1
									var yearValue=$('#year_select').val();
									
									var strwmsLayerDate=strGwmsLayer.replace("REPLACEKEY",yearValue); 							
									blnEnabledGRaster=false;
									strGPrevwmsLayer=strGwmsLayer;
									arrayGDataset_values=spltemp;
									wmsLayerObj = new OpenLayers.Layer.MapServer(strGwmsLayer, strHttp, {layers: strwmsLayerDate, transparent: true}, {opacity:1.0},{isBaseLayer: false,srs:toGProj});
									strwmsLayerDate='';
									
								break;
								case "s_d":	// shapefile
									blnEnabledGRaster=false;
									_removeLayer("shape");
								break;

								case "r_m":			// raster_mosaic					
									var blnLoadShape=1
			
									strDateWMS=_changeDateFormat(strGwmsLayer,strDateWMS);
									wmsLayerObj = new OpenLayers.Layer.WMS(strGwmsLayer,strHttp,{layers: strGwmsLayer, transparent:true, format:'image/png',srs:toGProj,time: strDateWMS});					
									strGPrevwmsLayer=strGwmsLayer;
									arrayGDataset_values=spltemp;
									

									
									
								break;
								case "r_d":			// raster_dataset
									var blnLoadShape=1
									var strDateWMSTemp=strDateWMS.replace("-","","g"); 								
									strDateWMSTemp=strDateWMSTemp.replace("-","","g"); 		
									strwmsLayerDate=_returnLayerName_tiled(strGwmsLayer,strDateWMSTemp);
									wmsLayerObj = new OpenLayers.Layer.MapServer(strGwmsLayer, strHttp, {layers: strwmsLayerDate, transparent: true}, {opacity:1.0},{isBaseLayer: false,srs:toGProj});
									strGPrevwmsLayer=strGwmsLayer
									arrayGDataset_values=spltemp;
								break;
							}					
						}
						

						if (strwmsLayerDate!='')	
							strGwmsLayerDate=strwmsLayerDate;
						else
							strGwmsLayerDate=strGwmsLayer;
						strVerify="";
						switch(trim(spltemp.strDataType)){
							case "s_m":	// shapefile							
								strVerify=strGwmsLayerDate;
							break;
							case "s_d":	// shapefile		
								strVerify=strGwmsLayerDate;							
							break;
							case "r_m":	
								strVerify=strGwmsLayerDate;
							break;							
							case "r_d":	
								strVerify=strGwmsLayer;
							break;
						}							
						//alert('VERIFY');
						result=_verifyNumberOfAvailableLayers(strVerify,mapObj,layerToRemove);
						if (result==false)	return false;
						
						
						wmsLayerObj.events.register('loadstart', this, onloadstart);
						wmsLayerObj.events.register('loadend', this, onloadend);
						// index of layer
						wmsLayerObj.setZIndex( 100 ); 																											
						
						//alert(wmsLayerObj);
						
						mapObj.addLayer(wmsLayerObj);	
						
						// Update the time (year and month) on pdf link in order to print the correct layer
						_updatePDFSingleLayer(strGwmsLayer,$('#year_select').val(),$('#date_select').val())
						
						
						//wmsLayerObj.setZIndex( -1 ); 
						if (blnLoadFromVariable)
						{	
							// enabled/disabled spatial selection tools
							enDisSpatialSelection(spltemp.strDataType);												
						}
						if (blnLoadShape==1)
						{ 						
							selectShapePolygon(1,1);							
						}					
				}
				else
					alert('There was an error with the request.');

				pointLayerObj.setZIndex( 1000 ); 			
				boxLayerObj.setZIndex( 1001 ); 			
				shapeLayerObj.setZIndex( 1002 ); 
				
				mapObj.addLayer(pointLayerObj);
				mapObj.addLayer(boxLayerObj);
				mapObj.addLayer(shapeLayerObj);
				
				for(var key in drawControls) {
					mapObj.addControl(drawControls[key]);
				}			

				var form = $('#myForm');
				var checkedValue = form.find('input[name=type]:checked').val();							
				// verify and open the query
				if (checkedValue=="point"){														
					openQueryDialog('P');
					drawControls["point"].activate();		
					pointLayerObj.setZIndex( 1000 ); 								
				}
				else
				{
					if (checkedValue=="box"){
						openQueryDialog('B');
						drawControls["box"].activate();									
						boxLayerObj.setZIndex( 1001 ); 		 
					}
					else
					{
						if (checkedValue=="shape")
						{
							openQueryDialog('S');
							$('#shape_select').removeAttr('disabled');	
							
							drawControls["shape"].activate();				
							
							switch(trim(spltemp.strDataType)){
								case "s_m":
								case "s_d":														
										
										if (strDescr!="shape")																											
										{																			
											$('#shape_select').attr('disabled', 'disabled');																															
										}
										else	
										{																									
											return false;														
										}
								break;
							}
						}
					}
				}					
			}
			else
			{
				var strVar=document.getElementById("cboLayerID").options[document.getElementById("cboLayerID").selectedIndex].text;	
				 
				//result=_verifyNumberOfAvailableLayers(document.getElementById("cboLayerID").options[document.getElementById("cboLayerID").selectedIndex].value,mapObj,layerToRemove,0);
				//if (result==false)	return false;
			 
				 
				_displayErrorMsg('Dataset "'+strVar+'" available from '+dateGFrom.getDate()+'/'+parseInt(dateGFrom.getMonth()+1)+'/'+dateGFrom.getFullYear()+' to '+dateGTo.getDate()+'/'+parseInt(dateGTo.getMonth()+1)+'/'+dateGTo.getFullYear()+'.','W');
				strGPrevwmsLayer=strGwmsLayer;
				arrayGDataset_values=spltemp;
				// change the date to first available
				var strTempDate='0'+parseInt(dateGFrom.getMonth()+1);				
				strTempDate=strTempDate.substr(strTempDate.length-2,2)+'-01';				
				$( "#date_select" ).val(strTempDate);
				$( "#year_select" ).val(parseInt(dateGFrom.getFullYear()));
				
				result=analyzeDataset(1,arrayGDataset_values,0,strGPrevwmsLayer,0);
				// enabled/disabled spatial selection
				enDisSpatialSelection(spltemp.strDataType);						
				return result;
				
				//lngGContLayers++;
				
			}	
			
			return true;
	}
	
	function enDisSpatialSelection(strValue){
		
		switch(trim(strValue)){
			case "s_m":	// shapefile										
			case "s_d":							
				$('#pointToggle').attr('disabled', 'disabled');
				$('#boxToggle').attr('disabled', 'disabled');
				$('#shape_select').attr('disabled', 'disabled');
				$('#featureToggle').removeAttr('disabled');	
				$("#imgQueryPoint").attr("src",'/CA/comm/images/query_point_di.png');
				$("#imgQueryBox").attr("src",'/CA/comm/images/query_box_di.png');
				$("#imgQueryShape").attr("src",'/CA/comm/images/query_shape.png');

				break;
			case "r_m":	// raster
			case "r_d":		
				$('#pointToggle').removeAttr('disabled');	
				$('#boxToggle').removeAttr('disabled');	
				$('#featureToggle').removeAttr('disabled');	
				$("#imgQueryPoint").attr("src",'/CA/comm/images/query_point.png');
				$("#imgQueryBox").attr("src",'/CA/comm/images/query_box.png');
				$("#imgQueryShape").attr("src",'/CA/comm/images/query_shape.png');
				
											
																		
				if ((document.getElementById('shape_select').value!="")&&(document.getElementById('featureToggle').selected==true))
				{		
					// If the layer was a raster and the shape ancillary was not blank value								
					loadDataset(0,0);		
				}				
			break;
		}
		return true;							
	}
	function _verifyNumberOfAvailableLayers(strGwmsLayerDate,mapObj,layerToRemove){

		var blnExit=true;			
		// verify if it is an ancillary dataset
		for(var i = 0;  i < arrayGDatasetAncillary.length; i++) 
		{
			if (arrayGDatasetAncillary[i]["value"]==strGwmsLayerDate)	blnExit=false;
		}
		
		// if not verify with already loaded
		if (blnExit==true)
		{

			i=0;
			var blnExit=true;
			if (typeof layerToRemove=="undefined")
			{
				layerToRemove='';	
				layerToRemove.name='';	
			}
			while ((i<mapObj.getNumLayers())  && (blnExit==true) )
			{												

				// equal name or equal to layer removed
				if ((strGwmsLayerDate==mapObj.layers[i].name)||(strGwmsLayerDate==layerToRemove.name))
				{					
					blnExit=false;
				}
				i++;
			}
		
		
			if (blnExit==true)
			{
			
				if ((lngGContLayers+1)>arrayGSettings.mViewerMaxLayers)
				{
					var tips = $( ".validateTips" );	
					_displayErrorMsg('You can load maximun '+(arrayGSettings.mViewerMaxLayers)+' datasets.','E');
					// select the last dataset
					var objSel = document.getElementsByClassName("_divDataset_sel")																																			
					var strTempVariable=_returnSpanLayerName(objSel[0].id);
					// reset and select last dataset as Climate Indicator
					_resetAndselectLastDataset(strTempVariable);
					// select last value on graph configuration mask
					addGraphVar(strTempVariable);
					showIndicator(0);
					return false;
				}
				lngGContLayers++;				
			}					
		}				
		return true;
	}
	
	function _resetAndselectLastDataset(strValue){
	
					strGScenarioID='';
					var queryResult = Enumerable.From(arrayGDataset)
					.Where(function (x) { return x.value == strValue})
					.OrderBy(function (x) { return x.label })
					.Select(function (x) { 
					// found it
					// set from-to dates
				
					var i=0;
					var blnFound=false;
					
					while((i<arrayReplaceIndicator.length)&&(blnFound==false))
					{										
						if (arrayReplaceIndicator[i][1]==x.owner)
							blnFound=true;
						else
							i++;
					}
											
					if (blnFound==true)
					{				

						$('#cboOwnerID').val(arrayReplaceIndicator[i][0])
						var strLAbel=x.value;	
	
						var i=0;
						var blnFound=false;
						while((i<arrayGDataset.length)&&(blnFound==false))
						{
						
							if (arrayGDataset[i].value==strLAbel)
							{

								blnFound=true;
								
								_loadVar_Layers("cboLayerID",0);
								document.getElementById("cboScenarioID").disabled=false;
								
								$('#cboLayerID').val(arrayGDataset[i].scenario);																						
								_clearScenario();
								var spltemp=arrayGDataset[i].scenario.split("REPLACESCENARIO");	
								strGScenarioID=strLAbel.substr(spltemp[0].length,strLAbel.length-spltemp[1].length-spltemp[0].length);	
								
								_addLayer(arrayGDataset[i].scenario);
								
								
								
								
							}
							else
								i++;
						}														
					}
					else
					{
						// select the corresponding value for owner
						
						$('#cboOwnerID').val(x.owner)
						// load all layer'combo values
						_loadVar_Layers("cboLayerID",0);
						// select the corresponding value for layer
						$('#cboLayerID').val(x.value)					
						// clear the scenario
						_clearScenario();
					}
					
					return "" })
					.ToArray();			
	}
//--------------------------------------------------	
//--------------------------------------------------
// On load start event
//--------------------------------------------------
	function onloadstart(evt) {								
	
		showIndicator(1);
	}
//--------------------------------------------------
//--------------------------------------------------
// On load end event
//--------------------------------------------------
	function onloadend(evt) {				
		showIndicator(0);
	}	
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to load a spocific dataset date format.		*/
//------------------------------------------------------------------
//------------------------------------------------------------------	
	
	function _changeDateFormat(strGwmsLayer,strDateWMS){
		var strFormatDate="";
		
		if (arrayGDataset=='')
		{	
			
			
			var url='/cgi-bin/python/_returnDatasetFieldID.py?strReturn='+strGwmsLayer+'&strType=DATASET&blnOnlyValues=0'
			$.ajax({    
			url : url,    
			type: "GET",    		
			dataType: "json",	
			async: false,
			success: function(response, textStatus, jqXHR)    
			{     							

				arrayDataset=response.data[0];
				strFormatDate=arrayDataset.dateFormat;
				//showIndicator(0);
				
				return '';
			},    
			
			error: function (jqXHR, textStatus, errorThrown){     

			}});		

		}
		else
		{
		
			for (var i=0;i<arrayGDataset.length;i++) {						
				if (arrayGDataset[i].value==strGwmsLayer)
					strFormatDate=arrayGDataset[i].dateFormat;			
			}
		}
		// example of available data format
		switch(strFormatDate){
			// default
			case "YYYYMMDD":
			break;
			// change the value of the date
			case "YYYY-MM":
				var arrayV=strDateWMS.split("-");
				var strTDate=new Date(arrayV[0], arrayV[1], 1);
				var strTemp=String(strTDate.getFullYear())+'-';
				var strTempM=String('0'+strTDate.getMonth());
				strTempM.substr(strTempM.length-2);				
				strDateWMS=strTemp+strTempM;				
			break;
			default:
			break;
		}
		return strDateWMS;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to clean all fields at the startup.			  */
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function clearFields(){

		//$("#pointToggle").click();		
		$("#txtLat").val("");
		$("#txtLon").val("");
		$("#txtFLat").val("");				
		$("#txtFLon").val("");
		$("#txtFSelectedValue").val("");
		$("#txtULat").val("");
		$("#txtLLat").val("");
		$("#txtRLon").val("");
		$("#txtLLon").val("");

		$("#txtSetMinValueGraphY1").val("");
		$("#txtSetMaxValueGraphY1").val("");
		$("#txtSetMinValueGraphY2").val("");
		$("#txtSetMaxValueGraphY2").val("");
				
		document.getElementById('moveToggle').checked = true;
		
		$('#pointToggle').attr('disabled', 'disabled');
		$('#boxToggle').attr('disabled', 'disabled');
		$('#featureToggle').attr('disabled', 'disabled');
		$('#shape_select').attr('disabled', 'disabled');
															
		document.getElementById('cboLayerID').selectedIndex =0;
		document.getElementById('dialog-delete').className ="DivShow";
		
		$("#strTypeVar").val("");
		
		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Remove from the span name the syntax in order to obtain the 
dataset name.*/
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function _returnSpanLayerName(strLayer){
	
		var strTemp="span_";		
		var pos=strLayer.indexOf(strTemp)
		var strVarTemp='';
		if (pos!=-1)				
			strLayer=strLayer.substr(strTemp.length)
			
		// if the scenario combo is loaded, change the value from the label
		strScenario=document.getElementById('cboScenarioID').value;	
		if (strScenario!="")	strLayer=strLayer.replace("REPLACESCENARIO",strScenario,"g"); 		
			
		return strLayer;
	
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to remove a layer from the layers list. 	      */
/* input parameters: layer name, string						      */
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function _removeLayer(layerName){
		layerName=_returnSpanLayerName(layerName);
		
		i=0;
		var blnExit=0;
		while ((i<mapObj.getNumLayers())  && (blnExit==0) )
		{			
			// layer name
			if (layerName==mapObj.layers[i].name)
			{
				var layerToRemove=mapObj.getLayer(mapObj.layers[i].id);	
				// remove it
		
				mapObj.removeLayer(layerToRemove);
				
				blnExit=1;
				// counter for the maximum number of layers loaded at the save time
								
				// verify if it is an ancillary dataset
				
				for(var i = 0;  i < arrayGDatasetAncillary.length; i++) 
				{
					if (arrayGDatasetAncillary[i]["value"]==layerName)	blnExit=0;
				}				
				// different fron ancillary dataset
				if ((blnExit==1)&&(layerName!="shape"))
				{				
					switch(layerName){
						case "shape":
						case "shape":
						case "shapecontour":
						break;
						default:
							lngGContLayers--;										
						break;
					}										
				}
				
			}
			i++;
		}
		return true;								
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to select a polygon from the map				  */
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function _createPolygon(values,strFromProj){
		if (values!="")
		{
			var arrayPoints=values.split(" ");
			var points=new Array();
			
			var projFrom = new OpenLayers.Projection(strFromProj);			
			var projTo = mapObj.getProjectionObject();
			
			for(var i = 0;  i < arrayPoints.length; i++) 
			{
				var arrayTemp=arrayPoints[i].split(",");				
				points[i]=new OpenLayers.Geometry.Point(arrayTemp[0],arrayTemp[1]);
				if (strFromProj!=mapObj.getProjectionObject())
				{
					points[i].transform(projFrom,projTo);
				}
			}
			// add a new vector
			
			//var projTo = new OpenLayers.Projection("EPSG:900913");

			var vector = new OpenLayers.Layer.Vector('shapecontour', {'styleMap': polygonStyle});
			vector.addFeatures(
				new OpenLayers.Feature.Vector(
					new OpenLayers.Geometry.LinearRing(points),
					null,
					polygonStyle
				)
			); 
			
			return vector;
		}
		return "";
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to select a polygon when the user selects a 
shapefile. */
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function selectShapePolygon(blnGeometry,blnOpenGraphConf){
		
		// remove the contour
		_removeLayer("shapecontour");
		var blnAdd=false;
		
		if($('#draggable_querybyshape').css('display')=="block")
		{		
			if (blnGLoadFromAncillary==true)
			{				
				document.getElementById("shape_select").disabled=false;
			}
			if((document.getElementById("shape_select").disabled==false))
			{
				// return the geometry from the shapefile
				if (blnGeometry==1)		returnGeometry($('#txtFLat').val(),$('#txtFLon').val(),$('#shape_select').val(),'',blnOpenGraphConf);				
				
			}
			else
			{	
			
				if ($('#txtFLat').val()!="" && $('#txtFLon').val()!="")
				{				
					// Return the geometry for the selected point from the ancillary selected
					var strDateWMS = $('#year_select').val();
					if (document.getElementById('date_select').value!="")
						strDateWMS +='-'+$('#date_select').val();							
					// return the geometry from the shapefile
					if (blnGeometry==1)		returnGeometry($('#txtFLat').val(),$('#txtFLon').val(),$('#shape_select').val(),strDateWMS,blnOpenGraphConf);					
				}					
			}			
		}		
		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Return a geometry for a specific x/y point and colour it on the map.*/
//------------------------------------------------------------------
//------------------------------------------------------------------	
	var vector="";
	function returnGeometry(lat,lon,layerCrop,strDate,blnOpenGraphConf){
			
		showIndicator(1);
		// more info
		//http://www.gistutor.com/openlayers/12-intermediate-openlayers-tutorials/40-styling-and-labeling-vector-layers-in-openlayers.html
		if (lat!="")
		{
			if (layerCrop!="")
			{
				//showIndicator(1);
				//showIndicator(1);
				if (typeof strDate=="undefined")			  strDate='';	


				var url='/cgi-bin/python/_returnGeometry.py?lat='+lat+'&lon='+lon+"&layerCrop="+layerCrop+"&crs="+toGProj+"&strDate="+strDate;	
alert(url);				
				$.ajax({    
				url : url,    
				type: "GET",    						
				async: false,
				success: function(response, textStatus, jqXHR)    
				{   
					showIndicator(0);					
					
					if (response.result=="1")
					{			
						//showIndicator(0);					
						$('#txtFSelectedValue').val(response.id)						
						if (trim(response.label)=="")			
							$('#txtFSelectedName').html("Result: ")							
						else
							$('#txtFSelectedName').html(response.label)														

						var blnAdd=false;				
						
						if (response.geometry!="")
						{
							blnAdd=true;
							// create the polygon					
							
							vector=_createPolygon(response.geometry,response.projection)																		
							if (blnOpenGraphConf==1)
							{
								// add new functionality to open directly the graph		
								_returnDateFromTo("");
								// open Graph configuration dialog
								$( "#dialog_configureGraphParams" ).dialog("open");	
								
								// change the description of the graph when the selected dataset is a shapefile
								var strAdd='(lat: '+$("#txtFLat").val()+', lon: '+$("#txtFLon").val()+')'											
								$('#spanGQueryBy').html(strGDefaultShapeDescription);
								$('#spanGQueryBy_params').html(strGDefaultShapeDescription+strAdd);
								
								// configure Graph
								_configureGraph(1,0,0);
								// submit Graph							
								submitGraph();
							}
						}				
						// remove the layer											
						
						// add the new one
						if (blnAdd==true)
						{
							if (vector!="")			
							{			
								_removeLayer("shapecontour")
								// add the new one
								vector.setZIndex( 110 ); 
								mapObj.addLayer(vector);		
							}
						}
						//else
						//	_removeLayer("shapecontour")
					}						
					else 
					{
						_removeLayer("shapecontour")
						_displayErrorMsg(response.error,'E');
					}
					//showIndicator(0);
					
					return '';
				},    
				
				error: function (jqXHR, textStatus, errorThrown){     							
					showIndicator(0);
				}});						
			}
		}			
		showIndicator(0);		
		return true;	
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to open the dialog for the tool selected.	      */
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function openQueryDialog(strValue){
		//showIndicator(1);
		_clearAll("selVarY2_unsel");
		
		//document.getElementById("spanValidateTips").innerHTML="&nbsp;";
		$("#draggable_querybypoint").css("display", "none");
		$("#draggable_querybybox").css("display", "none");
		$("#draggable_querybyshape").css("display", "none");

		$("#imgQueryPoint").attr("src",'/CA/comm/images/query_point.png');
		$("#imgQueryBox").attr("src",'/CA/comm/images/query_box.png');
		$("#imgQueryShape").attr("src",'/CA/comm/images/query_shape.png');
		$("#imgQueryMove").attr("src",'/CA/comm/images/move.png');
		
		$('#shape_select').attr('disabled', 'disabled');		
		// POINT
		
		if (strValue=="P")
		{			
			// change the image only if the radio is enabled
			if (document.getElementById('pointToggle').disabled==false)
			{
				$("#imgQueryPoint").attr("src",'/CA/comm/images/query_point_on.png');
				
				// remove the box from the map
				boxLayerObj.removeAllFeatures();
				if(vector!="")		vector.removeAllFeatures(vector.features[0]);

				showHideLayer("","shape");
				$("#draggable_querybypoint").css("display", "block");

				
				$("#spanQueryByType").html("point");				
				//selectPointPolygon();
			}
		}
		else
		{	
			// BOX
			if (strValue=="B")
			{
				// change the image only if the radio is enabled
				if (document.getElementById('boxToggle').disabled==false)
				{			
					$("#imgQueryBox").attr("src",'/CA/comm/images/query_box_on.png');
					
					// remove the point from the map
					pointLayerObj.removeFeatures(pointLayerObj.features[0]);		
					if(vector!="")		vector.removeAllFeatures(vector.features[0]);
				
					showHideLayer("","shape");
					$("#draggable_querybybox").css("display", "block");
					
					$("#spanQueryByType").html("box");					
					//selectBoxPolygon();
				}
			}
			else
			{
				if (strValue=="S")
				{		
					// change the image only if the radio is enabled
					if (document.getElementById('featureToggle').disabled==false)
					{					
						if (blnEnabledGRaster==true)
							$('#shape_select').removeAttr('disabled');												
						else
							$('#shape_select').attr('disabled', 'disabled');						
						$("#imgQueryShape").attr("src",'/CA/comm/images/query_shape_on.png');
						
						// remove point and box from the map
						pointLayerObj.removeFeatures(pointLayerObj.features[0]);
						boxLayerObj.removeAllFeatures();									
							
						var form = $('#myForm');
						var checkedValue = form.find('input[name=type]:checked').val();										
						// SHAPE						
						showHideLayer("","shape",true);
						
						$("#draggable_querybyshape").css("display", "block");
						
						$("#spanQueryByType").html("geographical area");						
						
						// clear shape values
						/*
						$('#txtFLat').val('');
						$('#txtFLon').val('');						
						$('#txtFSelectedValue').val('');
						*/
						if(document.getElementById('pointToggle').disabled==false)
							var strVar=document.getElementById("shape_select").options[document.getElementById("shape_select").selectedIndex].text;	
						else
							var strVar=document.getElementById("cboLayerID").options[document.getElementById("cboLayerID").selectedIndex].text;	
						$('#txtFSelectedName').html(strVar);
						
						
						// remove the layer
						//_removeLayer("shapecontour");
						// select shape polygon
						if (($('#txtFLat').val()!="") && ($('#txtFLon').val()!=""))
						{
							selectShapePolygon(1,0);
						}
						else
							selectShapePolygon(0,1);
												
					}
				}
				else
				{
					showHideLayer("","shape");
					$("#imgQueryMove").attr("src",'/CA/comm/images/move_on.png');
					
					pointLayerObj.removeFeatures(pointLayerObj.features[0]);
					boxLayerObj.removeAllFeatures();
					$("#spanQueryByType").html("");										
					if(vector!="")		vector.removeAllFeatures(vector.features[0]);
				}
			}
		}
		//showIndicator(0);
		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to initialize an ajax object using jquery		  */
//------------------------------------------------------------------
//------------------------------------------------------------------
	function createAjaxObj(strUrl,strMethod,strParams,blnSync){
	
		var strAjaxReturn='';
		$.ajax({    
		url : strUrl,    
		type: strMethod,  
		data: strParams,		
		async: blnSync,
		success: function(data, textStatus, jqXHR)    
		{     					
			strAjaxReturn=data;
			return strAjaxReturn;
		},    		
		error: function (jqXHR, textStatus, errorThrown){     
		}});
		// return
		return strAjaxReturn;	
	}

//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to antivate/deactivate the tool into the map. 	  */
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function toggleControl(value,checked,disabled) {		
		
		for(key in drawControls) {			
			control = drawControls[key];							
			
			if(value == key && checked && disabled==false) {											
				// if value is the same and the radio is checked and enabled (hidden)
				control.activate();	
			} else {
				control.deactivate();
			}			
		}		
		pointLayerObj.setZIndex( 1000 ); 		
		boxLayerObj.setZIndex( 1001 ); 		 
		shapeLayerObj.setZIndex( 1002 ); 	
		
		return true;
	}	

//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to configure the date time selction for layers list.
*/
//------------------------------------------------------------------
//------------------------------------------------------------------
 function changeDateSelect_forDataset(strType,strDateList,dateFrom,dateTo,strInterval){
	
		var fromY='';
		var toY='';
		if (dateFrom!="")			fromY=dateFrom.getFullYear();		
		if (dateFrom!="")			toY=dateTo.getFullYear();
		
		var arrayDate=strDateList.split("_");

		switch(strType){
			case 'TIMES':
				return;
				var yearSObj=document.getElementById('year_start');				
				var yearEObj=document.getElementById('year_end');		
				yearSObj.options.length = 0;
				yearEObj.options.length = 0;	
				if (toY!='')
				{
					for (i=fromY;i<=toY;i++)	
					{							
						yearSObj.options[yearSObj.options.length]=new Option(i,i);
						yearEObj.options[yearEObj.options.length]=new Option(i,i);
					}
				}
			break;
			case 'YEAR':
				var yearObj=document.getElementById('year_select');
				var dateObj=document.getElementById('date_select');
				yearObj.options.length = 0;
				dateObj.options.length = 0;
				if (strDateList=="")	dateObj.options[dateObj.options.length]=new Option('01-01','');
				
				for (var i=0;i<arrayDate.length;i++)
				{
				
					if (arrayDate[i]!="")
					{
						
						var arrayTemp=arrayDate[i].split("-");	
						if (arrayTemp.length>=2)
							dateObj.options[dateObj.options.length]=new Option(arrayTemp[1]+'-'+arrayTemp[2].substr(0,2),arrayTemp[1]+'-'+arrayTemp[2].substr(0,2));
					}
				}
				if (fromY!="" && toY!="")
				{
				
					var lngIncr=1;
					if (strInterval=="10y")
						lngIncr=10;
					for (i=fromY;i<=toY;i=lngIncr+i)						
					{
						yearObj.options[yearObj.options.length]=new Option(i,i);
					}
				}
		
			break;
			case 'YEARDAY_SPECIAL':
				var yearObj=document.getElementById('year_select');
				var dateObj=document.getElementById('date_select');
				yearObj.options.length = 0;
				dateObj.options.length = 0;
					
				dateObj.options[dateObj.options.length]=new Option('01-01','01-01');
				for (var i=0;i<arrayDate.length;i++)
				{
					if (arrayDate[i]!="")
					{
						var d=new Date(arrayDate[i].substr(0,4),arrayDate[i].substr(4,2)-1,arrayDate[i].substr(6,2));
						
																
						var curr_day = d.getDate();		
						var curr_month = eval(d.getMonth());																		
						var curr_year = eval(d.getFullYear());																			

						yearObj.options[yearObj.options.length]=new Option(curr_year,arrayDate[i].substr(0,4));
					}
				}

		
			break;				
			case 'YEAR_SPECIAL':
				var yearObj=document.getElementById('year_select');
				var dateObj=document.getElementById('date_select');
				yearObj.options.length = 0;
				dateObj.options.length = 0;
					
				for (var i=0;i<arrayDate.length;i++)
				{
					
					if (arrayDate[i]!="")
					{
						if (arrayDate[i].substr(4,2)=="")
							var d=new Date(arrayDate[i].substr(0,4),1,1);
						else
							var d=new Date(arrayDate[i].substr(0,4),arrayDate[i].substr(4,2)-1,arrayDate[i].substr(6,2));
						
																
						var curr_day = d.getDate();		
						var curr_month = eval(d.getMonth());																		
						var curr_year = eval(d.getFullYear());																			

						yearObj.options[yearObj.options.length]=new Option(curr_year,arrayDate[i]);
					}
				}

		
			break;			
		}
		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Split the info returned from OL and return an array with points.*/
//------------------------------------------------------------------
//------------------------------------------------------------------
	function returnArrayLatLon(f){
		var wkt = new OpenLayers.Format.WKT();
		var out = wkt.write(f.feature);					
		var a=new String(out.substr(6));
		a=a.substr(0,a.length-1);
		var arrayTemp=out.split(" ");
		arrayTemp[1]=arrayTemp[1].substr(0,arrayTemp[1].length-1)			
		arrayTemp[0]=arrayTemp[0].substr(6)			
		arrayPoints=_convertLatLon(arrayTemp[0],arrayTemp[1]);

		return arrayPoints;
	}
	
//------------------------------------------------------------------
//------------------------------------------------------------------
/* QUERY BY SHAPE function (when the user select a shape on the map).*/
//------------------------------------------------------------------
//------------------------------------------------------------------
	function queryByShape(f)
	{					
		
		var arrayPoints=returnArrayLatLon(f);
		// x and y
		$("#txtFLon").val(parseFloat(arrayPoints[1]).toFixed(arrayGSettings.mViewernumDPlaces));
		$("#txtFLat").val(parseFloat(arrayPoints[0]).toFixed(arrayGSettings.mViewernumDPlaces));

		// load the shape on the map		
		selectShapePolygon(1,1);		
		
		// return National links
		loadNationalLinks(arrayPoints[0],arrayPoints[1]);		

		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* QUERY BY POINT function (when the user select a point on the map).*/
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function queryByPoint(f)
	{			
		// split lat long info
		var arrayPoints=returnArrayLatLon(f);	
				
		if ($("#txtLat_deg").html()=="")	$("#txtLat_deg").html("&deg;&nbsp;");
		if ($("#txtLat_label").html()=="")	$("#txtLat_label").html("Latitude&nbsp;");
		if ($("#txtLon_label").html()=="")	$("#txtLon_label").html("Longitude&nbsp;");
		// set values
		$("#txtLon").val(arrayPoints[1].toFixed(arrayGSettings.mViewernumDPlaces))
		$("#txtLat").val(arrayPoints[0].toFixed(arrayGSettings.mViewernumDPlaces))
		// return national links
		loadNationalLinks(arrayPoints[0],arrayPoints[1]);
		
		// add new functionality to open directly the graph
		
		_returnDateFromTo("");
		$( "#dialog_configureGraphParams" ).dialog("open");	
		// configure 
		_configureGraph(1,0,0);		
		// submit the graph
		submitGraph();
		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* QUERY BY BOX function (when the user select a box on the map).*/
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function queryByBox(f)
	{	
			
			var wkt = new OpenLayers.Format.WKT();
			var out = wkt.write(f.feature);									
			var strTemp=new String(out.substr(9));												
			strTemp=strTemp.substr(0,strTemp.length-2);
			var arrayPoints=strTemp.split(",");
			var arrayUL=arrayPoints[0].split(" ");	//long lat
			var arrayLR=arrayPoints[2].split(" ");				

			if ($("#txtULat_deg").html()=="")	$("#txtULat_deg").html("&deg;&nbsp;");
			if ($("#txtLLat_deg").html()=="")	$("#txtLLat_deg").html("&deg;&nbsp;");
			if ($("#txtLLon_deg").html()=="")	$("#txtLLon_deg").html("&deg;&nbsp;");
			if ($("#txtRLon_deg").html()=="")	$("#txtRLon_deg").html("&deg;&nbsp;");

			if ($("#txtULat_label").html()=="")	$("#txtULat_label").html("N Lat&nbsp;");
			if ($("#txtLLat_label").html()=="")	$("#txtLLat_label").html("S Lat&nbsp;");
			if ($("#txtLLon_label").html()=="")	$("#txtLLon_label").html("W Lon&nbsp;");
			if ($("#txtRLon_label").html()=="")	$("#txtRLon_label").html("E Lon&nbsp;");
			
			var b=new String(arrayUL);	
			var arrayTemp=b.split(",");
			arrayPoints=_convertLatLon(arrayTemp[0],arrayTemp[1]);
			$("#txtLLat").val(arrayPoints[0].toFixed(arrayGSettings.mViewernumDPlaces));
			$("#txtLLon").val(arrayPoints[1].toFixed(arrayGSettings.mViewernumDPlaces));
			
			var c=new String(arrayLR);	
			var arrayTemp=c.split(",");
			arrayPoints=_convertLatLon(arrayTemp[0],arrayTemp[1]);								
			$("#txtULat").val(arrayPoints[0].toFixed(arrayGSettings.mViewernumDPlaces));
			$("#txtRLon").val(arrayPoints[1].toFixed(arrayGSettings.mViewernumDPlaces));
			
			// return national links
			loadNationalLinks($("#txtULat").val(),$("#txtRLon").val());
		
			// add new functionality to open directly the graph
			_returnDateFromTo("");
			$( "#dialog_configureGraphParams" ).dialog("open");	
			// configure
			_configureGraph(1,0,0);
			// submit the graph
			submitGraph();
	}		
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to convert latitude and longitude values from EPSG 	
   4326 to 3857 (bing map).
   Input parameters: lat and lon values
 */
//------------------------------------------------------------------
//------------------------------------------------------------------		
	function convert3857(lat,lon) {
  
		latNew = 180 * lat / (6378137 * Math.PI);
		lonNew = 360 * Math.atan(
		Math.exp(lon / 6378137)) / Math.PI - 90;
		var output=new Array();
		output[0]=lonNew;
		output[1]=latNew;
		return output; 	
  }
//------------------------------------------------------------------
//------------------------------------------------------------------	
/* Function used to convert a value from a projection to another one.*/
//------------------------------------------------------------------
//------------------------------------------------------------------	  	
	function _convertLatLon(lat,lon){
		var arrayReturn = new Array();
		// verify if the input projection is different from output projection
		if (fromGProj!=toGProj)
		{
			// specified funcion for 300913 projection
			if (toGProj=="EPSG:900913")
				arrayReturn=convert3857(lat,lon);
			else			
			{
				// convert values
				var toProjection = new OpenLayers.Projection(toGProj);   
				var fromProjection   = new OpenLayers.Projection(fromGProj); 
				var position   = new OpenLayers.LonLat(lon,lat).transform( mapObj.getProjectionObject(),fromProjection);						
				var strTemp=new String(position);
				
				var arrayPoints=strTemp.split(",");

				arrayReturn[0]=arrayPoints[0].substr(4); 				
				arrayReturn[1]=arrayPoints[1].substr(4); 				
			}
		}
		else
		{
			arrayReturn[0]=lon;
			arrayReturn[1]=lat;
		}
		return arrayReturn;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------	
/* Function used to create an ajax istance in order to initialize the 
   CSV (comma separated values) file.							  */
//------------------------------------------------------------------
//------------------------------------------------------------------
	function _returnFilenameCSV(postData){
		// filename
		var url="/cgi-bin/python/_returnCSV.py";		

		var arrayCSV='';
		$.ajax({    
			url : url,    
			type: "POST",    
			data: JSON.stringify(postData),
			dataType: "json",	
			async: false,
			success: function(data, textStatus, jqXHR)    
			{     				
				arrayCSV=data;					
				return '';
			},    
			
			error: function (jqXHR, textStatus, errorThrown){     
			}
		});
		return arrayCSV;
	}

//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to initialize a counter in order to refresh the graph 
	everfy n milleseconds. 										*/
//------------------------------------------------------------------
//------------------------------------------------------------------
	function startInterval(strFile){
		objGInterval=setInterval(function() {			
				updateGraph(strFile);				
			}, arrayGSettings.refreshMs
		);	
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function enDisConfigurationGraphInput(blnEn){
	
		if (blnEn==1)
		{
			$("#chkSD").removeAttr("disabled"); 	
			$("#selVarY1").removeAttr("disabled"); 		
			$("#selVarY1_list").removeAttr("disabled"); 		
			$("#selVarY2").removeAttr("disabled"); 		
			$("#selVarY2_list").removeAttr("disabled"); 		
			$("#dateFrom").removeAttr("disabled"); 		
			$("#dateTo").removeAttr("disabled"); 		
			$("#buttonSubmitGraph").removeAttr("disabled"); 			
			$("#btnSubmitGraph").removeAttr("disabled"); 			
		}
		else
		{
			$("#chkSD").attr("disabled", "disabled"); 
			$("#selVarY1").attr("disabled", "disabled"); 
			$("#selVarY1_list").attr("disabled", "disabled"); 
			$("#selVarY2").attr("disabled", "disabled"); 
			$("#selVarY2_list").attr("disabled", "disabled"); 
			$("#dateFrom").attr("disabled", "disabled"); 
			$("#dateTo").attr("disabled", "disabled"); 			
			$("#buttonSubmitGraph").attr("disabled", "disabled"); 		
			$("#btnSubmitGraph").attr("disabled", "disabled"); 		
			
		}
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to stop the cration of the graph.			      */
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function _stopGraph(){
		
		enDisConfigurationGraphInput(1);
		// reload the graph
		_reloadGraph();
		if (reqAjax!="")		
		{
			// abort the ajax request
			reqAjax.abort()			
			// clear the interval
			clearInterval(objGInterval); 
			// pdf to graph section
			_setTextExportGraphSection('PDF');					
		}		
	}
//------------------------------------------------------------------
//------------------------------------------------------------------	
/* Function loads when the user submit a graph request.		      */
//------------------------------------------------------------------
//------------------------------------------------------------------	
	var postData = {};	
	function _execQuery(strType){
		
		arrayGCSV=new Array();
		// Clear the legend
		$("#status").html("");		
		
		showIndicatorG(1);
		if (reqAjax!="")	reqAjax.abort()	
		// Set mouse on loading
		
		_setTextExportGraphSection("LOAD");
		// Set a boolean to retrieve the deviation
		var blnDeviation=0;
		if (document.getElementById('chkSD').checked)		 blnDeviation=1;

		// Date from and to
		var arrayDateFrom=document.getElementById('dateFrom').value.split('/');										
		var arrayDateTo=document.getElementById('dateTo').value.split('/');			
		
		// Params
		postData = {};		
		postData["layerCrop"]="";
		postData["shapeInfo"]="";
		if (strType=="POINT")
		{
			if (((blnGFoundVectorY1==1 || blnGFoundVectorY2==1))&& (document.getElementById("spanGQueryBy").innerHTML==strGDefaultShapeDescription))
				postData["shapeInfo"]="selection";
						
			postData["txtRLon"]=$("#txtLon").val();
			postData["txtULat"]=$("#txtLat").val();
			postData["txtLLon"]=$("#txtLon").val();
			postData["txtLLat"]=$("#txtLat").val();
			
		}
		else
		{
			if (strType=="BOX")
			{
				if (((blnGFoundVectorY1==1 || blnGFoundVectorY2==1))&& (document.getElementById("spanGQueryBy").innerHTML==strGDefaultShapeDescription))
					postData["shapeInfo"]="selection";
			
				postData["txtRLon"]=$("#txtRLon").val();
				postData["txtULat"]=$("#txtULat").val();
				postData["txtLLon"]=$("#txtLLon").val();
				postData["txtLLat"]=$("#txtLLat").val();
			}
			else
			{
				postData["txtRLon"]=$("#txtFLon").val();
				postData["txtULat"]=$("#txtFLat").val();
				postData["txtLLon"]=$("#txtFLon").val();
				postData["txtLLat"]=$("#txtFLat").val();			
				postData["layerCrop"]=$("#shape_select").val();				
				if (document.getElementById("spanGQueryBy").innerHTML==strGDefaultShapeDescription)
					postData["shapeInfo"]="geographical area";
				else
					postData["shapeInfo"]=$("#spanGQueryBy").html()+' '+$("#spanGQueryBy_params").html();			
			}		
		}
		// verify the spatial selection
		if ((postData["txtRLon"]=="")||(postData["txtLLon"]=="")||(postData["txtULat"]=="")||(postData["txtLLat"]==""))
		{
			_displayErrorMsg("Select a valid spatial selection.",'E')
		}
		postData["vars1"]=arrayGVar1
		postData["vars2"]=arrayGVar2
		postData["blnDeviation"]=blnDeviation
		postData["fromYear"]=arrayDateFrom[2]
		postData["toYear"]=arrayDateTo[2]
		postData["fromMonth"]=arrayDateFrom[1]
		postData["toMonth"]=arrayDateTo[1]		
		postData["operation"]=strType;		
		postData["crs"]=toGProj;		
		postData["append"]='0';		
		
		// Initilize the csv file				
		arrayGCSV=_returnFilenameCSV(postData);	
		// set generic settings
		_setTextExportGraphSection('');
				
		// if there is a logarithmic scale, remove the deviation
		if ((arrayGCSV.blnLogaritmicY1==1)||(arrayGCSV.blnLogaritmicY2==1))	postData["blnDeviation"]=0;
		
		// Assign the CSV filename to Json array		
		postData["strCSVFile"]=arrayGCSV.strFilename;
		// launch the process
		_launchPID();

		return true;		
	}

	var blnGProcessActive=false;
	
//------------------------------------------------------------------
//------------------------------------------------------------------	
/* Function used to run a PID. It prevents to stop the PID when there is the 504 gateway error. */
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function _launchPID(){
		// Query the point
		var url="/cgi-bin/python/_execQuery.py";	
		showIndicatorG(1);
		
		blnGProcessActive=true;
		reqAjax=$.ajax({    
			url : url,    
			type: "POST",    
			data: JSON.stringify(postData),
			dataType: "json",			
			//dataType : "jsonp",
			//jsonp : "callback",
			timeout: 60000,	
		
			success: function(response, textStatus, jqXHR)    
			{ 			
				enDisConfigurationGraphInput(1);			
				blnGProcessActive=false;				
				if (response.result==1)
				{								
					// Update the graph
					updateGraph(arrayGCSV.strHttpFilename)												
					// Update PDF and PNG funcionalities
					_setTextExportGraphSection('PDF');					
				}
				else
				{					
					// Alert the error
					_displayErrorMsg(response.error,'E');

				}
				// Clear the timeout
				clearInterval(objGInterval); 	
				// set mouse 
				showIndicatorG(0);
				return response.result;
			},    
			error: function (response, textStatus, errorThrown){     
				enDisConfigurationGraphInput(1);			
				var text = 'Ajax Request Error: ' + 'XMLHTTPRequestObject status: ('+response.status + ', ' + response.statusText+'), ' +
                                                'text status: ('+textStatus+'),error thrown: ('+errorThrown+')';
					
				blnGProcessActive=false;
				// stop the service
				_stopQueryServerSide(postData["strCSVFile"]+'.pid');
				// clear the counter
				clearInterval(objGInterval); 						
												
				if (textStatus=="timeout")
				{
					// timeout
					postData["append"]=1;
					_launchPID();					
				}
				else
				{
					_setTextExportGraphSection('PDF');
					// set the mouser
					showIndicatorG(0);				
				}

			}});		
		// Start the graph configuration
		setGraph(arrayGCSV.strHttpFilename);
		// Start the timeout
		startInterval(arrayGCSV.strHttpFilename);				
		return;
	}
	
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to call a python script on the server machine in 
   order to kill the deamon instance.							  */
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function _stopQueryServerSide(strFile){
		var postData = {};
		postData["strFile"]=strFile;
		
		var url="/cgi-bin/python/_stopQuery.py";				
			
		$.ajax({    
			url : url,    
			type: "POST",    
			data: JSON.stringify(postData),
			dataType: "json",	
			async: true,
			success: function(data, textStatus, jqXHR)    
			{     					
				//arrayGCSV=data;	
				blnGProcessActive=false;				
				return '';
			},    
			
			error: function (jqXHR, textStatus, errorThrown){     
			}
		});
		return "";	
	}
//------------------------------------------------------------------
//------------------------------------------------------------------	
//------------------------------------------------------------------
//------------------------------------------------------------------	
function returnNumofCheckbox(blnReturnEnabled){	
	if ( document.getElementById("chkDataset")==null)
	{		
		lngCont=0;
	}
	else
	{
		av=document.getElementsByName("chkDataset");
		lngCont=av.length;
	}
	if (typeof blnReturnEnabled=="undefined")
	{
		blnReturnEnabled=false;
	}	
	if (blnReturnEnabled==true)
	{

		lngEnabledCont=0
		for (i=0;i<lngCont;i++)	
		{			
				blnEnabled=false;
				blnEnabled=av[i].checked;
				
				if (blnEnabled===true)		lngEnabledCont++;
		}
		return lngEnabledCont;
	}
	else		
		return lngCont;
}
//------------------------------------------------------------------
//------------------------------------------------------------------	
// Set to show/hidden each layer loaded.
//------------------------------------------------------------------
//------------------------------------------------------------------
	function showHideLayer(objSel,strDataset,blnSet){
		
		if (typeof blnSet=="undefined")	var blnSet=false;
		var blnCheckbox=true;
		if (objSel=='')	blnCheckbox=false;
		
		i=0;
		var blnExit=false;

		while ((i<mapObj.getNumLayers())  && (blnExit==false) )
		{			
			if (strDataset==mapObj.layers[i].name)
			{						
				blnExit=true;																														
				var layerToShowHide=mapObj.getLayer(mapObj.layers[i].id);		
			}
			else
				i++;
		}
		if (blnExit==false)
		{
			if (document.getElementById('shape_select').disabled==false)
			{							
				loadDataset(0,0,'',0,1);													
			}
			return true;
		}
		else
		{		
			if (blnCheckbox==true)
			{			
				if (blnExit==true){					
					layerToShowHide.setVisibility(objSel.checked)
				}
			}
			else
			{			
				if (blnExit==true)
				{
					layerToShowHide.setVisibility(blnSet)					
				}
			}
		}	
		return true;	
	}
//------------------------------------------------------------------
//------------------------------------------------------------------	
// Add a layer
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function _addLayer(strValue,blnSortable){
		
		showIndicator(1);
		if (typeof strValue=="undefined")		strValue='';
		if (typeof blnSortable=="undefined")	blnSortable=0;
		// Load Dataset		
		result=loadDataset(0,1,strValue,blnSortable);				
		if (result===true)
		{		
			// Add dataset to layers list
			//addDataset();
			
			if (strValue=="")		strValue=$("#cboLayerID").val();			
			// Add automatically to the graph configuration tab
			
			addGraphVar(strValue);
						
		}
		//showIndicator(0);
		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------	
// Update national links: meteo and country.
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function updateNationalLinks(strMeteo,strNational){
		// split the info returned
					
		if (strNational!="")	$("#span_url_cd_state").html("<a target=_blank href='"+strNational+"'><img title='Country link' src='/CA/comm/images/flag.png'></a>");								
		if (strMeteo!="")		$("#span_url_nat_cl").html("<a target=_blank href='"+strMeteo+"'><img title='National Meteorological link' src='/CA/comm/images/meteo.png'></a>");					
		
	}
//------------------------------------------------------------------
//------------------------------------------------------------------	
// Ajax function that returns national links from x/y selected.
//------------------------------------------------------------------
//------------------------------------------------------------------
	function loadNationalLinks(lat,lon){
		$("#span_url_nat_cl").html("<img src='/CA/comm/images/meteo_dis.png'>");
		$("#span_url_cd_state").html("<img src='/CA/comm/images/flag_dis.png'>");
		
		var url="/cgi-bin/python/_returnNationalLinks.py";		
		var params="lat="+lat+"&lon="+lon;
		var reqSingleAjax=$.ajax({    
			url : url,    
			type: "POST",    
			data : params,    		
			async: true,
			success: function(data, textStatus, jqXHR)    
			{       				
				//data - response from server    				
				if (data.result=="1")	updateNationalLinks(data.meteo, data.national)
			},    
			
			error: function (jqXHR, textStatus, errorThrown){     
			}});
	}
//------------------------------------------------------------------
//------------------------------------------------------------------	
// Open help popup.
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function openHelp(strType){		
		if (typeof(strType)=='undefined')	var strType="";
		myWindow = window.open("/help/home.html","Help","width=800,height=600,scrollbars=yes,resizable=yes");
		
		$( "#txtHelpWhere" ).val(strType);
		myWindow.focus();
		

		if (myWindow == null || typeof(myWindow)=='undefined')
			_displayErrorMsg("Turn off your pop-up blocker!",'W')							
	}	
//------------------------------------------------------------------
//------------------------------------------------------------------	
// Open a popup.
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function openMetadataWin(strHttp){
		myWindow = window.open(strHttp,"Metadata","width=500,height=400,scrollbars=yes,resizable=yes");
		if (myWindow == null || typeof(myWindow)=='undefined')
			_displayErrorMsg("Turn off your pop-up blocker!",'W')							
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function _updatePDFSingleLayer(strVar,strYear,strMonth){
		var pdfLink=document.getElementById('a_'+strVar);
		if ( pdfLink!=null)
			pdfLink.setAttribute("onClick","createPdfMap('"+strVar+"','"+strYear+"','"+strMonth+"');return false;");								
		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
// Function used to retrieve Legend and Metadata link for a layer.
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function _returnLegendeMetadata(strVar,strDate,strID,objToAdd){
		//showIndicator(1);
		var url='/cgi-bin/python/_returnLegendeMetadata.py?coverage='+strVar+"&dateCoverage="+strDate		
		$.ajax({    
			url : url,    
			type: "GET",    		
			async: true,
			success: function(data, textStatus, jqXHR)    
			{     								
				//lngGContLayers++;			
				var strMetadataLink=strGMetadataPath+data.id;
				// label
				var addLabel=document.createElement("label");
				addLabel.innerHTML =  data.description+'&nbsp;&nbsp;'; // Insted of calling setAttribute 					
				// div
				var divLayerOther=document.createElement("div");
				divLayerOther.setAttribute("class",  'div_layer_other');	
				// div
				var divLayerDescr=document.createElement("div");
				divLayerDescr.setAttribute("class",  'div_layer_descr');																				
				divLayerDescr.appendChild(addLabel);// add the description to the element					
				// BR
				var objBr=document.createElement("br");
				divLayerDescr.appendChild(objBr);// add the description to the element						
				// LEGEND
				var strLegendLink=data.legendLink;
				
				if (strLegendLink!="")
				{				
					var imageLegend= document.createElement("img");				
					imageLegend.setAttribute("src", strLegendLink);			
					divLayerDescr.appendChild(imageLegend);// add the description to the element					
				}
				objToAdd.appendChild(divLayerDescr);
				
				// DELETE Link
				var deleteLink=document.createElement("a");
				deleteLink.href =  '#'; // Insted of calling setAttribute 								
				// delete image
				var deleteImg=document.createElement("img");
				deleteImg.setAttribute("src","/CA/comm/images/1391708526_DeleteRed.png");			
				deleteImg.alt =  'Delete'; 			
				deleteLink.setAttribute("onClick", "deleteVariableShow("+'"'+strID+'"'+");return false;");				
				deleteLink.setAttribute("title","Delete dataset from the list");
				deleteLink.appendChild(deleteImg);// add the description to the element				
				// BR
				var objBr=document.createElement("br");
				deleteLink.appendChild(objBr);// add the description to the element						
				divLayerOther.appendChild(deleteLink);// add the description to the element			
				
				// METADATA
				if (strMetadataLink!="")
				{
					var metadataLink=document.createElement("a");										
					metadataLink.href =  strMetadataLink;		
					metadataLink.target =  '_blank'; 
					metadataLink.alt =  'Metadata'; 
					var metadataImg=document.createElement("img");
					metadataImg.setAttribute("src","/CA/comm/images/1391708694_Table_16x16.png");							
					metadataImg.setAttribute("alt","Metadata");							
					metadataImg.setAttribute("title","Show metadata");							
					metadataLink.appendChild(metadataImg);// add the description to the element

					var objBr=document.createElement("br");
					metadataLink.appendChild(objBr);// add the description to the element									
					divLayerOther.appendChild(metadataLink);// add the description to the element				
					
					openMetadataWin(strMetadataLink);										
				}	
				else				
				{
					// disable metadata and pdf
					var metadataImg=document.createElement("img");
					metadataImg.setAttribute("src","/CA/comm/images/dis_1391708694_Table_16x16.png");	
					divLayerOther.appendChild(metadataImg);// add the description to the element
				}										
				objToAdd.appendChild(divLayerOther);// add the description to the element											
				//showIndicator(0);
				return '';
			},    
			
			error: function (jqXHR, textStatus, errorThrown){     
				// BR
				var objBr=document.createElement("br");
				objToAdd.appendChild(objBr);// add the description to the element	
				// DELETE Link
				var deleteLink=document.createElement("a");
				deleteLink.href =  '#'; // Insted of calling setAttribute 								
				var deleteImg=document.createElement("img");
				deleteImg.setAttribute("src","/CA/comm/images/1391708526_DeleteRed.png");			
				deleteImg.alt =  'Delete'; 			
				deleteLink.setAttribute("onClick", "deleteVariableShow("+'"'+strID+'"'+");return false;");				
				deleteLink.appendChild(deleteImg);// add the description to the element				
				objToAdd.appendChild(deleteLink);// add the description to the element		
				// Metadata
				var metadataImg=document.createElement("img");
				metadataImg.setAttribute("src","/CA/comm/images/dis_1391708694_Table_16x16.png");	
				objToAdd.appendChild(metadataImg);// add the description to the element							
				//showIndicator(0);
			}
		});	
		return '';
	}	
//------------------------------------------------------------------
//------------------------------------------------------------------	
// Add dataset to the list.
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function addDataset(lngIDDaseset,strVar){
		
		if (typeof lngIDDaseset=="undefined")
		{
		
			var lngIDDaseset=$("#cboLayerID").val();
			var strVar=document.getElementById("cboLayerID").options[document.getElementById("cboLayerID").selectedIndex].text;		
		}
		if (lngIDDaseset=="")	return true; 
			
		lngCont=returnNumofCheckbox();		
		var blnFound=0;
		if (lngCont>0){	
			av=document.getElementsByName("chkDataset");					
			for (i=0;i<lngCont;i++)	
			{
				if (blnFound==0)
				{					
					strTemp=av[i].value;											
					if(strTemp==lngIDDaseset)	blnFound=1;										
				}
			}
		}		
		if (blnFound==0)
		{	
			// set class to unsel for all checkbox
			var objSel = document.getElementsByClassName("chkDataset_sel")												
			for(i=0; i<objSel.length; i++) objSel[i].className ="chkDataset_unsel";
							
			// Create Span ID used to relaod each layer
			var spanID="span_"+lngIDDaseset;
			
			var divCheck = document.createElement("div");			
			divCheck.setAttribute("class", "div_layer_check");		
						
			// create input checkbox
			var input = document.createElement("input");			
			input.setAttribute("type", "checkbox");		
			input.setAttribute("name", "chkDataset");
			input.setAttribute("class", "chkDataset_sel");
			input.setAttribute("id", "chkDataset");						
			input.setAttribute("value", lngIDDaseset);			
			input.setAttribute("onClick", "showHideLayer(this,"+"'"+lngIDDaseset+"'"+');return true;');			
			input.checked = true;
			input.defaultChecked = true;
			
			divCheck.appendChild(input);
			// Date
			
			var strDateWMS = $('#year_select').val();
			if (document.getElementById('date_select').value!="")
				strDateWMS +='-'+$('#date_select').val();				
			
			// Add a label
			var labelLayer= document.createElement("label");			
			labelLayer.setAttribute("id", "label_"+lngIDDaseset);			
			labelLayer.appendChild(divCheck);   // add the box to the element		
			
			// Ajax call used to retrieve legend and metadata			
			_returnLegendeMetadata(lngIDDaseset,strDateWMS,spanID,labelLayer);

			// unselect all layers
			_resetLayer_sel();			
			
			var addDiv= document.createElement("div");		
			addDiv.setAttribute("id", spanID);				
			addDiv.setAttribute("class", "_divDataset_sel");								
			
			
			addDiv.appendChild(labelLayer)
			strFirstLayer=spanID;
			
			var addbR= document.createElement("BR");		
			addDiv.appendChild(addbR)
				
			// drag and drop
			var addLi= document.createElement("li");	
			addLi.setAttribute("class", "ui-state-default");												
			addLi.setAttribute("id", spanID);				
			addLi.appendChild(addDiv)				
			document.getElementById('ulDatasetLists').insertBefore(addLi,document.getElementById('ulDatasetLists').firstChild);
			addGraphVar(lngIDDaseset);
			
		}
		else
		{
			// DRAG and DROP functionality
			// reset all funcs
			_resetLayer_sel();		
			// set the first DIV element to sel
			var objSel = document.getElementsByClassName("_divDataset")				
			if (objSel.length>0)
			{
				objSel[0].className ="_divDataset_sel";
				
			}
			// change class to unsel for all checkbox		
			var objSel = document.getElementsByClassName("chkDataset_sel")												
			for(i=0; i<objSel.length; i++) objSel[i].className ="chkDataset_unsel";			
			var objSel = document.getElementsByClassName("chkDataset_unsel")		
			// and set the firstone to sel in order to check it
			if (objSel.length>0)	
			{
				objSel[0].className ="chkDataset_sel";			
			}
			var objSel = document.getElementsByClassName("chkDataset_sel")			
			if (objSel.length>0)	
			{
				
				_resetAndselectLastDataset(objSel[0].value);
				addGraphVar(objSel[0].value);
			}
		}
	
		// check the firstone
		var objSel = document.getElementsByClassName("chkDataset_sel")	
		if (objSel.length>0)				objSel[0].checked=true;
		
		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------	
// Function used to return the name of layer selected into the list.
//------------------------------------------------------------------
//------------------------------------------------------------------
	function _resetLayer_sel(){
		var objSel = document.getElementsByClassName("_divDataset_sel")				
		for(i=0; i<objSel.length; i++) {
			var imgs = objSel[i].getElementsByTagName("div");		
			objSel[i].className ="_divDataset";
		}
		return true;			
	}
//------------------------------------------------------------------
//------------------------------------------------------------------	
// Change the style to the datasedt selected.
//------------------------------------------------------------------
//------------------------------------------------------------------	
/*
	function changeSelection(strID){
		
		// Add to the div
		var objSel = document.getElementsByClassName("_divDataset_sel")
		var x = objSel.length;			
		for(i=0; i<objSel.length; i++) 
		{							
			objSel[i].className ="_divDataset";
		}	
		var objSel = document.getElementsByClassName("_divDataset")
		var x = objSel.length;			
		for(i=0; i<objSel.length; i++) 
		{										
			if (objSel[i].id==strID)
			{
				objSel[i].className ="_divDataset_sel";				
				
				addGraphVar(objSel[i].id);
			}
		}				
	
	}
	*/
//------------------------------------------------------------------
//------------------------------------------------------------------	
// Return the first layer name
//------------------------------------------------------------------
//------------------------------------------------------------------	
	function _returnFirstLayerName(strObject){
		var strTemp="";
		var objSel = document.getElementsByClassName(strObject)		
		if (objSel.length>0)			strTemp=objSel[0].id;

		return strTemp;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
// Delete a variable popup.
//------------------------------------------------------------------
//------------------------------------------------------------------		
	function deleteVariableShow(strID){
		// id saved on the textbox when the user select delete button
		$("#txtDeleteVariableID").val(strID);		
		// open a dialog to confirm the operation.
		$( "#dialog-delete" ).dialog("open");			
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
// Delete a variable from the list.
//------------------------------------------------------------------
//------------------------------------------------------------------		
	function deleteVariable(strID){
		if (typeof strID=="undefined")		var strID=$("#txtDeleteVariableID").val();
	
		if (strID!="")
		{
			var d = document.getElementById( strID );
			d.parentNode.removeChild( d ); 
			strID=_returnSpanLayerName(strID);			
						
			// remove the layer from the map
			_removeLayer(strID);
			
		}		
		$("#txtDeleteVariableID").val("");				
		return;
    };

//------------------------------------------------------------------
//------------------------------------------------------------------	
// Show hide the legend
//------------------------------------------------------------------
//------------------------------------------------------------------
	function showhideLegend(strSet){
		
		// to hide legend
		var elements = document.getElementsByClassName("dygraph-legend");				
		for(var i = 0, length = elements.length; i < length; i++) {						
				elements[i].style.display = "none";									
		}			
	}
			
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to trim data.									  */
//------------------------------------------------------------------
//------------------------------------------------------------------
function trim(str) {
	if (typeof str!="undefined")
	{
		str = str.toString();
		var begin = 0;
		var end = str.length - 1;
		while (begin <= end && str.charCodeAt(begin) < 33) { ++begin; }
		while (end > begin && str.charCodeAt(end) < 33) { --end; }
		return str.substr(begin, end - begin + 1);
	}
	else
		return "";
}	
//------------------------------------------------------------------
//------------------------------------------------------------------
// Clear values from the scenario list.
//------------------------------------------------------------------
//------------------------------------------------------------------
function _clearScenario(){
	
	$('#cboScenarioID').prop('options').length = 0;
	$('#cboScenarioID').attr('disabled', 'disabled');
	//alert($('#cboScenarioID').is(':enabled'));
	//$('#id').removeAttr('disabled');	
}
//------------------------------------------------------------------
//------------------------------------------------------------------
// Clear every selection from configuration graph dialog.
//------------------------------------------------------------------
//------------------------------------------------------------------
function _clearAll(strSel){
	
	
	if (strSel=="selVarY1")
	{
		$('#selVarY1_list').prop('options').length = 0
		
		var obj = document.getElementById("selVarY1_list");
		var ogl=obj.getElementsByTagName('optgroup');
		for (var i=ogl.length-1;i>=0;i--)
			obj.removeChild(ogl[i]) 		
	}
	else
	{
		if (strSel=="selVarY2")
		{
			$('#selVarY2_list').prop('options').length = 0
			
			var obj = document.getElementById("selVarY2_list");
			var ogl=obj.getElementsByTagName('optgroup');
			for (var i=ogl.length-1;i>=0;i--)
				obj.removeChild(ogl[i]) 		
		}		
		else
		{
			if (strSel=="selVarY2_unsel")
			{		
				var obj = document.getElementById("selVarY2_list");
				for (var i=obj.length-1;i>=0;i--)
					obj.options[i].selected=false;				
				arrayGVar2=new Array();
			}
			else
			{
				$('#cboLayerID').prop('options').length = 0
				
				var obj = document.getElementById("cboLayerID");
				var ogl=obj.getElementsByTagName('optgroup');
				for (var i=ogl.length-1;i>=0;i--)
					obj.removeChild(ogl[i]) 	
			}					
		}		
	}

}
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
function _loadVar_Layers(strSel,blnFromCombo){

	_clearAll(strSel);
	
	var blnAddEmptyString=0;
	var strSelected=document.getElementById(strSel).value;		
	var blnGraph=0;			
	if (strSel=="selVarY1")
	{
		
		var strName="selVarY1_list";		
		var strSelected=$("#selVarY1").val();		
		blnGraph=1;			
	}
	else
	{
		if (strSel=="selVarY2")
		{
			var strName="selVarY2_list";			
			var strSelected=$("#selVarY2").val();
			blnGraph=1;			
		}
		else
		{
			var strName="cboLayerID";			
			var strSelected=$("#cboOwnerID").val();
			blnGraph=0;			
			blnAddEmptyString=1;
		}
	}	
	var result='';
	if (strSelected!="")	result=_loadFromGroupValues(strName,strSelected,blnAddEmptyString,blnGraph);
	//showIndicator(0);
	if (strSel=="selVarY1")
	{
		if (document.getElementById("selVarY1_list").length>0)	
		{		
			if (blnFromCombo==1)	document.getElementById("selVarY1_list").options[0].selected=true;			
			_setMaximumSelected(document.getElementById("selVarY1_list"),'selVarY1');
		}
	}
	else
	{
		if (document.getElementById("selVarY2_list").length>0)		
		{
			if (blnFromCombo==1)			document.getElementById("selVarY2_list").options[0].selected=true;
			_setMaximumSelected(document.getElementById("selVarY2_list"),'selVarY2');
		}
	}
	return result;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
// Function used to load all dataset into the Climate indicator list.
//------------------------------------------------------------------
//------------------------------------------------------------------
function _loadFromGroupValues(strName,strSelected,blnAddEmptyString,blnGraph){
	var objSelect=document.getElementById(strName);	
	if (typeof blnAddEmptyString=="undefined")	blnAddEmptyString=0
	
	if (blnAddEmptyString==1){
		var addOption= document.createElement("option");	
		addOption.value="";
		addOption.text="";
		objSelect.appendChild(addOption);		
	}
	
	var blnFirstTime=0;
	var blnContinue=false;
	for(i = 0; i < arrayGGroups.length; i++) 	
	{	
		// add opt group option
		var addOption= document.createElement("optgroup");	
		addOption.value=arrayGGroups[i]["groupid"];
		addOption.label=arrayGGroups[i]["grouplabel"];
		
		blnFirstTime=0;
		for(k = 0; k < arrayGDataset.length; k++) 	
		{			
			if ((strSelected=="") || (strSelected==arrayGDataset[k]["owner"]))
			{
				if (arrayGDataset[k]["subgroup"]==arrayGGroups[i]["groupid"])
				{
					if (blnFirstTime==0)
					{
						objSelect.appendChild(addOption);	
						blnFirstTime=1;
					}
					var blnContinue=false;
					if (strSelected==""){
						if (arrayGDataset[k]["enabled"]==1)
							blnContinue=true;
					}
					else
						blnContinue=true;
					if (blnContinue==true)
					{
						// add option
						var addOption= document.createElement("option");	
						addOption.value=arrayGDataset[k]["value"];
						addOption.text=arrayGDataset[k]["label"];
						objSelect.appendChild(addOption);	
					}
				}
			}
		}
	}
	// add empty string
	if (blnAddEmptyString==true)
	{
		objSelect.selectedIndex=0;
		objSelect.setAttribute("onChange","_clearScenario();_addLayer();return false;");
	}
	return;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
/*
function _loadDatasetList(strType){

	var selectY1 = document.getElementById(strType);				
	for(i = 0; i < arrayGGroups.length; i++) 
	{					
		var addOptGroup= document.createElement("optgroup");	
		addOptGroup.value=arrayGGroups[i]["groupid"];
		addOptGroup.label=arrayGGroups[i]["grouplabel"];
		selectY1.appendChild(addOptGroup);
		for(k = 0, length = arrayGGroups[i]["data"].length; k < length; k++) 
		{								
			var addOption= document.createElement("option");	
			addOption.text=arrayGGroups[i]["data"][k]["label"];
			addOption.value=arrayGGroups[i]["data"][k]["value"];
			selectY1.appendChild(addOption);				
		}
	}
	return true;
}
*/
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
function _loadOwnerY_Indicator(strType,arrayData,arrayIndicator,strName){

	var selectY1 = document.getElementById(strType);	
	var addOption= document.createElement("option");	
	addOption.value="";
	addOption.text="";		
	selectY1.appendChild(addOption);	
	for(i = 0;i<arrayIndicator.length; i++) 
	{	
			var addOptGroup= document.createElement("optgroup");	
			
			addOptGroup.value=arrayIndicator[i]["indicator"];
			addOptGroup.label=arrayIndicator[i]["indicator"];		
			selectY1.appendChild(addOptGroup);	
						
			for(k = 0; k < arrayIndicator[i][strName].length; k++) 
			{				
				var addOption= document.createElement("option");	
				addOption.value=arrayIndicator[i][strName][k];
				addOption.text=arrayIndicator[i][strName][k];		
				selectY1.appendChild(addOption);						
			}						
	}
	
	return true;
}

//------------------------------------------------------------------
//------------------------------------------------------------------
// Function used to load all dataset into the list dialog.
//------------------------------------------------------------------
//------------------------------------------------------------------
var strGMetadataLink="";

function _loadLikeLayers(){
	$("#spanVarLoading").html("<img src='/comm/images/ui-anim_basic_16x16.gif'>");	

	var strValue=$("#strTypeVar").val();
	strValue=strValue.toUpperCase();
	
	$("#divVariablesList").html("");	
	
	var strText='<table width=100% id=test border=0 style="border-collapse:collapse;margin-left: 10px;">';	
	var strText='';
	var cont=0;
	//strText+='<table>';
	strText+='<ul class=varsList>';
	var blnContinue=true;
	for(var i=0;i<arrayGDataset.length;i++)
	{
	
		blnContinue=true;
		if (strValue!="")	blnContinue=false;	
		if (arrayGDataset[i]["enabled"]=="1")
		{
			if (blnContinue==false)
			{
				strTemp=arrayGDataset[i]["label"].toUpperCase();		
				pos=strTemp.indexOf(strValue)		
				if (pos!=-1)	blnContinue=true;	
			}
			if (blnContinue==true)		
			{

				// add a new element
				
				strText+="<li>";
				strText+="<a onclick='selectVal("+'"'+arrayGDataset[i]["value"]+'","'+arrayGDataset[i]["label"]+'"'+");return false;' href='#' id=aHrefVariables>"+arrayGDataset[i]["label"];


				if (typeof arrayGDataset[i]["fromDate"]!="undefined")	
					strText+='&nbsp;<i>from '+arrayGDataset[i]["fromDate"].substr(0,10)+' to '+arrayGDataset[i]["toDate"].substr(0,10)+'</i>'
				strText+="</a>";				
				if (typeof arrayGDataset[i]["id"]!="undefined")	
				{				
					strText+="&nbsp;<a id=aHrefVariables_metadata href='"+strGMetadataPath+arrayGDataset[i]["id"]+"' target=_blank>Metadata</a>";
				}	
				strText+="</li>";
				cont++;
			}
		}
	}
	strText+="</ul>";
	// put the text
	$("#divVariablesList").html("<br>&nbsp;&nbsp;&nbsp;Found: "+cont+"<br>"+strText);
	$("#spanVarLoading").html("");
	
	return true;
}
var strSavedFrom="";
//------------------------------------------------------------------
//------------------------------------------------------------------
// Change the maximun date as date into the graph configuration dialog.
//------------------------------------------------------------------
//------------------------------------------------------------------

function _setMaximumSelected(element,strOwner) {
	

	if (strSavedFrom=="")	strSavedFrom=strOwner
	var strSelected=document.getElementById(strOwner).value;	
	var amount=0;
	if (strSelected=="")
		amount=1;
	else
	{
		if (strOwner=='selVarY1')
			amount=arrayGSettings.numY1Dataset;
		else			
			amount=arrayGSettings.numY2Dataset;
	}
		
	var itemsSelected = [];
	var items=[];
	for (var i=0;i<element.options.length;i++) {
		if (element.options[i].value!="")
		{
			if (element.options[i].selected)			itemsSelected[itemsSelected.length]=i;
		}
		else
			element.options[i].selected = false;
	}
	if (itemsSelected.length>amount) 
	{	
		for (i=0;i<element.options.length;i++) {
			element.options[i].selected = false;
		}
		var lngTotal=amount;
		for (i=0;i<amount;i++) {
			element.options[itemsSelected[i]].selected = true;			
		}			
	}
	else
		var lngTotal=itemsSelected.length;
	for (i=0;i<lngTotal;i++) {
		
		items[items.length]=element.options[itemsSelected[i]].value;
	}			
	
	_addToGraph(strOwner,items)
}
var blnGFoundVectorY1=0;
var blnGFoundVectorY2=0;
//------------------------------------------------------------------
//------------------------------------------------------------------
// Add to the configuration graph dialog the corrisponding dataset.
//------------------------------------------------------------------
//------------------------------------------------------------------
function _addToGraph(strType,items){
	var blnShowMessage=$("#dialog_configureGraphParams").dialog( "isOpen" );
	var blnAlreadyChanged=0;
	var selectY = document.getElementById(strType);
	var newArrayData_graph=new Array();			
	if (items.length==0)
	{
		if (strType=="selVarY1")					
			blnGFoundVectorY1=0;
		else
			blnGFoundVectorY2=0;	
	}
	
	for (var i=0;i<items.length;i++) {		
	
		var queryResult = Enumerable.From(arrayGDataset)
		.Where(function (x) { return x.value == items[i]})
		.OrderBy(function (x) { return x.label })
		.Select(function (x) { 	

			newArrayData_graph.push(x);			
			if ((x.datatype == "s_d") || (x.datatype == "s_m"))
			{
				
				// The user selects a shapefile from the list when the selection was made on point or a box.
				if (blnShowMessage==true)		
				{
					_displayErrorMsg('Pay attenation: datasets of Climate Indicator <b>'+x.owner+'</b> are vectors. The query will be done on the area identified by x and y of your spatial selection.','W');
				}

				var form = $('#myForm');
				var checkedValue = form.find('input[name=type]:checked').val();	
					var strAdd='';
					if(checkedValue=="point")	
						strAdd='(lat: '+$("#txtLat").val()+', lon: '+$("#txtLon").val()+')'
					else
					{
						if(checkedValue=="box")		strAdd='(lat: '+$("#txtLLat").val()+', lon: '+$("#txtLLon").val()+')'
						else	
						{							
							strAdd='(lat: '+$("#txtFLat").val()+', lon: '+$("#txtFLon").val()+')'						
							
						}
						
					}
					$("#spanGQueryBy").html(strGDefaultShapeDescription);
					$("#spanGQueryBy_params").html(strGDefaultShapeDescription+strAdd);
	
				
					if (strType=="selVarY1")	
					{
						blnGFoundVectorY1=1;
						strGFoundVectorY1=x.owner;
					}
					else
					{
						blnGFoundVectorY2=1;
						strGFoundVectorY2=x.owner;
					}
					blnAlreadyChanged=1;
			}
			else
			{
				if (strType=="selVarY1")					
				{
					blnGFoundVectorY1=0;
					strGFoundVectorY1=x.owner;
				}
				else
				{
					blnGFoundVectorY2=0;			
					strGFoundVectorY2=x.owner;
				}
			}			
			return true })
		.ToArray();
		
	}
	if (strType=="selVarY1")
		arrayGVar1=newArrayData_graph;
	else
		arrayGVar2=newArrayData_graph;	
	if (blnGFoundVectorY1==1 && blnGFoundVectorY2==1)
	{
		if (blnShowMessage==true)
		{
			if(strGFoundVectorY1!=strGFoundVectorY2)
				_displayErrorMsg('Pay attention: you cannot compare two or more vectors at the same time.','E');
		}
	}
	else
	{
		if (blnGFoundVectorY1==1 || blnGFoundVectorY2==1)	blnAlreadyChanged=1;
		else	blnAlreadyChanged=0;
	}
	_foundMinMaxDate(strType,blnAlreadyChanged);
	return true;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
// Merge minimun and maximun dates of all layers selected and returns the min and the max dates.
//------------------------------------------------------------------
//------------------------------------------------------------------

var strGDateFormat="";
function _foundMinMaxDate(strType,blnAlreadyChanged){
	var strDF="";
	var strDT="";

	for (var i=0;i<arrayGVar1.length;i++) {			
		if (strDF=="")	
		{
			if (typeof arrayGVar1[i].fromDate!="undefined")	strDF=arrayGVar1[i].fromDate
		}
		if (strDT=="")
		{	
			if (typeof arrayGVar1[i].toDate!="undefined")	strDT=arrayGVar1[i].toDate
		}
		if (strDF!="")
		{
			if (strDF>arrayGVar1[i].fromDate)		strDF=arrayGVar1[i].fromDate
		}
		if (strDT!="")
		{		
			if (strDT<arrayGVar1[i].toDate)			strDT=arrayGVar1[i].toDate		
		}
	}
	
	for (var i=0;i<arrayGVar2.length;i++) {			
		if (strDF=="")	
		{
			if (typeof arrayGVar2[i].fromDate!="undefined")	strDF=arrayGVar2[i].fromDate
		}
		if (strDT=="")
		{	
			if (typeof arrayGVar2[i].toDate!="undefined")	strDT=arrayGVar2[i].toDate
		}
		if (strDF!="")
		{
			if (strDF>arrayGVar2[i].fromDate)		strDF=arrayGVar2[i].fromDate
		}
		if (strDT!="")
		{		
			if (strDT<arrayGVar2[i].toDate)			strDT=arrayGVar2[i].toDate		
		}
	}	
	
	
	if (strDF!="")
	{		
		dateGFromGraph=_returnDate(strDF);
		dateGToGraph=_returnDate(strDT);		
	}
	else
	{
		
		
		var strReturnVarValueObj="";
		if (strType=="selVarY1")
			strReturnVarValueObj=document.getElementById("selVarY1_list");
		else
			strReturnVarValueObj=document.getElementById("selVarY2_list");
							
		var blnChangedFromOriginal=false;
		for (var i=strReturnVarValueObj.length-1;i>=0;i--)		
		{	
			if (strReturnVarValueObj[i].selected==true){
				if (strReturnVarValueObj[i].value!=strFirstLayer)
				{
					blnChangedFromOriginal=true;
				}		
			}
		}			
			
		if (blnChangedFromOriginal==true)
		{
			dateGFromGraph="";
			dateGToGraph="";
			for (var i=strReturnVarValueObj.length-1;i>=0;i--)		
			{				
				if (strReturnVarValueObj[i].selected==true){
						
				//showIndicator(1);
				// if the layer dates (min and max) are not savet yet.
								
				var url='/cgi-bin/python/_returnDatasetFieldID.py?strReturn='+strReturnVarValueObj[i].value+'&strType=DATASET&blnOnlyValues=0'
				$.ajax({    
				url : url,    
				type: "GET",    		
				dataType: "json",	
				async: false,
				success: function(response, textStatus, jqXHR)    
				{     			

					arrayDataset=response.data[0];
					dateGFromGraphTemp=_returnDate(arrayDataset.fromDate);					
					dateGToGraphTemp=_returnDate(arrayDataset.toDate);					
					strGDateFormat=arrayDataset.dateFormat;					
					if (dateGFromGraph=="")		
						dateGFromGraph=dateGFromGraphTemp;
					else
					{
						if (dateGFromGraph>dateGFromGraphTemp)	dateGFromGraph=dateGFromGraphTemp;
					}
					if (dateGToGraph=="")		
						dateGToGraph=dateGToGraphTemp;
					else
					{					
						if (dateGToGraph<dateGToGraphTemp)	dateGToGraph=dateGToGraphTemp;
					}
					//showIndicator(0);
					return '';
				},    
				
				error: function (jqXHR, textStatus, errorThrown){     
					//showIndicator(0);
				}});	
				}					
			}
		}
		
	}

	// configure the graph
	_configureGraph(0,1,blnAlreadyChanged);				
}
//------------------------------------------------------------------
//------------------------------------------------------------------
// Function used to return a string for Y1 and Y2 axes with all layers info.
//------------------------------------------------------------------
//------------------------------------------------------------------
/*
function _returnStringDialogInfo(arrayVars){
	var strAdd="";
	
	for (var i=0;i<arrayVars.length;i++) {			
	
		strAdd+="<p>"+parseInt(i+1)+") <b>"+arrayVars[i].label+"</b>";
		if (typeof arrayVars[i].fromDate!="undefined")	
			strAdd+="<br>from: "+arrayVars[i].fromDate;
		else
			strAdd+="<br>from: "+arrayDataset.fromDate;
		if (typeof arrayVars[i].toDate!="undefined")	
			strAdd+="<br>to: "+arrayVars[i].toDate;
		else
			strAdd+="<br>to: "+arrayDataset.toDate;
		if (typeof arrayVars[i].interval!="undefined")	
			strTemp=arrayVars[i].interval;
		else
			strTemp=arrayDataset.interval;
		strAdd+="<br>interval: ";
		switch(strTemp){
			case '10d':
				strAdd+="10 days (01-11-21)"
			break;
			case '15d':
				strAdd+="15 days"
			break;
			case '16d':
				strAdd+="16 days"
			break;
			case '1d':
				strAdd+="1 day"
			break;
			case 'm':
				strAdd+="monthly"
			break;
			case '1y':
				strAdd+="yearly"
			break;
			case '10y':
				strAdd+="10 years"
			break;	
			default:
				if (typeof arrayVars[i].fixedinterval!="undefined")	
					strFixed=arrayVars[i].fixedinterval;
				else
					strFixed=arrayDataset.fixedinterval;
				var arrayTemp=strFixed.split('_');		
				for (var k=0;k<arrayTemp.length;k++) {							
					strAdd+=arrayTemp[k].substr(0,4)+', '
				}								
			break;						
		}	
		strAdd+="<p>"
	}
	return strAdd;
}
*/
//------------------------------------------------------------------
//------------------------------------------------------------------
// Function used to open a dialog with the list of all varibles selected
// for Y1 and Y2 axes with info about each layer (name, date and interval).
//------------------------------------------------------------------
//------------------------------------------------------------------
/*
function createHTMLNode(htmlCode, tooltip) {
    // create html node
    var htmlNode = document.createElement('span');
    htmlNode.innerHTML = htmlCode
    htmlNode.className = 'treehtml';
    htmlNode.setAttribute('title', tooltip);
    return htmlNode;
}
*/
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to return the formatted string about interval.	  */
//------------------------------------------------------------------
//------------------------------------------------------------------
function _returnIntervalFormat(arrayVars){
		
		var strTemp=arrayVars.interval;
		
		var strAdd="Interval: ";
		
		switch(strTemp){
			case '10d':
				strAdd+="10 days (01-11-21)"
			break;
			case '15d':
				strAdd+="15 days"
			break;
			case '16d':
				strAdd+="16 days"
			break;
			case '1d':
				strAdd+="1 day"
			break;
			case '1m':
			case 'm':
				strAdd+="monthly"
			break;
			case '1y':
				strAdd+="yearly"
			break;
			case '10y':
				strAdd+="10 years"
			break;	
			default:
				
				var strFixed=arrayVars.fixedinterval;				
				var arrayTemp=strFixed.split('_');		
				for (var k=0;k<arrayTemp.length;k++) {							
					strAdd+=arrayTemp[k].substr(0,4)+', '
				}								
			break;						
		}					
		return strAdd;
}
//------------------------------------------------------------------
//------------------------------------------------------------------
// Function used to load and initialize the diloag info.
//------------------------------------------------------------------
//------------------------------------------------------------------
function _openDialogInfo(){

	var arrayTempF=document.getElementById('dateFrom').value.split("/");			
	var arrayTempT=document.getElementById('dateTo').value.split("/");			
	lngMin=arrayTempF[2];	
	
	lngMax=arrayTempT[2];	
	
	
	var lngCommonF='';
	var lngCommonT='';
	
	$('#tabsInfo_dates').html('');
		
	var arrayDatesF=new Array();
	var arrayDatesT=new Array();
	// create table
	var objTable=document.createElement('table');
	objTable.setAttribute("class",  'tableInfo_dates');
	objTable.setAttribute("style",  'width: 100%');
	var objTr = document.createElement("tr");	
	objTr.setAttribute("class",  'tableInfo_dates_title');	
	var objTdV = document.createElement("td");
	var strNameV = document.createTextNode("Dataset");	
	objTdV.setAttribute("width",  '25%');	
	objTdV.appendChild(strNameV);		
	objTr.appendChild(objTdV);		
	var objTdF = document.createElement("td");
	var strNameF = document.createTextNode("From");	
	objTdF.appendChild(strNameF);		
	objTdF.setAttribute("width",  '12%');	
	objTr.appendChild(objTdF);	
	var objTdI = document.createElement("td");
	var strNameI = document.createTextNode("Interval");	
	objTdI.appendChild(strNameI);		
	objTr.appendChild(objTdI);	
	var objTdT = document.createElement("td");
	var strNameT = document.createTextNode("To");	
	objTdT.setAttribute("width",  '12%');	
	objTdT.appendChild(strNameT);		
	objTr.appendChild(objTdT);	
	var objTdT = document.createElement("td");
	objTdT.setAttribute("width",  '10%');	
	var strNameT = document.createTextNode("Period");		
	objTdT.appendChild(strNameT);		
	objTr.appendChild(objTdT);	
	objTable.appendChild(objTr);	
	var strInterval='';
	// array variables left axix
	if (arrayGVar1.length>=1)
	{
		for (var i=0;i<arrayGVar1.length;i++) 
		{	

			var strDF='';
			if (typeof arrayGVar1[i].fromDate!="undefined")	
			{
				strDF=arrayGVar1[i].fromDate;
				strInterval=_returnIntervalFormat(arrayGVar1[i]);
			}
			else
			{
				strDF=arrayDataset.fromDate;
				strInterval=_returnIntervalFormat(arrayDataset);
			}
			
			var arrayTempF=new Array();
			if (strDF!="")		var arrayTempF=strDF.split("-");				
			
			var strDT='';
			if (typeof arrayGVar1[i].toDate!="undefined")	
				strDT=arrayGVar1[i].toDate;
			else
				strDT=arrayDataset.toDate;
			var arrayTempT=new Array();
			if (strDT!="")		var arrayTempT=strDT.split("-");		
			if (lngCommonF=="")	lngCommonF=arrayTempF[0];
			if (lngCommonT=="")	lngCommonT=arrayTempT[0];
			if (arrayTempF[0]>lngCommonF)	lngCommonF=arrayTempF[0];
			if (arrayTempT[0]<lngCommonT)	lngCommonT=arrayTempT[0];
			arrayDatesF.push(arrayTempF[0]);
			arrayDatesT.push(arrayTempT[0]);
		
			var objTr = document.createElement("tr");
			objTr.setAttribute("class",  'tableInfo_dates_trY1');	
			var objTd_name = document.createElement("td");	
			objTd_name.setAttribute("class",  'tableInfo_dates_tdVariable');	
			
			var strName='';
			if (typeof arrayGVar1[i].label!="undefined")	
				strName=arrayGVar1[i].label;
			else
				strName=arrayDataset.label;					
			
			var strName = document.createTextNode(strName);	
			var spanText = document.createElement("span");	
			spanText.textContent=strInterval;		
			objTd_name.appendChild(strName);				
			objTd_name.appendChild(document.createElement("br"));		
			objTd_name.appendChild(spanText);		
			objTr.appendChild(objTd_name);
			
			// FROM TD
			var objTd_fDate = document.createElement("td");					
			//var newTxt = document.createTextNode(strName);
			var spanText = document.createElement("span");		
			spanText.setAttribute("class",  'black');			
			spanText.textContent=arrayTempF[2].substr(0,2)+'/'+arrayTempF[1]+'/'+arrayTempF[0]; // 30-Dec-2011;				
			objTd_fDate.appendChild(spanText);		
			objTr.appendChild(objTd_fDate);	
			
			// DIV
			var objTd_div = document.createElement("td");	
			//objTd_div.setAttribute("width",  '60%');							
			var divLayerOther = document.createElement("div");	
			divLayerOther.setAttribute("class",  'divSlider');	
			divLayerOther.setAttribute("id",  'divY1_'+parseInt(i+1));	
			divLayerOther.setAttribute("style",  'width: 180px;');			
			objTd_div.appendChild(divLayerOther);										
			objTr.appendChild(objTd_div);			
					
			// NEW TD
			var objTd_tDate = document.createElement("td");					
			var spanText = document.createElement("span");		
			spanText.setAttribute("class",  'black');			
			spanText.textContent=arrayTempT[2].substr(0,2)+'/'+arrayTempT[1]+'/'+arrayTempT[0];
			
			objTd_tDate.appendChild(spanText);		
			objTr.appendChild(objTd_tDate);	
			// COMMON
			
			var objTd_tDate = document.createElement("td");					
			objTr.appendChild(objTd_tDate);	
			objTable.appendChild(objTr);		
			document.getElementById('tabsInfo_dates').appendChild(objTable);						
		}	
	}
	else
	{
		// no variables selected
		// empty configuration
		var objTr = document.createElement("tr");	
		objTr.setAttribute("class",  'tableInfo_dates_trY1');	
		var objTdV = document.createElement("td");
		objTdV.setAttribute("class",  'tableInfo_dates_tdVariable');	
		var strNameV = document.createTextNode("--");	
		
		objTdV.appendChild(strNameV);		
		objTr.appendChild(objTdV);		
		var objTdF = document.createElement("td");
		var strNameF = document.createTextNode("--");	
		objTdF.appendChild(strNameF);		
		
		objTr.appendChild(objTdF);	
		var objTdI = document.createElement("td");
		var strNameI = document.createTextNode("--");	
		objTdI.appendChild(strNameI);		
		objTr.appendChild(objTdI);	
		var objTdT = document.createElement("td");
		var strNameT = document.createTextNode("--");	
		
		objTdT.appendChild(strNameT);		
		objTr.appendChild(objTdT);		
		var objTd_tDate = document.createElement("td");		
		objTr.appendChild(objTd_tDate);				
		
		objTable.appendChild(objTr);		
	}
	for (var i=0;i<arrayGVar1.length;i++) 
	{
		addSlider('divY1_'+parseInt(i+1),parseInt(lngMin)-1,parseInt(lngMax)+1,arrayDatesF[i],arrayDatesT[i],true);
	}
	// common range
	var objTr = document.createElement("tr");	
	objTr.setAttribute("class",  'tableInfo_dates_common');		
	var objTd_name = document.createElement("td");	
	objTr.appendChild(objTd_name);
	
	// FROM TD
	var objTd_fDate = document.createElement("td");		
	var spanCommonF = document.createElement("span");		
	spanCommonF.setAttribute("id",  'spanCommonF');		
	objTd_fDate.appendChild(spanCommonF);		
	objTr.appendChild(objTd_fDate);	
	
	// DIV
	var objTd_div = document.createElement("td");	
	if ((arrayGVar1.length>=1)|| (arrayGVar2.length>=1))	
	{			
		var divLayerOther = document.createElement("div");	
		divLayerOther.setAttribute("id",  'divY1_Y2');	
		divLayerOther.setAttribute("class",  'divSlider');	
		divLayerOther.setAttribute("style",  'width: 180px;');			
		objTd_div.appendChild(divLayerOther);										
	}
	objTr.appendChild(objTd_div);			
			
	// NEW TD
	var objTd_tDate = document.createElement("td");			
	var spanCommonT = document.createElement("span");		
	spanCommonT.setAttribute("id",  'spanCommonT');	
	objTd_tDate.appendChild(spanCommonT);		
	objTr.appendChild(objTd_tDate);	
	
	var objTd_tbutton = document.createElement("td");		
	if ((arrayGVar1.length>=1)|| (arrayGVar2.length>=1))	
	{
		var btnCommon = document.createElement("input");		
		btnCommon.setAttribute("type",  'button');	
		btnCommon.setAttribute("id",  'btnCommon');	
		btnCommon.setAttribute("value",  'Select');	
		btnCommon.setAttribute("onClick",  '_setDates();return false;');		
		objTd_tbutton.appendChild(btnCommon);			
		var objBr = document.createElement("br");
		objTd_tbutton.appendChild(objBr);		
	}
	objTr.appendChild(objTd_tbutton);		
	objTable.appendChild(objTr);		
	document.getElementById('tabsInfo_dates').appendChild(objTable);			
	
	// dataset on right axix
	var arrayDatesF=new Array();
	var arrayDatesT=new Array();	
	if (arrayGVar2.length>=1)
	{
		for (var i=0;i<arrayGVar2.length;i++) 
		{	

			var strDF='';
			if (typeof arrayGVar2[i].fromDate!="undefined")	
			{
				strDF=arrayGVar2[i].fromDate;
				strInterval=_returnIntervalFormat(arrayGVar2[i]);
			}
			else
			{
				strDF=arrayDataset.fromDate;
				strInterval=_returnIntervalFormat(arrayDataset);
			}
			
			var arrayTempF=new Array();
			if (strDF!="")		var arrayTempF=strDF.split("-");				
			
			var strDT='';
			if (typeof arrayGVar2[i].toDate!="undefined")	
				strDT=arrayGVar2[i].toDate;
			else
				strDT=arrayDataset.toDate;
			var arrayTempT=new Array();
			if (strDT!="")		var arrayTempT=strDT.split("-");		
			if (lngCommonF=="")	lngCommonF=arrayTempF[0];
			if (lngCommonT=="")	lngCommonT=arrayTempT[0];
			if (arrayTempF[0]>lngCommonF)	lngCommonF=arrayTempF[0];
			if (arrayTempT[0]<lngCommonT)	lngCommonT=arrayTempT[0];
			arrayDatesF.push(arrayTempF[0]);
			arrayDatesT.push(arrayTempT[0]);		
		
			var objTr = document.createElement("tr");
			objTr.setAttribute("class",  'tableInfo_dates_trY2');	
			var objTd_name = document.createElement("td");	
			
			var strName='';
			if (typeof arrayGVar2[i].label!="undefined")	
				strName=arrayGVar2[i].label;
			else
				strName=arrayDataset.label;					
			
			var strName = document.createTextNode(strName);	
			objTd_name.setAttribute("class",  'tableInfo_dates_tdVariable');	
			var spanText = document.createElement("span");	
			spanText.textContent=strInterval;		
			objTd_name.appendChild(strName);				
			objTd_name.appendChild(document.createElement("br"));		
			objTd_name.appendChild(spanText);		
			objTr.appendChild(objTd_name);
					
			
			
			
			// FROM TD
			var objTd_fDate = document.createElement("td");					
			var spanText = document.createElement("span");		
			spanText.setAttribute("class",  'black');			
			spanText.textContent=arrayTempF[2].substr(0,2)+'/'+arrayTempF[1]+'/'+arrayTempF[0];				
			objTd_fDate.appendChild(spanText);		
			objTr.appendChild(objTd_fDate);	
			
			// DIV
			var objTd_div = document.createElement("td");	
								
			var divLayerOther = document.createElement("div");	
			divLayerOther.setAttribute("id",  'divY2_'+parseInt(i+1));	
			divLayerOther.setAttribute("class",  'divSlider');	
			divLayerOther.setAttribute("style",  'width: 180px;');			
			objTd_div.appendChild(divLayerOther);										
			objTr.appendChild(objTd_div);			
					
			// NEW TD
			var objTd_tDate = document.createElement("td");			
			
			var spanText = document.createElement("span");		
			spanText.setAttribute("class",  'black');			
			spanText.textContent=arrayTempT[2].substr(0,2)+'/'+arrayTempT[1]+'/'+arrayTempT[0];		
			objTd_tDate.appendChild(spanText);		
			objTr.appendChild(objTd_tDate);	
			
			var objTd_tDate = document.createElement("td");		
			objTr.appendChild(objTd_tDate);				
			
			objTable.appendChild(objTr);	

			document.getElementById('tabsInfo_dates').appendChild(objTable);						
		}	
	}
	else
	{
		// no dataset
		// empty configuration
		var objTr = document.createElement("tr");	
		objTr.setAttribute("class",  'tableInfo_dates_trY2');	
		var objTdV = document.createElement("td");
		objTdV.setAttribute("class",  'tableInfo_dates_tdVariable');	
		var strNameV = document.createTextNode("--");	
		
		objTdV.appendChild(strNameV);		
		objTr.appendChild(objTdV);		
		var objTdF = document.createElement("td");
		var strNameF = document.createTextNode("--");	
		objTdF.appendChild(strNameF);		
		
		objTr.appendChild(objTdF);	
		var objTdI = document.createElement("td");
		var strNameI = document.createTextNode("--");	
		objTdI.appendChild(strNameI);		
		objTr.appendChild(objTdI);	
		var objTdT = document.createElement("td");
		var strNameT = document.createTextNode("--");	
		
		objTdT.appendChild(strNameT);		
		objTr.appendChild(objTdT);		
		var objTd_tDate = document.createElement("td");		
		objTr.appendChild(objTd_tDate);				
		
		objTable.appendChild(objTr);		
	}
	for (var i=0;i<arrayGVar2.length;i++) 
	{
		addSlider('divY2_'+parseInt(i+1),parseInt(lngMin)-1,parseInt(lngMax)+1,arrayDatesF[i],arrayDatesT[i],true);	
	}

	// set common min and max
	var strClass="green";
	var blnAddButton=true;
	if (lngCommonF>lngCommonT)
	{
		lngCommonF=lngMin;
		lngCommonT=lngMax;
		strClass="red";
		blnAddButton=false;
		$("#spanCommonF").addClass( "red" );	
		$("#spanCommonT").addClass( "red" );	
		//$("#btnCommon").attr("disabled", "disabled"); 				
	}	
	else
	{
		//$("#btnCommon").removeAttr("disabled");  		
		$("#spanCommonF").addClass( "green" );	
		$("#spanCommonT").addClass( "green" );	
	}
	// The query is on-going
	if ($('#selVarY1_list').is(':disabled'))	
	{	
		// disabled the button
		$("#btnCommon").attr("disabled", "disabled"); 				
	}
	// set commond dates
	$("#spanCommonF").html('01/01/'+lngCommonF);	
	$("#spanCommonT").html('31/12/'+lngCommonT);		
	addSlider('divY1_Y2',parseInt(lngMin)-1,parseInt(lngMax)+1,lngCommonF,lngCommonT,false);		

	
	$( "#dialog_datasetInfo" ).dialog("open");
	return true;
}
//--------------------------------------------------------------
//--------------------------------------------------------------
// Add slider configuration jquery ui.
//--------------------------------------------------------------
//--------------------------------------------------------------
function addSlider(strObjName,min,max,valueMin,valueMax,blnDisabled) {   	

	$("#"+strObjName).slider({
		  range: true,
		  min: min,
		  max: max,
		  disabled: blnDisabled,
		  values: [ valueMin, valueMax ],
		  slide: function( event, ui ) {
		  //console.log( ui.values[ 0 ] + ui.values[ 1 ] );
			if (blnDisabled==false)
			{			
				$( "#spanCommonF" ).html( "01/01/" + ui.values[ 0 ]);
				$( "#spanCommonT" ).html( "31/12/" + ui.values[ 1 ]);			
			}
			
			 }
		  });		
	return '';
}
//--------------------------------------------------------------
//--------------------------------------------------------------
// Set dates on date from/to calendar of graph configuration dialog.
//--------------------------------------------------------------
//--------------------------------------------------------------
function _setDates(){
	strDateFrom=$("#spanCommonF").html();
	strDateTo=$("#spanCommonT").html();	

	$("#dateFrom").datepicker( "setDate", strDateFrom );	
	$("#dateTo").datepicker( "setDate", strDateTo );	
	$( "#dialog_datasetInfo" ).dialog("close");
}
//--------------------------------------------------------------
//--------------------------------------------------------------
// Function used to set the style sheet of html page depending from the browser
//--------------------------------------------------------------
//--------------------------------------------------------------
function _verifyBrowser(){
		
	pos=navigator.userAgent.indexOf("OPR")
	if (pos!=-1)		
		$("#divSelect1").addClass( "divSelect1_lineHThin" );
	else
	{
		pos=navigator.userAgent.indexOf("Chrome")
		if (pos!=-1)
			$("#divSelect1").addClass( "divSelect1_lineHNormal" );
		else
		{
			pos=navigator.userAgent.indexOf("Firefox")
			if (pos!=-1)
				$("#divSelect1").addClass( "divSelect1_lineHNormal" );
			else
			{
				pos=navigator.userAgent.indexOf("Safari")
				if (pos!=-1)
					$("#divSelect1").addClass( "divSelect1_lineHThin" );
				else
					$("#divSelect1").addClass( "divSelect1_lineHNormal" );
			}
		}		
	}
}