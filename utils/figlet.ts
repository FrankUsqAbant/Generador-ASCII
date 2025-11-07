/*
FIGlet.js (a FIGment engine)
Copyright (c) 2010, Scott Gonzalez
Personal use is granted, commercial use requires licensing.
<https://github.com/scottgonzalez/figlet-js>
*/

// This file has been modified from its original UMD format to be a standard ES module.
// All credit for the FIGlet logic goes to the original author, Scott Gonzalez.

const factory = () => {
	let figlet: any = {};

	figlet.fonts = {};
	figlet.options = {
		font: "Standard",
		horizontalLayout: "default",
		verticalLayout: "default",
		width: 80,
		whitespaceBreak: false,
	};

	/*
	A FIGfont has a header line followed by font data.
	The header line contains the signature, hardblank, height, baseline, max length,
	old layout, comment lines, print direction, full layout, and codetag count.
	- The signature is "flf2a".
	- The hardblank is a character that is used to represent a blank space in the font.
	- The height is the number of rows in each character.
	- The baseline is the number of rows from the top of the character to the baseline.
	- The max length is the maximum width of a character.
	- The old layout specifies the kerning and smushing rules.
	- The comment lines is the number of lines of comments that follow the header.
	- The print direction is 0 for left-to-right, 1 for right-to-left.
	- The full layout...
	- The codetag count...

	The font data is comprised of a number of characters, followed by a series of characters
	for the code tagged characters.
	Each character is composed of a number of rows, as specified by the height.
	Each row is composed of a number of characters, up to the max length.
	The end of each row is marked by a special character.
	The end of each character is marked by two of the same special character.
	*/

	figlet.parseFont = function (name, fn) {
		if (name in this.fonts) {
			return;
		}

		this.fonts[name] = (function (font) {
			let settings = font.substring(0, font.indexOf("\n")).split(" "),
				height = parseInt(settings[1], 10),
				maxLength = parseInt(settings[3], 10),
				oldLayout = parseInt(settings[4], 10),
				commentLines = parseInt(settings[5], 10),
				fontData = font.substring(
					font.indexOf("\n") + 1,
					font.length
				),
				lines = fontData.split("\n"),
				comments = lines
					.splice(0, commentLines)
					.join("\n"),
				chars = {},
				char_i = 0,
				end_char,
				terminator_char_1,
				terminator_char_2;

			// determine the end character
			for (let i = lines.length - 2; i > 0; i--) {
				if (lines[i].indexOf("@") !== -1) {
					terminator_char_1 = lines[i]
						.substring(lines[i].indexOf("@") - 1)
						.substring(0, 1);
					terminator_char_2 = lines[i]
						.substring(lines[i].indexOf("@"))
						.substring(0, 1);
					if (terminator_char_1 === terminator_char_2) {
						end_char = terminator_char_1;
						break;
					}
				}
			}

			function get_char_lines(start) {
				let char_lines = lines.slice(start, start + height);
				for (let i = 0; i < char_lines.length; i++) {
					if (char_lines[i].indexOf(end_char) !== -1) {
						char_lines[i] = char_lines[i].substring(
							0,
							char_lines[i].indexOf(end_char)
						);
					}
				}
				return char_lines;
			}

			let i = 0;
			// normal characters
			for (char_i = 32; char_i <= 126; char_i++) {
				chars[char_i] = get_char_lines(i);
				i += height;
			}

			// german characters
			const german_chars = [196, 214, 220, 228, 246, 252, 223];
			if (i + (german_chars.length * height) <= lines.length) {
				for (let j = 0; j < german_chars.length; j++) {
					chars[german_chars[j]] = get_char_lines(i);
					i += height;
				}
			}

			// TODO: code tagged characters

			return {
				height: height,
				maxLength: maxLength,
				oldLayout: oldLayout,
				comments: comments,
				chars: chars,
			};
		})(fn);
	};

	figlet.text = function (txt, options, fn) {
		if (typeof options === "function") {
			fn = options;
			options = null;
		}

		options = options || {};
		for (let key in this.options) {
			if (options[key] === undefined) {
				options[key] = this.options[key];
			}
		}

		if (!this.fonts[options.font]) {
			// font is not loaded
			// TODO: load font
			return;
		}

		let font = this.fonts[options.font],
			output = [],
			char_width,
			output_width = 0;
		for (let i = 0; i < font.height; i++) {
			output[i] = "";
		}

		// layout
		let smush = (function () {
			let cache = {};
			return function (a, b) {
				if (a === " " || b === " ") {
					return a === " " ? b : a;
				}

				if (a in cache && b in cache[a]) {
					return cache[a][b];
				}

				// rule 1: equal character smushing
				if (a === b) {
					return a;
				}

				// rule 2: underscore smushing
				let rule2_a = a === "_",
					rule2_b = b === "_",
					rule2_chars = "|/\\[]{}()<>";
				if (
					rule2_a &&
					rule2_chars.indexOf(b) !== -1
				) {
					return b;
				}
				if (
					rule2_b &&
					rule2_chars.indexOf(a) !== -1
				) {
					return a;
				}

				// rule 3: hierarchy smushing
				let rule3_hierarchy = "| /\\ [] {} () <>",
					rule3_a = rule3_hierarchy.indexOf(a),
					rule3_b = rule3_hierarchy.indexOf(b);
				if (
					rule3_a !== -1 &&
					rule3_b !== -1
				) {
					if (rule3_a !== rule3_b) {
						return rule3_hierarchy.charAt(
							Math.max(rule3_a, rule3_b)
						);
					}
				}

				// rule 4: opposite pair smushing
				let rule4_pairs = {
						"[": "]",
						"]": "[",
						"{": "}",
						"}": "{",
						"(": ")",
						")": "(",
					},
					rule4_a = a in rule4_pairs,
					rule4_b = b in rule4_pairs;
				if (rule4_a && rule4_pairs[a] === b) {
					return "|";
				}

				// rule 5: big X smushing
				let rule5_a = a === "/",
					rule5_b = b === "\\";
				if (rule5_a && rule5_b) {
					return "|";
				}
				if (a === "\\" && b === "/") {
					return "Y";
				}
				if (a === ">" && b === "<") {
					return "X";
				}

				// rule 6: hardblank smushing
				// TODO: hardblank smushing

				// no smushing
				return null;
			};
		})();

		for (let i = 0, len = txt.length; i < len; i++) {
			let char_code = txt.charCodeAt(i),
				char_data = font.chars[char_code];
			if (!char_data) {
				continue;
			}

			char_width = 0;
			for (
				let j = 0,
					char_data_len = char_data.length;
				j < char_data_len;
				j++
			) {
				if (char_data[j].length > char_width) {
					char_width = char_data[j].length;
				}
			}

			// kerning/smushing
			if (output_width > 0) {
				let overlap = 0,
					smush_char,
					smush_mode = 0,
					a,
					b;

				if (
					(font.oldLayout & 1) > 0
				) {
					// kerning
					let min_overlap = char_width;
					for (
						let j = 0;
						j < font.height;
						j++
					) {
						let len_a =
								output[j].length,
							len_b =
								char_data[
									j
								].length,
							char_a =
								output[
									j
								].charAt(
									len_a - 1
								),
							char_b =
								char_data[
									j
								].charAt(0);
						if (
							len_a > 0 &&
							len_b > 0 &&
							char_a !== " " &&
							char_b !== " "
						) {
							min_overlap = 0;
							break;
						}
						let current_overlap = 0;
						while (
							current_overlap <
							len_a
						) {
							if (
								output[
									j
								].charAt(
									len_a -
										1 -
										current_overlap
								) !== " "
							) {
								break;
							}
							current_overlap++;
						}
						if (
							current_overlap <
							min_overlap
						) {
							min_overlap =
								current_overlap;
						}
					}
					overlap = min_overlap;
				} else if (
					(font.oldLayout & 2) > 0
				) {
					// smushing
					let max_overlap = 0;
					for (
						let j = 0;
						j < font.height;
						j++
					) {
						let len_a =
								output[j].length,
							len_b =
								char_data[
									j
								].length;
						if (
							len_a === 0 ||
							len_b === 0
						) {
							continue;
						}
						let current_overlap = 0;
						while (
							current_overlap <
								len_a &&
							current_overlap <
								len_b
						) {
							a = output[
								j
							].charAt(
								len_a -
									1 -
									current_overlap
							);
							b = char_data[
								j
							].charAt(
								current_overlap
							);
							if (
								a !== " " ||
								b !== " "
							) {
								break;
							}
							current_overlap++;
						}
						if (
							current_overlap >
							max_overlap
						) {
							max_overlap =
								current_overlap;
						}
					}
					overlap = max_overlap + 1;
				}

				if (overlap > 0) {
					for (
						let j = 0;
						j < font.height;
						j++
					) {
						let piece =
								char_data[j],
							part_a = output[
								j
							].substring(
								0,
								output[
									j
								].length -
									overlap
							),
							part_b = char_data[
								j
							].substring(
								overlap
							);
						smush_char = smush(
							output[
								j
							].charAt(
								output[
									j
								].length -
									overlap
							),
							char_data[j].charAt(
								overlap - 1
							)
						);
						output[j] =
							part_a +
							(smush_char || "") +
							part_b;
					}
				}
			}

			for (let j = 0; j < font.height; j++) {
				if (!output[j]) {
					output[j] = "";
				}
				if (!char_data[j]) {
					char_data[j] = "";
				}
				output[j] += char_data[j];
			}
			output_width = output[0].length;
		}

		let result = output.join("\n");
		if (fn) {
			fn(null, result);
		} else {
			return result;
		}
	};

	return figlet;
};

const figlet = factory();
export default figlet;