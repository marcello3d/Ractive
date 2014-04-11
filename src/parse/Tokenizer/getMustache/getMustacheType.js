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
			if (tokenizer.getStringMatch('if ')) {
				type = types.SECTION_IF;
			} else if (tokenizer.getStringMatch('with ')) {
				type = types.SECTION_WITH;
			} else if (tokenizer.getStringMatch('each ')) {
				type = types.SECTION_EACH;
			} else if (tokenizer.getStringMatch('unless ')) {
				type = types.SECTION_UNLESS;
			}
		}
		return type;
	};

});
