/*global tele:true, $:true*/

window.tele	=	window.tele	||	{};

/**
 * ------------------------------------------------
 * class:	NewReporter
 * desc: takes report-code and generates image
 * ------------------------------------------------
 */
tele.NewReporter = class {
	constructor() {
		console.log('tele.NewReporter - constructor');
		//
		this._sketch = null;
		this._mainp = null;
	}

	/**
	 * ------------------------------------------------
	 * init
	 * desc: Creates a report
	 * ------------------------------------------------
	 */
	init(){
		this._sketch = function( p ) {
			this._mainp = p;
			let scale = 4;
			let margin = 10*scale;
			let width = 2480*scale/10;
			let height = 3608*scale/10;
			const elem = document.getElementById('main-p5-canvas');
			let grid = null;
			let _color = '#0000FF';
			let questionnaire = null;

			p.preload = function() {
				let url = './datasets/symptoms.json';
				questionnaire = p.loadJSON(url);
			};

			//
			//
			//
			p.setup = function() {
				console.log('tele.p5Layer - setup p5');
				// Setup p5 canvas
				let canvas = p.createCanvas(width,height);
				canvas.parent('main-p5-canvas');
				//
				p.background(220);
			};

			//
			//
			p.draw = function() {
				//p.background('#0000FF');
			};
			//
			//

			p.updateBackground = function(color, alpha){
				//
				//
				let bgColor = color;
				let c = p.color(bgColor);
				c._array[3] = alpha / 255;
				//
				p.background(c);
			};

			// Listen for the event.
			elem.addEventListener('update-report', function (e) {
				// Clear
				p.background(200);
				//
				let reportCode = e.currentTarget.patientReportCode;
				let symptoms = questionnaire.symptoms;
				console.log(symptoms);
				//
				let cursor_pos = margin;
				let tSizeH1 = 9*scale, tSizeH2 = 7.5*scale;
				p.textAlign(p.LEFT, p.TOP);
				for(let i=0; i < symptoms.length; i++){
					//
					let heading_val = symptoms[i].id + '. ' + symptoms[i].title;
					p.textSize(tSizeH1);
					p.text(heading_val, margin, cursor_pos);
					cursor_pos += (tSizeH1+3*scale);
					//
					for(let j=0; j<symptoms[i].info.length; j++){
						let sub_heading_val = symptoms[i].info[j].id + '. ' + symptoms[i].info[j].title;
						p.textSize(tSizeH2);
						p.text(sub_heading_val, margin*2, cursor_pos, width-margin*3);
						let mult=1;
						if(p.textWidth(sub_heading_val) > (width-margin*3)){
							mult = Math.ceil(p.textWidth(sub_heading_val)/(width-margin*3));
						}
						cursor_pos += (tSizeH2+1*scale)*mult*1.2;
					}
					//
					cursor_pos += margin;
				}
				//

			}, false);
		}.bind(this);
	}


	/**
	 * ------------------------------------------------
	 * getSketch
	 * desc:
	 * ------------------------------------------------
	 */
	getSketch(){
		return this._sketch;
	}

	/**
	 * ------------------------------------------------
	 * getP
	 * desc:
	 * ------------------------------------------------
	 */
	getP(){
		return this._mainp;
	}

};