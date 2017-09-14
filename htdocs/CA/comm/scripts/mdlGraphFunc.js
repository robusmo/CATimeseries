// graph object	
	var objGraph='';
// boolean used to identify when change automatically range of y axes
	var blnGUpdateBarGraph=false;
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to export a document as PDF.							      */
//------------------------------------------------------------------
//------------------------------------------------------------------		
	function createPDF(){	
		// show indicator
		showIndicator(1);
		var strParams="";
		var strSep="<%%>";
		
		strParams+=$('#spanGQueryBy').html()+strSep;
		strParams+=$('#spanGQueryBy_params').html()+strSep;
		// variables #1
		var strGVars1='';		
		for(i=0; i<arrayGVar1.length; ++i)
		{		
			if(arrayGVar1[i]["value"]!="")			
				strGVars1+=arrayGVar1[i]["value"]+'#';			
		}
		if ((strGVars1.length)>0)		strGVars1=strGVars1.substr(0, strGVars1.length-1);
		var strGVars2='';		
		// variables #2
		for(i=0; i<arrayGVar2.length; ++i)
		{
			if(arrayGVar2[i]["value"]!="")			
				strGVars2+=arrayGVar2[i]["value"]+'#';			
		}		
		if ((strGVars2.length)>0)		strGVars2=strGVars2.substr(0, strGVars2.length-1);
		strParams+=strGVars1+strSep;
		strParams+=strGVars2+strSep;
		
		var img = document.getElementById("testIDimage");
		// export as PDF
		Dygraph.Export.asPDF(objGraph,img,'',strParams,"/cgi-bin/python/saveGraph.py",arrayGCSV.labels);
		showIndicator(0);
		return false;	
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/*	Function used to relaod the graph in order to update it	      */
//------------------------------------------------------------------
//------------------------------------------------------------------			
	function _reloadGraph(){
		if (reqAjax!="")
		{		
			updateGraph(arrayGCSV.strHttpFilename);
		}
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/*	Function used to reset minmun and maximun graph axix values   */
//------------------------------------------------------------------
//------------------------------------------------------------------		
	function _resetMinMaxGraph(strAxes){		
		if (objGraph!="")
		{
			if (strAxes=="Y1")
			{
				
				lngMinValue=$("#txtSetMinValueGraphY1").val();
				lngMaxValue=$("#txtSetMaxValueGraphY1").val();
			}
			else
			{
				if (strAxes=="Y2")
				{
					lngMinValue=$("#txtSetMinValueGraphY2").val();
					lngMaxValue=$("#txtSetMaxValueGraphY2").val();
				}	
				else
				{
					lngMinValue='null'		
					lngMaxValue='null'		
				}
			}
			if (isNaN(lngMinValue))	
			{			
				lngMinValue='null'		
			}
			else
			{
				if (isNaN(lngMaxValue))	
				{				
					lngMaxValue='null'
				}
				else
				{				
					lngMinValue=parseInt(lngMinValue);
					lngMaxValue=parseInt(lngMaxValue);
					
					if (lngMinValue>lngMaxValue)	lngMaxValue='null'
				}
			}
			if (strAxes=="Y1")			
				objGraph.updateOptions( {axes: { y: {valueRange: [lngMinValue, lngMaxValue] }} });
			else
			{
				if (strAxes=="Y2")		
					objGraph.updateOptions( {axes: { y2: {valueRange: [lngMinValue, lngMaxValue] }} });
				else
				{
					objGraph.updateOptions( {axes: { y: {valueRange: [lngMinValue, lngMaxValue] }} });
					objGraph.updateOptions( {axes: { y2: {valueRange: [lngMinValue, lngMaxValue] }} });
				}				
			}
			if (strAxes=="Y1")
			{	
				if (lngMinValue=='null')
				{
					lngMinValue='';
					$("#txtSetMinValueGraphY1").val(lngMinValue);					
					_displayErrorObj($("#txtSetMinValueGraphY1"));
				}
				if (lngMaxValue=='null')
				{
					lngMaxValue='';
					$("#txtSetMaxValueGraphY1").val(lngMaxValue);					
					_displayErrorObj($("#txtSetMaxValueGraphY1"));
				}
			}
			else
			{
				if (strAxes=="Y2")
				{			
					if (lngMinValue=='null')
					{
						lngMinValue='';						
						$("#txtSetMinValueGraphY2").val(lngMinValue);						
						_displayErrorObj($("#txtSetMinValueGraphY2"));
					}
					if (lngMaxValue=='null')
					{					
						lngMaxValue='';
						$("#txtSetMaxValueGraphY2").val(lngMaxValue);						
						_displayErrorObj($("#txtSetMaxValueGraphY2"));
					}	
				}					
				else
				{
					$("#txtSetMinValueGraphY1").val('');
					$("#txtSetMaxValueGraphY1").val('');
					$("#txtSetMinValueGraphY2").val('');
					$("#txtSetMaxValueGraphY2").val('');

				}
			}
		}
		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/*	Disaply an error when it occurs.                              */
//------------------------------------------------------------------
//------------------------------------------------------------------		
	function _displayErrorObj(strObj){
		// set the class
		strObj.addClass( "ui-state-highlight2" );
		// focus on the object
		strObj.focus();			
		// set timeout
		setTimeout(function() {			
				strObj.removeClass( "ui-state-highlight2" );								
			}, 2000 );	
		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to export an image as PNG.							*/
//------------------------------------------------------------------
//------------------------------------------------------------------		
	function createPNG(){	
		// show indicator
		showIndicator(1);
		// set the object to canvas
		var img = document.getElementById("testIDimage");
		// export as PNG
		Dygraph.Export.asPNG(objGraph,img,'','',arrayGCSV.reference,arrayGCSV.labels,arrayGCSV.copyright);
		// stop the indicator
		showIndicator(0);
		return false;	
	}	
//------------------------------------------------------------------
//------------------------------------------------------------------
/*	Function used to set all objects as graph section.				*/
//------------------------------------------------------------------
//------------------------------------------------------------------		
	function _setTextExportGraphSection(strType){	
	
		if (strType!="")
		{
			if (typeof blnEnabled=="undefined")	var blnEnabled=false;
			$('#graphSection_PDF').html("<img src='/CA/comm/images/PDF_downlaod_disable.png'>");
			$('#graphSection_PNG').html("<img src='/CA/comm/images/PNG_downlaod_disable.png'>");
			$('#graphSection_PLAYInit').html("<br><a href='' onClick="+'"'+"submitGraph();return false;"+'"'+"><img src='/CA/comm/images/play.png'></a>");
			if (blnGProcessActive==false)
			{
				$('#graphSection_STOP').html("<img src='/CA/comm/images/stop_disable.png'>");
				$('#graphSection_RELOAD').html("<img src='/CA/comm/images/refresh_disable.png'>");
			}
			
			$('#txtSetMinValueGraphY1').attr('disabled', 'disabled');		
			$('#txtSetMaxValueGraphY1').attr('disabled', 'disabled');		
			$('#txtSetMinValueGraphY2').attr('disabled', 'disabled');		
			$('#txtSetMaxValueGraphY2').attr('disabled', 'disabled');		
		}
		var blnReset=0;
		if (strType=="PDF")				
		{
			// click on PDF
			$('#graphSection_PDF').html("<a href='' onClick="+'"'+"createPDF();return false;"+'"'+"><img src='/CA/comm/images/PDF_downlaod_shadow.png'></a>");
			$('#graphSection_PNG').html("<br><a href='' onClick="+'"'+"createPNG();return false;"+'"'+"><img src='/CA/comm/images/PNG_downlaod_shadow.png'></a>");
			$('#graphSection_STOP').html("<img src='/CA/comm/images/stop_disable.png'>");
			$('#graphSection_PLAY').html("<br><a href='' onClick="+'"'+"submitGraph();return false;"+'"'+"><img src='/CA/comm/images/play.png'></a>");
			$('#graphSection_PLAYInit').html("<br><a href='' onClick="+'"'+"submitGraph();return false;"+'"'+"><img src='/CA/comm/images/play.png'></a>");
			$('#graphSection_RELOAD').html("<img src='/CA/comm/images/refresh_disable.png'>");
				
			blnReset=1;			
			if (typeof arrayGCSV!="undefined")
			{
				if (trim(arrayGCSV.strY2Descr)!="")
				{			
					$("#txtSetMinValueGraphY2").removeAttr("disabled"); 	
					$("#txtSetMaxValueGraphY2").removeAttr("disabled"); 			
				}			
			}
		}
		else
		{
			// LAOD configuration
			if (strType=="LOAD")				
			{
				$('#graphSection_PDF').html("<img src='/CA/comm/images/PDF_downlaod_disable.png'>");
				$('#graphSection_PNG').html("<img src='/CA/comm/images/PNG_downlaod_disable.png'>");
				$('#graphSection_PLAY').html("<br><img src='/CA/comm/images/play_disable.png'>");
				$('#graphSection_PLAYInit').html("<br><img src='/CA/comm/images/play_disable.png'>");
				$('#graphSection_STOP').html("<br><a href='' onClick="+'"'+"_stopGraph();return false;"+'"'+"><img src='/CA/comm/images/stop.png'></a>");
				$('#graphSection_RELOAD').html("<br><a href='' onClick="+'"'+"_reloadGraph();return false;"+'"'+"><img src='/CA/comm/images/refresh.png'></a>");				
				blnReset=1;
			}	
			else			
				blnReset=1;			
		}
		if (blnReset==1)
		{
			// RESET configuration			
			$("#txtSetMinValueGraphY1").removeAttr("disabled"); 	
			$("#txtSetMaxValueGraphY1").removeAttr("disabled"); 	
			if (typeof arrayGCSV!="undefined")
			{				
				if (trim(arrayGCSV.strY2Descr)!="")
				{			
					$("#txtSetMinValueGraphY2").removeAttr("disabled"); 	
					$("#txtSetMaxValueGraphY2").removeAttr("disabled"); 					
				}			
			}
		}
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/* Function used to set the axix on the graph from zero to null if the 
flag on blnBarChartY1 is true (ie: precipitation).				*/
//------------------------------------------------------------------
//------------------------------------------------------------------		
	
	function updateGraph(strFile){
		objGraph.updateOptions( { 'file': strFile } );

		if (blnGUpdateBarGraph==false)
		{		
			if (trim(arrayGCSV.blnBarChartY1)=='1')
			{					
			
				objGraph.updateOptions( {axes: { y: {valueRange: [0, null] }} });
			}
			if (trim(arrayGCSV.blnBarChartY2)=='1')
			{		
				objGraph.updateOptions( {axes: { y2: {valueRange: [0, null] }} });
			}			
		}		
		return true;
	}
//------------------------------------------------------------------
//------------------------------------------------------------------
/*	 Graph configuration.									*/
//------------------------------------------------------------------
//------------------------------------------------------------------		
	function setGraph(strFile){
	
		pts_info = function(e, x, pts, row) 
		{	
			var str = "";        				
			for (var i = 0; i < pts.length; i++) 
			{		
				var p = pts[i];
				strAxix="";										
				
				var d=new Date(p.xval);
													
				var curr_day = d.getDate();		
				var curr_month = eval(d.getMonth());																		
				var curr_year = eval(d.getFullYear());																						
				var strDate = curr_day+' '+monthsName[curr_month]+' '+curr_year;							
				var strTempVal='';
				var strTempUnit='';
				
				strLayer=p.name;		
				strCol=arrayGCSV.colors[strLayer]			
				strLabel=arrayGCSV.labels[strLayer]
				strUnit=arrayGCSV.units[strLayer]
				
				if (i==0)	str+=strDate;
				// If Stepchart, the system shows only values different from zero
				// otherwise shows also zero values (ie: temperature)
				strTempTypeGraph=strLayer.substr(0,2)			
				var blnShow=true;
				p.yval=parseFloat(p.yval);
				if (strTempTypeGraph=="SC"){
					if (p.yval==0.0)	blnShow=false;
				}
							
				if (blnShow==true)
				{			
					if (!isNaN(p.yval))
					{
						str +="<br><font color='"+strCol+"'>"+strLabel + "</font>"+strAxix+": " + p.yval.toFixed(arrayGSettings.numDPlaces);
						if (trim(strUnit)!="")				str +="("+strUnit+")";
					}
				}				
			}
			return str;
		};
	
		var blnLogScaleY1=false;
		// axix #1: logaritmic
		if (parseInt(arrayGCSV.blnLogaritmicY1)==1) 	blnLogScaleY1=true;
		// axix #2: logaritmic
		var blnLogScaleY2=false;
		if (parseInt(arrayGCSV.blnLogaritmicY2)==1) 	blnLogScaleY2=true;	
		// grpah: logaritmic
		var blnLog=false;
		if (blnLogScaleY1==true || blnLogScaleY2==true)	blnLog=true;
		
		var strTitle=arrayGSettings.title+': '+arrayGCSV.strOperation;
		
		objGraph = new Dygraph(
			document.getElementById("graphResult"),
			strFile,
			{
				series : {
					'LY11': {axis: 'y'},'LY12': {axis: 'y'},'LY13': {axis: 'y'},'LY14': {axis: 'y'},'LY15': {axis: 'y'},'LY16': {axis: 'y'},'LY17': {axis: 'y'},'LY18': {axis: 'y'},
					'LY21': {axis: 'y2'},'LY22': {axis: 'y2'},'LY23': {axis: 'y2'},'LY24': {axis: 'y2'},'LY25': {axis: 'y2'},'LY26': {axis: 'y2'},'LY27': {axis: 'y2'},'LY28': {axis: 'y2'},
					'HY11': {axis: 'y',	plotter: barChartPlotter},'HY12': {axis: 'y',	plotter: barChartPlotter},'HY13': {axis: 'y',	plotter: barChartPlotter},'HY14': {axis: 'y',	plotter: barChartPlotter},'HY15': {axis: 'y',	plotter: barChartPlotter},'HY16': {axis: 'y',	plotter: barChartPlotter},'HY17': {axis: 'y',	plotter: barChartPlotter},'HY18': {axis: 'y',	plotter: barChartPlotter},
					'HY21': {axis: 'y2',	plotter: barChartPlotter},'HY22': {axis: 'y2',	plotter: barChartPlotter},'HY23': {axis: 'y2',	plotter: barChartPlotter},'HY24': {axis: 'y2',	plotter: barChartPlotter},'HY25': {axis: 'y2',	plotter: barChartPlotter},'HY26': {axis: 'y2',	plotter: barChartPlotter},'HY27': {axis: 'y2',	plotter: barChartPlotter},'HY28': {axis: 'y2',	plotter: barChartPlotter},					
					'BY11': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},'BY12': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},'BY13': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},'BY14': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},'BY15': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},'BY16': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},'BY17': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},'BY18': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'BY21': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},'BY22': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},'BY23': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},'BY24': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},'BY25': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},'BY26': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},'BY27': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},'BY28': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY11': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY12': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY13': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY14': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY15': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY16': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY17': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY18': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY19': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY110': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY111': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY112': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY113': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY114': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY115': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY116': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY117': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY118': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY119': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY120': {axis: 'y',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY21': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY22': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY23': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY24': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY25': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY26': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY27': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY28': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY29': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY210': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY211': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY212': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY213': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY214': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY215': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY216': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY217': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY218': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY219': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true},
					'SCY220': {axis: 'y2',stepPlot: true,fillGraph: true,stackedGraph: true}
					},			
				colors: arrayGCSV.colorsGraph,
				highlightCallback: function(e, x, pts, row) {		
					showhideLegend('none');				 
					document.getElementById('status').innerHTML =pts_info(e,x,pts,row);
				},				
				ylabel: arrayGCSV.strY1Descr,							
				y2label: arrayGCSV.strY2Descr,
				xlabel: arrayGSettings.xtitle,							
				title: arrayGCSV.strGraphTitle,
				connectSeparatedPoints: true,
				errorBars: true,
				sigma: 1.0,			
				width: arrayGSettings.width,
				height: arrayGSettings.height,	
				logscale : blnLog,
				xAxisLabelWidth: 80,
				axes: {
						y: {							
							
							yAxisLabelWidth: 60,							
							gridLineWidth: 2,
							drawGrid: true,
							independentTicks: true,
							labelsDivStyles: { 'textAlign': 'left' },
							xAxisHeight: 14,		
							axisLabelFontSize: 10,
							axisLabelColor: "#FF0000",
							logscale : blnLogScaleY1,
							labelsKMG2: false,
						},
						y2: {
							
							yAxisLabelWidth: 60,							
							gridLineWidth: 2,
							drawGrid: true,
							independentTicks: true,
							labelsDivStyles: { 'textAlign': 'left' },
							xAxisHeight: 14,		
							axisLabelFontSize: 11,
							axisLabelColor: "##000080",
							logscale : blnLogScaleY2,
							labelsKMG2: false,
						},
						x: {
							gridLineWidth: 2,
							drawGrid: true,
							independentTicks: true,							
							axisLabelFontSize: 8,							
							axisLabelFormatter: function(d) {
								return d.strftime('%m-%Y');
							},							
						}					
				}          		
			}
		);	
		
		return true;
	}	