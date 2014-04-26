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

		if ( parser.includeTraces ) {
			this.trace = firstToken.getLinePos();
		}
		this.ref = firstToken.ref;
		this.indexRef = firstToken.indexRef;

		this.type = firstToken.mustacheType;
		this.inverted = ( this.type === types.INVERTED );
		if ( this.inverted ) {
			this.type = types.SECTION;
		}

		var openTag = firstToken.source;
		var closeTag = firstToken.source.substr(1);

		if ( firstToken.keypathExpression ) {
			this.keypathExpr = new KeypathExpressionStub( firstToken.keypathExpression, parser, firstToken );
		}

		if ( firstToken.expression ) {
			this.expr = new ExpressionStub( firstToken.expression, parser, firstToken );
			closeTag = '()';
		}


		switch ( this.type ) {
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
			case types.SECTION_TRY:
				if (this.expr || this.keypathExpr) {
					throw new Error( "Unexpected arguments to {{#try}} on line " + firstToken.getLinePos() );
				}
				closeTag = 'try';
				break;
		}

		parser.pos += 1;

		this.items = [];
		this.elseItems = [];
		next = parser.next();

		var itemsOrElseItems = this.items;

		while ( next ) {
			if ( next.mustacheType === types.INTERPOLATOR && next.source === 'else') {
				switch (this.type) {
					case types.SECTION_IF:
					case types.SECTION_EACH:
					case types.SECTION_TRY:
						itemsOrElseItems = this.elseItems;
						parser.getStub(); // throw away
						next = parser.next();
						continue;

					case types.SECTION_UNLESS:
					case types.SECTION_WITH:
						throw new Error( "{{else}} not allowed in {{" + openTag + "}} on line " + next.getLinePos() );
				}
			} else if ( next.mustacheType === types.CLOSING ) {
				validateClosing( openTag, closeTag, next );
				parser.pos += 1;
				break;
			}

			itemsOrElseItems.push( parser.getStub() );
			next = parser.next();
		}
	};

	function validateClosing(openTag, closeTag, token) {
		var closing = normaliseKeypath( token.ref.trim() );

		if ( normaliseKeypath( closeTag.trim()).substr(0, closing.length ) !== closing &&
			 normaliseKeypath( openTag.substr(1).trim()).substr(0, closing.length ) !== closing ) {

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

			json = {
				t: this.type
			};

			if ( this.trace ) {
				json.c = this.trace.toJSON();
			}

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

			if ( this.elseItems.length ) {
				json.l = jsonifyStubs( this.elseItems, noStringify );
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
