define([
	'config/types',
	'parse/Parser/getMustache/ExpressionStub'
], function (
	types,
	ExpressionStub
) {

	'use strict';

	var KeypathExpressionStub;

	KeypathExpressionStub = function ( expr, parser, token ) {
		this.json = {
			r: expr.r,
			m: expr.m.map( function(member) {
				return jsonify( member, parser );
			})
		};

		if ( parser.includeTraces && token ) {
			this.json.c = token.getLinePos().toJSON();
		}
	};

	KeypathExpressionStub.prototype = {
		toJSON: function () {
			return this.json;
		}
	};

	return KeypathExpressionStub;

	function jsonify ( member, parser ) {
		// Straightforward property, e.g. `foo.bar`?
		if ( member.n ) {
			return member.n;
		}

		// String or number literal, e.g. `foo["bar"]` or `foo[1]`?
		if ( member.x.t === types.STRING_LITERAL || member.x.t === types.NUMBER_LITERAL ) {
			return member.x.v;
		}

		// Straightforward reference, e.g. `foo[bar]`?
		if ( member.x.t === types.REFERENCE ) {
			return member.x;
		}

		// If none of the above, we need to process the AST
		return new ExpressionStub( member.x, parser ).toJSON();
	}

});
