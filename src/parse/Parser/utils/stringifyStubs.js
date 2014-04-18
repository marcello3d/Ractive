define( function () {

	'use strict';

	return function ( items ) {
		if ( !items ) {
			return '';
		}

		if ( items.length === 1 && typeof items[0] === 'string') {
			return items[0];
		}
		return '';
	};

});
