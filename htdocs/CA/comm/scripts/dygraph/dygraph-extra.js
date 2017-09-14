/*jslint vars: true, nomen: true, plusplus: true, maxerr: 500, indent: 4 */

/**
 * @license
 * Copyright 2011 Juan Manuel Caicedo Carvajal (juan@cavorite.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview This file contains additional features for dygraphs, which
 * are not required but can be useful for certain use cases. Examples include
 * exporting a dygraph as a PNG image.
 */

/**
 * Demo code for exporting a Dygraph object as an image.
 *
 * See: http://cavorite.com/labs/js/dygraphs-export/
 */

Dygraph.Export = {};

Dygraph.Export.DEFAULT_ATTRS = {

    backgroundColor: "white",

    //Texts displayed below the chart's x-axis and to the left of the y-axis 
    titleFont: "bold 18px serif",
    titleFontColor: "#074B8C",

    //Texts displayed below the chart's x-axis and to the left of the y-axis 
    axisLabelFont: "bold 14px serif",
    axisLabelFontColor: "#074B8C",

    // Texts for the axis ticks
    labelFont: "normal 12px serif",
    labelFontColor: "#074B8C",

    // Text for the chart legend
    legendFont: "bold 11px serif",
    legendFontColor: "##074B8C",

    // Default position for vertical labels
    vLabelLeft: 10,

    legendHeight: 120,    // Height of the legend area
	legendMargin: 20,
	lineHeight: 30,
	maxlabelsWidth: 0,
	labelTopMargin: 35,
	magicNumbertop: 8
	
};



/**
 * Tests whether the browser supports the canvas API and its methods for 
 * drawing text and exporting it as a data URL.
 */
Dygraph.Export.isSupported = function () {
    "use strict";
    try {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        return (!!canvas.toDataURL && !!context.fillText);
    } catch (e) {
        // Silent exception.
    }
    return false;
};

/**
 * Exports a dygraph object as a PNG image.
 *
 *  dygraph: A Dygraph object
 *  img: An IMG DOM node
 *  userOptions: An object with the user specified options.
 *
 */
Dygraph.Export.asPNG = function (dygraph, img, userOptions,filename,strReference,arrayLabels,arrayCopyright) {
    "use strict";
	userOptions=Dygraph.Export.DEFAULT_ATTRS;
	userOptions.legendHeight=150;
    var canvas = Dygraph.Export.asCanvas(dygraph, userOptions,strReference,arrayLabels,arrayCopyright);
	var myImage = canvas.toDataURL("image/png");      
	var w=window.open('about:blank');
	w.document.write("<img src='"+myImage+"' alt='Save graph'/>");
	//Canvas2Image.saveAsPNG(canvas);  // will prompt the user to save the image as PNG.  
	// returns an <img> element containing the converted PNG image  
	//var oImgPNG = Canvas2Image.saveAsPNG(oCanvas, true);     
	
	//document.write("<a href='test.png'><img alt='test' src='"+oImgPNG.toDataURL()+"'/></a>");
return false;

};
Dygraph.Export.asPDF = function (dygraph, img, userOptions,strParams,strURL,arrayLabels) {
    "use strict";
	
	userOptions=Dygraph.Export.DEFAULT_ATTRS;
	userOptions.legendHeight=150;
    var canvas = Dygraph.Export.asCanvas(dygraph, userOptions,'',arrayLabels,'');
	var myImage = canvas.toDataURL("image/png");      	

	$.ajax({
        type: "POST",
        url: strURL,
        data: ({ data: canvas.toDataURL("image/png"),strParams: strParams}),
        async: true,
        success: function(strHttp) {					
			if (strHttp!="")
			{
				var myWindow = window.open(strHttp,"PDF Version","width=500,height=400,scrollbars=yes");			
				if (myWindow == null || typeof(myWindow)=='undefined')
					alert("Turn off your pop-up blocker!");    				
			}			
        },
        error: function() {
            alert('Error occured');
        }
    });
	//var w=window.open('about:blank');
	//w.document.write("<img src='"+myImage+"' alt='from canvas'/>");
};
Dygraph.Export.asGIF_file = function (dygraph,img,userOptions,arrayLabels) {
    "use strict";
	userOptions=Dygraph.Export.DEFAULT_ATTRS;
    var canvas = Dygraph.Export.asCanvas(dygraph, userOptions,'',arrayLabels);	
	var myImage = canvas.toDataURL("image/png");  
	
	$.ajaxSetup({async:false});	
	$.post("mapserver/query/save.php",{data: canvas.toDataURL("image/png")})
	
	
};
/**
 * Exports a dygraph into a single canvas object.
 *
 * Returns a canvas object that can be exported as a PNG.
 *
 *  dygraph: A Dygraph object
 *  userOptions: An object with the user specified options.
 *
 */
Dygraph.Export.asCanvas = function (dygraph, userOptions,strReference,arrayLabels,arrayCopyright) {
    "use strict";
    var options = {}, 
        canvas = Dygraph.createCanvas();
    
    Dygraph.update(options, userOptions);
	
    //Dygraph.update(options, userOptions);

    canvas.width = dygraph.width_;
    canvas.height = dygraph.height_ + options.legendHeight;
	
	canvas.fillStyle = "white";//without alpha
	
    Dygraph.Export.drawPlot(canvas, dygraph, options,strReference);    
	
	//return canvas;
    Dygraph.Export.drawLegend(canvas, dygraph, options,strReference,arrayLabels,arrayCopyright);
    
    return canvas;
};

/**
 * Adds the plot and the axes to a canvas context.
 */
Dygraph.Export.drawPlot = function (canvas, dygraph, options,strReference) {
    "use strict";
    var ctx = canvas.getContext("2d");

    // Add user defined background
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Copy the plot canvas into the context of the new image.
    var plotCanvas = dygraph.hidden_;
    
    var i = 0;
    
    ctx.drawImage(plotCanvas, 0, 0);


    // Add the x and y axes
    var axesPluginDict = Dygraph.Export.getPlugin(dygraph, 'Axes Plugin');
    if (axesPluginDict) {
        var axesPlugin = axesPluginDict.plugin;
        
        for (i = 0; i < axesPlugin.ylabels_.length; i++) {
            Dygraph.Export.putLabel(ctx, axesPlugin.ylabels_[i], options,
                options.labelFont, options.labelFontColor);
        }
        
        for (i = 0; i < axesPlugin.xlabels_.length; i++) {
            Dygraph.Export.putLabel(ctx, axesPlugin.xlabels_[i], options,
                options.labelFont, options.labelFontColor);
        }
    }

    // Title and axis labels

    var labelsPluginDict = Dygraph.Export.getPlugin(dygraph, 'ChartLabels Plugin');
    if (labelsPluginDict) {
        var labelsPlugin = labelsPluginDict.plugin;

        Dygraph.Export.putLabel(ctx, labelsPlugin.title_div_, options, 
            options.titleFont, options.titleFontColor);

        Dygraph.Export.putLabel(ctx, labelsPlugin.xlabel_div_, options, 
            options.axisLabelFont, options.axisLabelFontColor);
	
        Dygraph.Export.putVerticalLabelY1(ctx, labelsPlugin.ylabel_div_, options, 
            options.axisLabelFont, options.axisLabelFontColor, "center");
			
        Dygraph.Export.putVerticalLabelY2(ctx, labelsPlugin.y2label_div_, options, 
            options.axisLabelFont, options.axisLabelFontColor, "center");
		
		if (strReference!="")
		{
			ctx.restore();
			ctx.fillStyle = options.axisLabelFontColor;
			ctx.font = "italic 12px serif";
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
			ctx.fillText(strReference, 400, ctx.canvas.height-5);			
			
		}

    }


	for (i = 0; i < dygraph.layout_.annotations.length; i++) {
        Dygraph.Export.putLabelAnn(ctx, dygraph.layout_.annotations[i], options, 
                options.labelFont, options.labelColor);
    }

};

/**
 * Draws a label (axis label or graph title) at the same position 
 * where the div containing the text is located.
 */
Dygraph.Export.putLabel = function (ctx, divLabel, options, font, color) {
    "use strict";

    if (!divLabel || !divLabel.style) {
        return;
    }

    var top = parseInt(divLabel.style.top, 10);
    var left = parseInt(divLabel.style.left, 10);
    
    if (!divLabel.style.top.length) {
        var bottom = parseInt(divLabel.style.bottom, 10);
        var height = parseInt(divLabel.style.height, 10);

        top = ctx.canvas.height - options.legendHeight - bottom - height;
    }

    // FIXME: Remove this 'magic' number needed to get the line-height. 
    top = top + options.magicNumbertop;

    var width = parseInt(divLabel.style.width, 10);

    switch (divLabel.style.textAlign) {
    case "center":
        left = left + Math.ceil(width / 2);
        break;
    case "right":
        left = left + width;
        break;
    }

    Dygraph.Export.putText(ctx, left, top, divLabel, font, color);
};
 
/**
 * Draws a label Y1 rotated 90 degrees counterclockwise.
 */
 var topV1=0;
Dygraph.Export.putVerticalLabelY1 = function (ctx, divLabel, options, font, color, textAlign) {
 "use strict";
    if (!divLabel) {
        return;
    }

	var degrees=270;	
		
	var top = parseInt(divLabel.style.top, 10);
    var right = parseInt(divLabel.style.right, 10) + parseInt(divLabel.style.width, 10) * 2;
    var text = divLabel.innerText || divLabel.textContent;

    if (textAlign == "center") {
        var textDim = ctx.measureText(text);
		
		top=(ctx.canvas.height -options.legendHeight)/2;
		
		if (top*2<(textDim.width))
		{
			ctx.font = "bold 12px serif";
			var textDim = ctx.measureText(text);
			top=textDim.width/2 ;
		}
		else
			ctx.font = font;
    }


	// first save the untranslated/unrotated context
	ctx.save();
	ctx.beginPath();		
	// move the rotation point to the center of the rect
	topV1=top;
	ctx.translate( 10, top);
	// rotate the rect
	ctx.rotate(degrees*Math.PI/180);
	ctx.fillStyle = color;    
	ctx.textAlign = "center";
	ctx.fillText(text, 0, 0);
	ctx.restore();

	return;
};

/**
 * Draws a label Y2 rotated 90 degrees clockwise.
 */
Dygraph.Export.putVerticalLabelY2 = function (ctx, divLabel, options, font, color, textAlign) {

    "use strict";
    if (!divLabel) {
        return;
    }

	var degrees=90;
	
 	var top = parseInt(divLabel.style.top, 10);
    var right = parseInt(divLabel.style.right, 10) + parseInt(divLabel.style.width, 10) * 2;
    var text = divLabel.innerText || divLabel.textContent;

    if (textAlign == "center") {
        var textDim = ctx.measureText(text);
		
		top=(ctx.canvas.height -options.legendHeight)/2;
		
		if (top*2<(textDim.width))
		{
			ctx.font = "bold 12px serif";
			var textDim = ctx.measureText(text);
			top=textDim.width/2 ;
		}
		else
			ctx.font = font;
    }

			ctx.save();
	ctx.beginPath();		
        // move the rotation point to the center of the rect
        ctx.translate( ctx.canvas.width-10, top);
        // rotate the rect
        ctx.rotate(degrees*Math.PI/180);

        // draw the rect on the transformed context
        // Note: after transforming [0,0] is visually [x,y]
        //       so the rect needs to be offset accordingly when drawn
        //ctx.rect( -width/2, -height/2, width,height);
		ctx.fillStyle = color;    
		ctx.textAlign = "center";
		ctx.fillText(text, 0, 0);
		     ctx.restore();
			 return;
	
};

/**
 * Draws the text contained in 'divLabel' at the specified position.
 */
Dygraph.Export.putText = function (ctx, left, top, divLabel, font, color) {
    "use strict";
    var textAlign = divLabel.style.textAlign || "left";    
    var text = divLabel.innerText || divLabel.textContent;

    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "middle";
    ctx.fillText(text, left, top);
};

/**
 * Draws the legend of a dygraph
 *
 */
Dygraph.Export.drawLegend = function (canvas, dygraph, options,strReference,arrayLabels,arrayCopyright) {
    "use strict";
	
    var ctx = canvas.getContext("2d");

    // Margin from the plot
    var labelTopMargin = 10;

    // Margin between labels
    var labelMargin = 5;
    
    var colors = dygraph.getColors();
    // Drop the first element, which is the label for the time dimension
    var labels = dygraph.attr_("labels").slice(1);
    
    // 1. Compute the width of the labels:
    var labelsWidth = 0;
    
   // var i;
   // for (i = 0; i < labels.length; i++) {
   //     labelsWidth = labelsWidth + ctx.measureText("- " + arrayLabels[labels[i]]).width + labelMargin;
   // }

    var labelsX = Math.floor(canvas.width  / 2);
    var labelsY = canvas.height - options.legendHeight + labelTopMargin;


    var labelVisibility=dygraph.attr_("visibility");

    ctx.font = options.legendFont;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
	var cont=0;
    var usedColorCount=0;
	var lngNumMax=10;
    for (i = 0; i < labels.length; i++) {
        if (labelVisibility[i]) {
            //TODO Replace the minus sign by a proper dash, although there is a
            //     problem when the page encoding is different than the encoding 
            //     of this file (UTF-8).
            var txt1 = "- " + arrayLabels[labels[i]];
			var txt2 =': '+arrayCopyright[labels[i]];
			var strTempCol=colors[usedColorCount].toUpperCase();
			if (strTempCol!="#FFFFFF")
			{
				var labelX=0;
				if (cont>=lngNumMax)
				{
					labelX=400;
					labelsY = canvas.height - options.legendHeight + labelTopMargin + (cont-lngNumMax)*12;
				}
				else				
					labelX=50;		
				cont++;				

				
				ctx.fillStyle = colors[usedColorCount];			
				ctx.fillText(txt1, labelX, labelsY);
				if (strReference!="")
				{
					ctx.fillStyle = "#000";
					var textDim = ctx.measureText(txt1);
					ctx.fillText(txt2, labelX+textDim.width, labelsY);				
					
				}
				labelsY=labelsY+12
			}
			usedColorCount++
            //labelsX = labelsX + ctx.measureText(txt).width + labelMargin;
        }
    }
	
};

/**
 * Finds a plugin by the value returned by its toString method..
 *
 * Returns the the dictionary corresponding to the plugin for the argument.
 * If the plugin is not found, it returns null.
 */
Dygraph.Export.getPlugin = function(dygraph, name) {
    for (i = 0; i < dygraph.plugins_.length; i++) {
        if (dygraph.plugins_[i].plugin.toString() == name) {
            return dygraph.plugins_[i];
        }
    }
    return null;
}
