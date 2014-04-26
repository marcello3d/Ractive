define([ 'config/types' ], function ( types ) {

	'use strict';

	var mustacheTypes = {
		'#': types.SECTION,
		'^': types.INVERTED,
		'/': types.CLOSING,
		'>': types.PARTIAL,
		'!': types.COMMENT,
		'&': types.TRIPLE
	};

	return function ( tokenizer ) {
        var str = tokenizer.str;
		var type = mustacheTypes[ str.charAt( tokenizer.pos ) ];

		if ( !type ) {
			return null;
		}

		tokenizer.pos += 1;

		if (type === types.SECTION) {
			var match = tokenizer.getRegexMatch(/^\w+\b/);
			if (match) {
				tokenizer.pos += match[0].length;
				switch (match[0]) {
					case 'if':
						return types.SECTION_IF;
					case 'with':
						return types.SECTION_WITH;
					case 'each':
						return types.SECTION_EACH;
					case 'unless':
						return types.SECTION_UNLESS;
					case 'try':
						return types.SECTION_TRY;
				}
				tokenizer.pos -= match[0].length;
			}
		}
		return type;
	};

});
