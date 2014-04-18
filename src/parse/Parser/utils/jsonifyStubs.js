define([ ], function ( ) {

	'use strict';

	return function ( items ) {
		var mapped;

		mapped = items.map( function ( item ) {
			return item.toJSON( );
		});

		if ( mapped.length === 1 && typeof mapped[0] === 'string') {
			return mapped[0];
		}

		return mapped;
	};

});
