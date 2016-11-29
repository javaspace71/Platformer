var Game = require( '../game/Game' );
var PhysicalElement = require('../game/PhysicalElement')
var Player = require( '../game/Player' );
var Ground = require( '../game/Ground' );

module.exports = ( ()=>{

    return ( ( socket )=>{

        socket.on( 'login' , ( playerInfos )=>{

            // create a new player linked with the socket
            socket.player = new Player( playerInfos.name , playerInfos.x , playerInfos.y , playerInfos.width , playerInfos.height , socket )

            // tell the player that the login worked
            socket.emit( `connected` )

            // send current games to the player
            socket.emit( `currentGames` , Object.keys( currentGames ) )

        } );

        socket.on( `logout` , ()=>{

            // if the player was playing, he leaves the game
            if ( socket.player.game != null )
                currentGames[ socket.player.game ].removePlayer( socket.player )

            socket.emit( `disconnected` );

        } );

        socket.on( `keydown` ,( keyCode )=>{

            console.log(`key down : ${ keyCode }`)

        })

        socket.on( `keyup` ,( keyCode )=>{

            console.log( `key up : ${keyCode}` )

        } )

        socket.on( `newGame` , ( gameInfos )=>{

            let game = new Game( gameInfos.name , gameInfos.fps , [socket.player.name] , gameInfos.map )
            if ( game ){ // if the creation worked
                // send current games to everybody
                socket.emit( 'currentGames' , Object.keys( currentGames ) )
                socket.broadcast.emit( 'currentGames' , Object.keys( currentGames ) )

                return
            }
            socket.emit( `newGame` , false )

        } )

        socket.on( `joinGame` , ( gameId )=>{

            currentGames[ gameId ].addPhysicalElement( socket.player )

        } )

        socket.on( `startGame` , ( gameId )=>{

            currentGames[ gameId ].start()

        } )
    } )
} );