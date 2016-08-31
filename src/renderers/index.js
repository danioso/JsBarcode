import CanvasRenderer from './canvas.js';
import SVGRenderer from './svg.js';
import SVGTextRenderer from './svg-text.js';

function getRendererClass(name){
	switch (name) {
		case "canvas":
			return CanvasRenderer;
		case "svg":
			return SVGRenderer;
    case "svg-text":
      return SVGTextRenderer;
		default:
			throw new Error("Invalid rederer");
	}
}

export {getRendererClass};
