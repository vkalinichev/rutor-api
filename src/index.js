'use strict'

const request = require( 'request' )
const cheerio = require( 'cheerio' )

let searchOptions = {
    base: 'http://new-ru.org/search/',
    page: 0,
    category: 0,
    method: 100,
    order: 0
}

exports.config = ( newOptions ) =>
    searchOptions = Object.assign( {}, searchOptions, newOptions )

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
    const { page, category, method, order } = searchOptions
    if ( !page && !category && !method && !order ) return searchOptions.base
    return searchOptions.base + `${ page }/${ category }/${ method }/${ order }/`
}

const getFullUrl = ( needle ) =>
    getBaseUrl() + encodeURIComponent( needle )

const parse = function( html ) {
    let $ = cheerio.load( html )

    return $( '#index' ).find( 'tr:not(.backgr)' ).map( ( i, elem ) => {
        const $td = $( elem ).find( 'td' )
        const $links = $( $td[1] ).find( 'a' )
        const $peers = $( $td[ $td.length - 1 ] )

        return {
            title: $( $links[ 2 ] ).text(),
            date: $( $td[ 0 ] ).text(),
            size: $( $td[ $td.length - 2 ] ).html().replace( '&#xA0;', ' ' ),
            url: $( $links[ 2 ] ).attr( 'href' ),
            magnet: $( $links[ 0 ] ).attr( 'href' ),
            torrent: $( $links[ 1 ] ).attr( 'href' ),
            seeds: parseInt( $peers.find( '.green' ).text() ),
            leaches: parseInt( $peers.find( '.red' ).text() )
        }
    } ).get()
}
