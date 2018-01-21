var ionStorms = new Array();

function init() {
	ionStorms[0] = new ionStorm("A");
	ionStorms[1] = new ionStorm("B");
	ionStorms[2] = new ionStorm("C");
	compute();
}

function compute() {
	ionStorms[0].readVals();
	ionStorms[0].calculateAll();
	ionStorms[0].applyVals();

	ionStorms[1].readVals();
	ionStorms[1].calculateAll();
	ionStorms[1].applyVals();
	
	mergeStep();
}

function mergeStep() {
	var psuedoDist = Math.pow(ionStorms[0].posXB - ionStorms[0].posYB,2) + Math.pow(ionStorms[1].posXB - ionStorms[1].posYB,2);
	var psuedoHitbox = Math.pow(ionStorms[0].radiusD,2) + Math.pow(ionStorms[1].radiusD,2);
	var canMergeObj = document.getElementById("canMerge");
	
	ionStorms[2].voltageA = 0;
	
	if (ionStorms[0].voltageA <= 0 || ionStorms[1].voltageA <= 0) {
		canMergeObj.innerHTML = "";
	} else if (ionStorms[0].voltageD <= 0 || ionStorms[1].voltageD <= 0) {
		canMergeObj.innerHTML = "No; ion storm(s) subsided";
	} else if (psuedoDist >= psuedoHitbox) {
		canMergeObj.innerHTML = "No; too far away";
	} else if (ionStorms[0].voltageD == ionStorms[1].voltageD) {
		canMergeObj.innerHTML = "No; voltages identical";
	} else {
		canMergeObj.innerHTML = "Yes; merge conditions met";
		ionStorms[2].voltageA = Infinity;
		
		ionStorms[2].voltageD = mergeVolts(ionStorms[0].voltageD, ionStorms[1].voltageD);
		ionStorms[2].radiusD = mergeRadii(ionStorms[0].voltageD, ionStorms[1].voltageD, ionStorms[0].radiusD, ionStorms[1].radiusD);
		ionStorms[2].headingD = mergeMovement(ionStorms[0].voltageD, ionStorms[1].voltageD, ionStorms[0].headingD, ionStorms[1].headingD);
		ionStorms[2].warpD = mergeMovement(ionStorms[0].voltageD, ionStorms[1].voltageD, ionStorms[0].warpD, ionStorms[1].warpD);
		ionStorms[2].posXB = mergePos(ionStorms[0].voltageD, ionStorms[1].voltageD, ionStorms[0].posXB, ionStorms[1].posXB);
		ionStorms[2].posYB = mergePos(ionStorms[0].voltageD, ionStorms[1].voltageD, ionStorms[0].posYB, ionStorms[1].posYB);
	}
	
	ionStorms[2].applyVals();
}

//Ion storm object
function ionStorm(initLetter) {
	this.voltageA = 0;
	this.radiusA = 0;
	this.headingA = 0;
	this.posXA = 2000;
	this.posYA = 2000;
	
	this.letter = initLetter;
	
	this.voltageB = 0;
	this.voltageC = 0;
	this.voltageD = 0;
	this.radiusB = 0;
	this.radiusC = 0;
	this.radiusD = 0;
	this.headingB = 0;
	this.headingC = 0;
	this.headingD = 0;
	this.warpB = 0;
	this.warpC = 0;
	this.warpD = 0;
	this.posXB = 2000;
	this.posYB = 2000;

	// Reads values from the form fields
	this.readVals = function() {
		if (document.getElementById("ion"+this.letter).checked) {
			this.voltageA = parseInt(document.getElementById("mev"+this.letter).value);
			this.radiusA = parseInt(document.getElementById("rad"+this.letter).value);
			this.headingA = parseInt(document.getElementById("head"+this.letter).value);
			this.posXA = parseInt(document.getElementById("pos"+this.letter+"X").value);
			this.posYA = parseInt(document.getElementById("pos"+this.letter+"Y").value);
		} else {
			this.voltageA = 0;
		}
	}
	
	// Apply values from the results
	this.applyChanges = function() {
		document.getElementById("mev"+this.letter).value = this.voltageD;
		document.getElementById("rad"+this.letter).value = this.radiusD;
		document.getElementById("head"+this.letter).value = this.headingD;
		document.getElementById("pos"+this.letter+"X").value = this.posXB;
		document.getElementById("pos"+this.letter+"Y").value = this.posYB;
	}
	
	// Disable this storm
	this.disableStorm = function () {
		document.getElementById("ion"+this.letter).checked = false;
		document.getElementById("mev"+this.letter).value = 0;
	}

	// Performs all internal calculations
	this.calculateAll = function() {
		var growing = (this.voltageA % 2 != 0);
		
		if (this.voltageA > 0) {
			if (growing) {
				//Voltage Up
				this.voltageB = this.voltageA;
				this.voltageC = this.voltageA + 11;
				if (this.voltageC > 320) {
					this.voltageC++;
				}
				if (this.voltageC > 500) {
					this.voltageC++;
				}
				if (this.radiusA < 3) {
					this.voltageC++;
				}
				
				this.voltageD = this.voltageA + Math.floor((Math.random() * 6)) * 2;
				
				if (Math.random() < 0.01) {
					this.voltageD++;
				}
				
				if (Math.random() < 0.025 && this.voltageD > 320) {
					this.voltageD++;
				}
				
				if (Math.random() < 0.1 && this.voltageD > 500) {
					this.voltageD++;
				}
				
				//Radius Down
				this.radiusB = this.radiusA - 3;
				this.radiusC = this.radiusA;
				this.radiusD = this.radiusB + Math.floor((Math.random() * 4));
				
				if (this.radiusD < 0) {
					this.radiusD = 1 - this.radiusD;
					this.voltageD++;
				}
			} else {
				//Voltage Down
				this.voltageB = Math.round(Math.sqrt(this.voltageA - 14));
				this.voltageC = this.voltageA - 4;
				
				this.voltageD = this.voltageC - Math.floor((Math.random() * 6)) * 2;
				this.radiusD = this.radiusA;
				
				//Pancake effect
				if (Math.random() < .0333) {
					this.voltageD = Math.round(Math.sqrt(this.voltageD));
					this.radiusD = this.radiusD * 2;
				}
				
				//Radius Up
				this.radiusB = this.radiusA;
				this.radiusC = this.radiusA * 2 + 10;
				this.radiusD = this.radiusD + Math.floor((Math.random() * 11));
			}
			
			//Heading change: 10 degrees maximum
			this.headingB = this.headingA - 10;
			this.headingC = this.headingA + 10;
			this.headingD = this.headingB + Math.floor((Math.random() * 21));
			
			//Warp factor
			if (this.voltageA > 250) {
				this.warpB = 8;
				this.warpC = 8;
				this.warpD = 8;
			} else if (this.radiusA < 200) {
				this.warpB = 6;
				this.warpC = 6;
				this.warpD = 6;
			} else {
				this.warpB = 2;
				this.warpC = 4;
				var dieRoll = Math.random();
				
				if (dieRoll < 0.2) {
					this.warpD = 2;
				} else if (dieRoll < 0.68) {
					this.warpD = 3;
				} else {
					this.warpD = 4;
				}
			}
			
			//Movement
			this.posXB = Math.round(this.posXA + Math.cos((90 - this.headingD) / 180 * Math.PI) * Math.pow(this.warpD,2));
			this.posYB = Math.round(this.posYA + Math.sin((90 - this.headingD) / 180 * Math.PI) * Math.pow(this.warpD,2));
		}		
	}

	// Returns calculated values to the display
	this.applyVals = function() {
		if (this.voltageA == Infinity) {
			document.getElementById("mev"+this.letter+"X").innerHTML = this.voltageD;
			document.getElementById("rad"+this.letter+"X").innerHTML = this.radiusD;
			document.getElementById("head"+this.letter+"X").innerHTML = this.headingD;
			document.getElementById("warp"+this.letter+"X").innerHTML = this.warpD;
			document.getElementById("pos"+this.letter+"Z").innerHTML = "(" + this.posXB + "," + this.posYB + ")";
		} else if (this.voltageA > 0) {
			document.getElementById("mev"+this.letter+"X").innerHTML = this.voltageD + " (" + this.voltageB + " - " + this.voltageC + ")";
			document.getElementById("rad"+this.letter+"X").innerHTML = this.radiusD + " (" + this.radiusB + " - " + this.radiusC + ")";
			document.getElementById("head"+this.letter+"X").innerHTML = this.headingD + "&deg; (" + this.headingB + " - " + this.headingC + ")";
			
			if (this.warpB == this.warpC) {
				document.getElementById("warp"+this.letter+"X").innerHTML = this.warpD;
			} else {
				document.getElementById("warp"+this.letter+"X").innerHTML = this.warpD + " (" + this.warpB + " - " + this.warpC + ")";
			}

			document.getElementById("pos"+this.letter+"Z").innerHTML = "(" + this.posXB + "," + this.posYB + ")";
		} else {
			document.getElementById("mev"+this.letter+"X").innerHTML = "";
			document.getElementById("rad"+this.letter+"X").innerHTML = "";
			document.getElementById("head"+this.letter+"X").innerHTML = "";
			document.getElementById("warp"+this.letter+"X").innerHTML = "";
			document.getElementById("pos"+this.letter+"Z").innerHTML = "";
		}
	}
}

/* ------------------------------------------------------------------------ */

// Merged storm's X and Y position - also dependent on voltage
function mergePos(voltA, voltB, posA, posB) {
	return Math.round((posA * voltB + posB * voltA) / (voltA + voltB));
}

// Merged storm's voltage
function mergeVolts(voltA, voltB) {
	return Math.floor(Math.max(voltA, voltB) + Math.sqrt(Math.min(voltA, voltB)));
}

// Merged storm's radius
function mergeRadii(voltA, voltB, radA, radB) {
	return(voltA > voltB ? Math.floor(radA + Math.sqrt(radB)) : Math.floor(radB + Math.sqrt(radA)));
}

// Merged storm's heading and warp
function mergeMovement(voltA, voltB, moveA, moveB) {
	return (voltA > voltB ? moveA : moveB);
}

/* ------------------------------------------------------------------------ */

function applyResults() {
	if (ionStorms[2].voltageA == Infinity) {
		ionStorms[1].disableStorm();
		
		ionStorms[0].voltageD = ionStorms[2].voltageD;
		ionStorms[0].radiusD = ionStorms[2].radiusD;
		ionStorms[0].headingD = ionStorms[2].headingD;
		ionStorms[0].posXB = ionStorms[2].posXB;
		ionStorms[0].posYB = ionStorms[2].posYB;
		
		ionStorms[0].applyChanges();
	} else {
		if (ionStorms[0].voltageA > 0) {
			ionStorms[0].applyChanges();
		}
		if (ionStorms[0].voltageD <= 0 || !isFinite(ionStorms[0].voltageD)) {
			ionStorms[0].disableStorm();
		}

		if (ionStorms[1].voltageA > 0) {
			ionStorms[1].applyChanges();
		}
		if (ionStorms[1].voltageD <= 0 || !isFinite(ionStorms[1].voltageD)) {
			ionStorms[1].disableStorm();
		}
	}
	
	compute();
}