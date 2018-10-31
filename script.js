"use strict";

class StickPonyGenerator {
	constructor() {
		this.colors = {
			"mane-gradient": [],
			"tail-gradient": [],
		};
		
		this.svg = document.querySelector("#preview svg");
		
		this.bodyColor = this.setUpColor("#body-color");
		this.maneColor = this.setUpColor("#mane-color");
		this.tailColor = this.setUpColor("#tail-color");
		this.maneGradient = this.setUpGradient("#mane-gradient");
		this.tailGradient = this.setUpGradient("#tail-gradient");
		
		$('[name="mane-color"], [name="tail-color"], #separate-tail-color').change(() => this.onColorChange());
		
		$('#hair input').change(() => this.onStyleChange());
		this.onStyleChange();
		
		$('[name="race"]').change(() => this.onRaceChange());
		this.onRaceChange();
	}
	
	setUpColor(selector) {
		var el = $(selector);
		var id = el.attr("id");
		this.colors[id] = el.css("backgroundColor");
		
		el.addClass("color-selector");
		el.ColorPicker({
			color: this.colors[id].substr(1),
			onChange: (hsb, hex, rgb) => {
				el.css('backgroundColor', '#' + hex);
				
				this.colors[id] = '#' + hex;
				this.onColorChange();
			},
			onHide: () => {
				el.ColorPickerSetColor(this.colors[id].substr(1));
			},
		});
		
		return el;
	}
	
	setUpGradient(selector) {
		var el = $(selector);
		el.addClass("gradient-selector");
		el.gradientPicker({
			controlPoints: [
				"#FF0000 0%",
				"#FFFF00 20%",
				"#00FF00 40%",
				"#00FFFF 60%",
				"#0000FF 80%",
				"#8000A0 100%"
			],
			
			change: (points, styles) => {
				this.colors[el.attr("id")] = points;
				this.onColorChange();
			},
		});
		return el;
	}
	
	onColorChange() {
		var gradientMane = document.getElementById("gradient-mane");
		var gradientTail = document.getElementById("gradient-tail");
		
		for(let element of this.svg.getElementsByClassName("coat")) {
			element.style.fill = this.colors["body-color"];
		}
		
		var gradientMane = ($("input[name='mane-color']:checked").val() == "gradient")
			? this.colors["mane-gradient"]
			: [{position: 0, color: this.colors["mane-color"],}];
		
		var gradientTail = !$("#separate-tail-color").prop("checked")
			? gradientMane
			: ($("input[name='tail-color']:checked").val() == "gradient")
			? this.colors["tail-gradient"]
			: [{position: 0, color: this.colors["tail-color"],}];
		
		this.setGradient("gradient-mane", gradientMane);
		this.setGradient("gradient-tail", gradientTail);
	}
	
	setGradient(id, stops) {
		var gradient = document.getElementById(id);
		gradient.innerHTML = "";
		gradient.removeAttribute("xlink:href");
		
		for(let stop of stops) {
			let child = gradient.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "stop"));
			child.setAttribute("style", "stop-color: " + stop.color);
			child.setAttribute("offset", stop.position);
		}
	}
	
	onStyleChange() {
		let maneStyle = $("input[name='mane-style']:checked").val()
		let tailStyle = $("input[name='tail-style']:checked").val()
		
		if(!$("#separate-tail-style").prop("checked"))
			tailStyle = maneStyle;
		
		for(let element of this.svg.getElementsByClassName("mane")) {
			element.style.display = element.classList.contains(maneStyle) ? "" : "none";
		}
		for(let element of this.svg.getElementsByClassName("tail")) {
			element.style.display = element.classList.contains(tailStyle) ? "" : "none";
		}
	}
	
	onRaceChange() {
		let race = $("input[name='race']:checked").val()
		
		document.getElementById("horn").style.display = race == "unicorn" || race == "alicorn" ? "" : "none";
		document.getElementById("wing").style.display = race == "pegasus" || race == "alicorn" ? "" : "none";
	}
}

function waitUntilLoaded() {
	return new Promise(release => addEventListener("load", release));
}

function loadSVG() {
	return fetch("template.svg")
	.then(response => response.text())
	.then(text => (new DOMParser).parseFromString(text, "text/xml"))
	.then(doc => {
		var svg = doc.documentElement;
		doc.removeChild(svg);
		
		document.getElementById("preview").appendChild(svg);
	});
}

Promise.all([
	loadSVG(),
	waitUntilLoaded(),
])
.then(() => {
	window.generator = new StickPonyGenerator;
})
.catch(console.error);

