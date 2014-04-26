define( function () {

	'use strict';

	return function ( regex, maxlength ) {
		return regex.exec( this.str.substr( this.pos, maxlength ) );
	};

});
