import merge from "../help/merge.js";
import {getEncodingHeight, getBarcodePadding, getTotalWidthOfEncodings, getMaximumHeightOfEncodings} from "./shared.js";

var svgns = "http://www.w3.org/2000/svg";

function calculateEncodingAttributes(encodings, barcodeOptions, context){
	for(let i = 0; i < encodings.length; i++){
		var encoding = encodings[i];
		var options = merge(barcodeOptions, encoding.options);

		// Calculate the width of the encoding
		var textWidth = messureText(encoding.text, options, context);
		var barcodeWidth = encoding.data.length * options.width;
		encoding.width =  Math.ceil(Math.max(textWidth, barcodeWidth));

		encoding.height = getEncodingHeight(encoding, options);

		encoding.barcodePadding = getBarcodePadding(textWidth, barcodeWidth, options);
	}
}

function messureText(string, options, context){

	// Size 100% correct size, it is just an approximation
	// 6px width for each 1px font size
	var size = (string.length*0.6)*options.fontSize

	//return size;
	return size;
}

class SVGTextRenderer{
	constructor(svg, encodings, options){
		this.svg = svg;
		this.encodings = encodings;
		this.options = options;
		this.width = 0;
		this.height = 0;
	}

	render(){
		var currentX = this.options.marginLeft;

		this.prepareSVG();

		this.svg.data += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" style="transform:translate(0,0);background:${this.options.background};">`
		
		for(let i = 0; i < this.encodings.length; i++){
			
			var encoding = this.encodings[i];
			var encodingOptions = merge(this.options, encoding.options);

			this.svg.data += `<g transform="translate(${currentX}, ${encodingOptions.marginTop})" style="fill:${encodingOptions.lineColor};">`
			this.svg.data += `<path d="`
			this.drawSvgBarcode(encodingOptions, encoding);
			this.svg.data += `" x="0" y="0" />`
			this.drawSVGText(encodingOptions, encoding);
			this.svg.data += `</g>`

			currentX += encoding.width;
		}

		this.svg.data += `</svg>`
		this.svg.data = this.svg.data.replace('<path d="" x="0" y="0" />','')
	}

	prepareSVG(){
		calculateEncodingAttributes(this.encodings, this.options);
		var totalWidth = getTotalWidthOfEncodings(this.encodings);
		this.height = getMaximumHeightOfEncodings(this.encodings);

		this.width = totalWidth + this.options.marginLeft + this.options.marginRight;
	}

	drawSvgBarcode(options, encoding){
		var binary = encoding.data;

		// Creates the barcode out of the encoded binary
		var yFrom;
		if(options.textPosition == "top"){
			yFrom = options.fontSize + options.textMargin;
		}
		else{
			yFrom = 0;
		}

		var barWidth = 0;
		var x = 0;
		for(var b = 0; b < binary.length; b++){
			x = b * options.width + encoding.barcodePadding;
			if(binary[b] === "1"){
				barWidth++;
			}
			else if(barWidth > 0){
				this.drawLine(x - options.width * barWidth, yFrom, options.width * barWidth, options.height);
				barWidth = 0;
			}
		}

		// Last draw is needed since the barcode ends with 1
		if(barWidth > 0){
			this.drawLine(x - options.width * (barWidth - 1), yFrom, options.width * barWidth, options.height);
		}
	}

	drawSVGText(options, encoding){

		var font = ''
		var fontSize = ''
		var textAnchor = ''
		var style = ''

		// Draw the text if displayValue is set
		if(options.displayValue){
			var x, y;

			style = "font:" + options.fontOptions + " " + options.fontSize + "px " + options.font

			if(options.textPosition == "top"){
				y = options.fontSize - options.textMargin;
			}
			else{
				y = options.height + options.textMargin + options.fontSize;
				y -= 1
			}

		// Draw the text in the correct X depending on the textAlign option
			if(options.textAlign == "left" || encoding.barcodePadding > 0){
				x = 0;
				textAnchor = "start"
			}
			else if(options.textAlign == "right"){
				x = encoding.width - 1;
				textAnchor = "end"
			}
		// In all other cases, center the text
		else{
				x = encoding.width / 2;
				textAnchor = "middle"
			}

			this.svg.data += `<text x="${x}" y="${y}" text-anchor="${textAnchor}" style="${style}">${encoding.text}</text>`	
		}
	}

	drawLine(x, y, width, height){
		width += x
		height += y
		this.svg.data += `M${x},${y} V${height} H${width} V${y} H${x} Z `
	}
}

export default SVGTextRenderer;