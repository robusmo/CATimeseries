/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

// A dygraph "auto-loader".

// Check where this script was sourced from. If it was sourced from
// '../dygraph-dev.js', then we should source all the other scripts with the
// same relative path ('../dygraph.js', '../dygraph-canvas.js', ...)
(function() {
  var src=document.getElementsByTagName('script');
  var script = src[src.length-1].getAttribute("src");

  // This list needs to be kept in sync w/ the one in generate-combined.sh
  // and the one in jsTestDriver.conf.
  var source_files = [
    "strftime/strftime-min.js",
    "rgbcolor/rgbcolor.js",
    "stacktrace.js",
	
    "dashed-canvas.js",
    "dygraph-options.js",
    "dygraph-layout.js",
    "dygraph-canvas.js",
    "dygraph.js",
    "dygraph-utils.js",
    "dygraph-gviz.js",
    "dygraph-interaction-model.js",
    "dygraph-tickers.js",
    "dygraph-plugin-base.js",
    "plugins/annotations.js",
    "plugins/axes.js",
    "plugins/chart-labels.js",
    "plugins/grid.js",
    "plugins/legend.js",
    "plugins/range-selector.js",
    "dygraph-plugin-install.js",
    "dygraph-options-reference.js",  // Shouldn't be included in generate-combined.sh
	"dygraph-extra.js",
	"base64.js",	
	"canvas2image.js"
  ];

  for (var i = 0; i < source_files.length; i++) {
    document.write('<script type="text/javascript" src="' + script.replace('dygraph-dev.js', source_files[i]) + '"></script>\n');
  }
})();

      function barChartPlotter(e) {
        var ctx = e.drawingContext;
        var points = e.points;
        var y_bottom = e.dygraph.toDomYCoord(0);

        // The RGBColorParser class is provided by rgbcolor.js, which is
        // packed in with dygraphs.
        var color = new RGBColorParser(e.color);
        color.r = Math.floor((255 + color.r) / 2);
        color.g = Math.floor((255 + color.g) / 2);
        color.b = Math.floor((255 + color.b) / 2);
        ctx.fillStyle = color.toRGB();

        // Find the minimum separation between x-values.
        // This determines the bar width.
        var min_sep = Infinity;
        for (var i = 1; i < points.length; i++) {
          var sep = points[i].canvasx - points[i - 1].canvasx;
          if (sep < min_sep) min_sep = sep;
        }
        var bar_width = Math.floor(2.0 / 3 * min_sep);

        // Do the actual plotting.
        for (var i = 0; i < points.length; i++) {
          var p = points[i];
          var center_x = p.canvasx;

          ctx.fillRect(center_x - bar_width / 2, p.canvasy,
              bar_width, y_bottom - p.canvasy);

          ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
              bar_width, y_bottom - p.canvasy);
        }
      }
