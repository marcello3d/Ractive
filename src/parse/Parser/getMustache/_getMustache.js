define([
	'config/types',
	'parse/Parser/getMustache/MustacheStub',
	'parse/Parser/getMustache/SectionStub'
], function (
	types,
	MustacheStub,
	SectionStub
) {

	'use strict';

	return function ( token ) {
		if ( token.type === types.MUSTACHE || token.type === types.TRIPLE ) {
			if ( token.mustacheType === types.SECTION ||
				 token.mustacheType === types.SECTION_IF ||
				 token.mustacheType === types.SECTION_UNLESS ||
				 token.mustacheType === types.SECTION_WITH ||
				 token.mustacheType === types.SECTION_EACH ||
				 token.mustacheType === types.SECTION_TRY ||
				 token.mustacheType === types.INVERTED) {
				return new SectionStub( token, this );
			}

			return new MustacheStub( token, this );
		}
	};

});
