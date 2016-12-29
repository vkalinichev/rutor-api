'use strict'

const request = require( 'request' )
const cheerio = require( 'cheerio' )

let options = {
    base: 'http://tor-ru.net/search/',
    page: 0,
    category: 0,
    method: 100,
    order: 0
}

exports.config = ( newOptions ) =>
    options = Object.assign( {}, options, newOptions )

exports.search = ( needle ) =>
    fetch( getFullUrl( needle ) )
        .then( parse )

const fetch = ( url ) =>
    new Promise( ( resolve, reject ) =>
        request( url, ( err, res, body ) => {
            if ( err ) reject( err )
            if ( res.statusCode !== 200 ) reject( new Error( `Unsafe status code (${ res.statusCode }) when making request` ) )
            resolve( body )
        } )
    )

const getBaseUrl = () => {
    const { page, category, method, order } = options
    if ( !page && !category && !method && !order ) return options.base
    return options.base + `${ page }/${ category }/${ method }/${ order }/`
}

const getFullUrl = ( needle ) =>
    getBaseUrl() + encodeURIComponent( needle )

const parse = function( html ) {

    let results = []
    let $ = cheerio.load( html )

    $( '#index' ).find( 'tr' ).each( function( i, elem ) {

        if ( $( elem ).attr( 'class' ) === 'backgr' ) return true

        const td = $( elem ).find( 'td' )
        const date = $( td.get( 0 ) )
        const link = date.next()
        const comments = link.next()
        const size = td.length === 4 ? link.next() : comments.next()
        const peers = size.next()

        results.push( {
            date: date.text(),
            magnet: $( link.find( 'a' ).get( 1 ) ).attr( 'href' ),
            title: $( link.find( 'a' ).get( 2 ) ).text(),
            size: size.html().replace( '&#xA0;', ' ' ),
            seeds: parseInt( $( peers ).find( 'span.green' ).text() ),
            peers: parseInt( $( peers ).find( 'span.red' ).text() ),
            url: options.base + $( link.find( 'a' ).get( 2 ) ).attr( 'href' )
        } )
    } )

    return results
}
