const api = require( './src' )

api
    .search( '2160p' )
    .then( results => console.log( 'results:', results.length ) )
