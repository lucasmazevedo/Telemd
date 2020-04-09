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
			//
			let scale = 6;
			let margin = 10*scale;
			let width = 2480*scale/10;
			let height = 3608*scale/10;
			let tSizeH1 = 9*scale;
			let tSizeH2 = 7*scale;
			//
			const elem = document.getElementById('main-p5-canvas');
			let grid = null;
			let _color = '#0000FF';
			let questionnaire = null;
			let mainFont = null;
			let responseFont = null;


			p.preload = function() {
				let json_url = './datasets/symptoms.json';
				questionnaire = p.loadJSON(json_url);
				//
				let font_path = './fonts/Nunito/';
				mainFont = p.loadFont(font_path + 'Nunito-Regular.ttf');
				responseFont = p.loadFont(font_path + 'Nunito-Bold.ttf');
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
				p.background(255);
				//
				let reportCode = e.currentTarget.patientReportCode;
				let reportCodes = reportCode.split('-');
				let symptoms = questionnaire.symptoms;
				console.log(symptoms);
				//
				let cursor_posY = margin;
				p.textAlign(p.LEFT, p.TOP);
				p.noStroke();
				for(let i=0; i < symptoms.length; i++){
					//
					let heading_val = symptoms[i].id + '. ' + symptoms[i].title;
					p.fill(0);
					p.textFont(mainFont);
					p.textSize(tSizeH1);
					p.text(heading_val, margin, cursor_posY);
					cursor_posY += (tSizeH1+3*scale);
					//
					for(let j=0; j<symptoms[i].info.length; j++){
						p.textFont(mainFont);
						p.textSize(tSizeH2);
						// Question
						p.fill(0,200);
						let sub_heading_val = symptoms[i].info[j].id + '. ' + symptoms[i].info[j].title;
						let sh_words = sub_heading_val.split(' ');
						let cursor_posX = margin*2;
						for(let w=0; w < sh_words.length; w++){
							p.text(sh_words[w] + ' ', cursor_posX, cursor_posY);
							cursor_posX += p.textWidth(sh_words[w] + ' ');
							if(cursor_posX > width-margin*3){
								cursor_posX = margin*2;
								cursor_posY += (tSizeH2+1*scale);
							}
						}
						// Answer
						let response = null;
						if(i == 0 && j == 0){
							let val = ['M', 'F', 'O'].indexOf(reportCodes[i][j]);
							if(val != -1)
								response = symptoms[i].info[j].options[val];
							else{
								p.fill(255, 0,255);
								response = 'INVALID';
							}
							//
							p.fill(0);
							p.textFont(responseFont);
							p.text(response, cursor_posX + scale*2, cursor_posY);
						}else if(i == 0 && j == 1){
							response = symptoms[i].info[j].options[reportCodes[i][j]];
							//
							p.fill(0);
							p.textFont(responseFont);
							p.text(response, cursor_posX + scale*2, cursor_posY);
						}else{
							if(symptoms[i].info[j].options[reportCodes[i][j]]){
								response = 'YES';
								//
								p.fill(255,0,0);
								let textString = response;
								let bbounds = mainFont.textBounds(textString, cursor_posX, cursor_posY);
								p.rect(scale*2+bbounds.x-scale, bbounds.y-scale, bbounds.w+scale*2, bbounds.h+scale*2);
								p.fill(0);
								p.textFont(responseFont);
								p.text(textString, cursor_posX + scale*2, cursor_posY);
							}
							else{
								response = 'NO';
								p.fill(0);
								let textString = response;
								let bbounds = mainFont.textBounds(textString, cursor_posX, cursor_posY);
								p.rect(scale*2+bbounds.x-scale, bbounds.y-scale, bbounds.w+scale*2, bbounds.h+scale*2);
								p.fill(255);
								p.textFont(responseFont);
								p.text(textString, cursor_posX + scale*2, cursor_posY);
							}
						}


						/*
						p.text(sub_heading_val, margin*2, cursor_posY, width-margin*3);
						let mult=1;
						if(p.textWidth(sub_heading_val) > (width-margin*3)){
							mult = Math.ceil(p.textWidth(sub_heading_val)/(width-margin*3));
						}
						cursor_posY += (tSizeH2+1*scale)*mult*1.2;
						*/
						cursor_posY += (tSizeH2+margin*0.4);
					}
					//
					cursor_posY += margin;
				}
				//
				//
				elem.dispatchEvent(new Event('ready-report'));
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