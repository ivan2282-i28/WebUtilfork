/* eslint-env jquery */
$(() => {
	/* eslint-disable max-len */
	const HELP_TEXT = Object.freeze({
		'#errortext': "You wrote too much. Only three lines of text can be rendered in one dialogue box, anything else would overflow.",
		'#message': "Write a message here to display in the dialogue box with Niko's face.",
		'#faces': "Pick an expression for Niko to make, to accompany your message!",
		'#photoshop': "This is the canvas where the composite image is actually drawn. Right click to save it or copy as an image now.",
		'#render': "This is the fully-rendered image, built off the canvas from the composite elements. You can save it or copy to use now.",
	});
	/* eslint-enable max-len */
	const FACES = {
		Niko: [
			'niko_normal',
			'niko2',
			'niko3',
			'niko4',
			'niko5',
			'niko6',
			'niko_disgusted',
			'niko_distressed',
			'niko_distressed2',
			'niko_distressed_talk',
			'niko_shock',
			'niko_shocked',
			'niko_what',
			'niko_what2',
			'niko_wtf',
			'niko_wtf2',
			'niko_yawn',
			'niko_eyeclosed',
			'niko_eyeclosed_sigh',
			'niko_sunglasses',
			'niko_popcorn',
			'niko_smile',
			'niko_owo',
			'niko_83c',
			'niko_owoc',
			'niko_uwu',
			'niko_xwx',
			'niko_wink',
			'niko_winkc',
			'niko_winkp',
			'niko_derp',
			'niko_speak',
			'niko_pancakes',
			'niko_surprise',
			'niko_shy',
			'niko_blush',
			'niko_blushier',
			'niko_oof',
			'niko_ouch',
			'niko_thinking',
			'niko_fingerguns',
			'niko_gasmask',
			'niko_teary',
			'niko_distressed_cry',
			'niko_crying',
			'niko_wipe_tears',
			'niko_upset',
			'niko_upset_meow',
			'niko_upset2',
			'niko_really',
		],
		Other: ['rqst_other_sonicastle'],
	};
	const initialHelpText = $('#helpText').html();
	let unhelpTimer = false;
	const setHelpText = function(text) {
		if (typeof unhelpTimer != 'boolean') {
			clearTimeout(unhelpTimer);
		}
		$('#helpText').html(text || initialHelpText);
	};
	const startClearHelpTimer = function() {
		unhelpTimer = setTimeout(setHelpText, 500);
	};
	const help = (selector, text) => $(selector).hover(
		setHelpText.bind(setHelpText, text),
		startClearHelpTimer
	);
	$('.soften, textarea').addClass('ui-corner-all');
	const error = $('#errortext');
	const canvas = document.querySelector('#photoshop');
	const draw = canvas.getContext('2d');
	const image = document.querySelector('#render');
	const background = new Image();
	const message = document.querySelector('#message');
	const refreshRender = () => {
		const MAX_LINE_LENGTH = 465; // Magic. Do not change.
		draw.clearRect(0, 0, canvas.width, canvas.height);
		if (background.complete) {
			draw.drawImage(background, 0, 0);
		}
		else {
			// If we haven't got the background image loaded in yet, cancel the render entirely
			return;
		}
		// Render the chosen FACE at X=496 Y=16
		// Technically, any 96x96 image will do... so this could be tweakable for future ideas pretty easily
		if (document.querySelector('#selected')) {
			try {
				draw.drawImage(document.querySelector('#selected'), 496, 16);
			}
			catch (err) {
				console.error(err);
				console.dir(document.querySelector('#selected'));
			}
		}
		// Render the text from X=20 Y=17 to X=485 (465px)
		// This 465px is where the magic MAX_LINE_LENGTH constant came from, and why it's that exact number
		// The top/left start point and font size were carefully determined through testing in GIMP to be the actual values
		// used in the game itself. The multi-line splitting was done manually for a closest-approximation look, but if
		// someone (hi there!) can send me the correct values, it's easy enough to update them in here.
		if (message.value) {
			const lines = message.value.split("\n"); // Split on actual line breaks to keep any user-defined lines intact
			for (let lineNo = 0; lineNo < lines.length; lineNo++) { // Iterate through the lines, NOT using a foreach loop
				if (lineNo >= 3) { // We can only fit three lines into a single image, more will get cut off
					error.show();
					break;
				}
				else {
					error.hide();
				}
				let line = lines[lineNo];
				// Here's a bit of magic - it adds line breaks where needed, but still maintains the user's original line
				// breaks too! If the rendered line is/would be too wide, we split it into words (splitting on whitespace,
				// although I could do more) and slowly snip words off the end, one by one, until the line is within the max
				// width. Then, all of the words that had to be removed are spliced into the lines array immediately
				// following the current line, which is why we had to use the basic for loop above instead of any kind of
				// for/in or for/of method instead - the array is being modified inside the loop.
				if (draw.measureText(line).width > MAX_LINE_LENGTH) {
					const words = line.split(/\s/u);
					for (let word = words.length; word > 0; word--) {
						const left = words.slice(0, word).join(" ");
						if (draw.measureText(left).width <= MAX_LINE_LENGTH) {
							line = left;
							lines.splice(lineNo + 1, 0, words.slice(word).join(" "));
							break;
						}
					}
				}
				// At this point, the line is either within the max width, or there's no whitespace to split on.
				// The height is a base of 17 pixels down, plus another 28 pixels for every line ABOVE this one.
				// If the line is still too wide (but has no whitespace to split on) then the text is just smushed.
				draw.fillText(line, 20, 17 + lineNo * 28, MAX_LINE_LENGTH);
			}
		}
		else {
			error.hide();
		}
		// See if we can render it to a proper image element, so people can select it on mobile and all browsers
		// (IE is not a browser, do not complain about it being broken)
		try {
			image.src = canvas.toDataURL();
			image.style.display = 'block';
			canvas.style.display = 'none';
		}
		catch (err) {
			image.style.display = 'none';
			canvas.style.display = 'block';
		}
		// That's in a try/catch because if you're running this locally, not off a web server, then for security reasons the
		// canvas contents can't be retrieved as a data URL. In order to sneak around that little issue, the image element
		// is only shown (and the canvas hidden automatically) if we CAN get the data URL. Otherwise, if we can't, the canvas
		// element is shown and the image is automatically hidden.
	};
	const faceListContainer = $('#faces');
	for (const [
		title,
		filenames,
	] of Object.entries(FACES)) {
		const header = $('<div class="face-header"></div>');
		const faceList = $('<div class="face-list"></div>');
		header.text(title);
		for (const filename of filenames) {
			const face = $(`<img class="face" src="img/expressions/${filename}.png" />`);
			faceList.append(face);
		}
		header.on('click', () => {
			const metalist = faceListContainer
				.children('.face-list');
			const headerlist = faceListContainer
				.children('.face-header');
			if (faceList.is(':visible')) {
				metalist
					.hide()
					.first()
					.show();
				headerlist
					.addClass('collapsed')
					.first()
					.removeClass('collapsed');
			}
			else {
				metalist.hide();
				headerlist.addClass('collapsed');
				faceList.show();
				header.removeClass('collapsed');
			}
		});
		faceListContainer.append(header, faceList);
	}
	draw.font = '20pt TerminusTTF'; // Loaded off the css/ directory, in case you don't have it natively
	draw.textBaseline = 'top';
	draw.fillStyle = '#ffffff';
	background.addEventListener('load', refreshRender, false); // As soon as the background image loads, try to render
	background.src = "img/niko-background.png";
	faceListContainer
		.children('.face-header')
		.not(':first()')
		.click();
	faceListContainer
		.find('img')
		.on('click', function setSelectedFace() {
			$('.face#selected').attr('id', '');
			this.id = 'selected';
			refreshRender();
		});
	message.addEventListener('input', refreshRender);
	message.focus();
	for (const selector in HELP_TEXT) {
		if (Object.prototype.hasOwnProperty.call(HELP_TEXT, selector)) {
			help(selector, HELP_TEXT[selector]);
		}
	}
});

