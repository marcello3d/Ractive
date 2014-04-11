define([
	'config/types',
	'utils/normaliseKeypath',
	'parse/Parser/utils/jsonifyStubs',
	'parse/Parser/getMustache/KeypathExpressionStub',
	'parse/Parser/getMustache/ExpressionStub'
], function (
	types,
	normaliseKeypath,
	jsonifyStubs,
	KeypathExpressionStub,
	ExpressionStub
) {

	'use strict';

	var SectionStub = function ( firstToken, parser ) {
		var next;

		this.ref = firstToken.ref;
		this.indexRef = firstToken.indexRef;

		this.type = firstToken.mustacheType;
		this.inverted = ( this.type === types.INVERTED );
		if (this.inverted) {
			this.type = types.SECTION;
		}

		var openTag = firstToken.source;
		var closeTag = firstToken.source.substr(1);

		if ( firstToken.keypathExpression ) {
			this.keypathExpr = new KeypathExpressionStub( firstToken.keypathExpression );
		}

		if ( firstToken.expression ) {
			this.expr = new ExpressionStub( firstToken.expression );
			closeTag = '()';
		}


		switch (firstToken.mustacheType) {
			case types.SECTION_IF:
				closeTag = 'if';
				break;
			case types.SECTION_UNLESS:
				closeTag = 'unless';
				break;
			case types.SECTION_EACH:
				closeTag = 'each';
				break;
			case types.SECTION_WITH:
				closeTag = 'with';
				break;
		}

		parser.pos += 1;

		this.items = [];
		next = parser.next();

		while ( next ) {
			if ( next.mustacheType === types.CLOSING ) {
				validateClosing(this, openTag, closeTag, next);
				parser.pos += 1;
				break;
			}

			this.items.push( parser.getStub() );
			next = parser.next();
		}

	};

	function validateClosing(stub, openTag, closeTag, token) {
		var closing = normaliseKeypath(token.ref.trim());

		if (normaliseKeypath(closeTag.trim()).substr(0, closing.length) !== closing &&
			normaliseKeypath(openTag.substr(1).trim()).substr(0, closing.length) !== closing) {

			throw new Error('Could not parse template: Illegal closing section for {{' + openTag + '}}: ' +
				'{{/' + closing + '}}. Expected {{/' + closeTag + '}} on line ' + token.getLinePos());

		}
	}
						
	SectionStub.prototype = {
		toJSON: function ( noStringify ) {
			var json;

			if ( this.json ) {
				return this.json;
			}

			json = { t: this.type };

			if ( this.ref ) {
				json.r = this.ref;
			}

			if ( this.indexRef ) {
				json.i = this.indexRef;
			}

			if ( this.inverted ) {
				json.n = true;
			}

			if ( this.expr ) {
				json.x = this.expr.toJSON();
			}

			if ( this.keypathExpr ) {
				json.kx = this.keypathExpr.toJSON();
			}

			if ( this.items.length ) {
				json.f = jsonifyStubs( this.items, noStringify );
			}

			this.json = json;
			return json;
		},

		toString: function () {
			// sections cannot be stringified
			return false;
		}
	};

	return SectionStub;

});
