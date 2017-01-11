const api = require( './src' )

api
    .search( 'DCPRip 2160p' )
    .then( results => console.log( 'results:', results ) )
