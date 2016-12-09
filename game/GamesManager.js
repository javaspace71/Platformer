/**
 * Created by Nigel on 08/12/2016.
 */

let Player = require('./Player')


/**
 * @class GamesManager
 * @description Manage multiple games
 */
class GamesManager {

    /**
     * @constructor
     * @description constructor of a GamesManager instance
     */
    constructor() {

        this.games = {}

    }

    /**
     * @method addGame
     * @description add a game to the GamesManager
     * @param {Game} game
     * @return {Boolean} true if the game wasn't already added, else {Boolean} false
     */
    addGame(game) {

        // check if the game is a {Game} instance
        if (game.constructor.name !== "Game") {
            throw new Error(`Bad type ! Expected {Game} but was {${game.constructor.name}}`)
        }

        // check if the game is already inside
        if (!_.isUndefined(this.games[game.id])){
            return false
        }

        // Check if a game has already this name
        let validName = true
        _.each( this.games , ( value , index , collection )=>{
            if ( value.name === game.name )
            {
                validName = false
            }
        })
        if (!validName) return false

        // else
        // we add the game
        this.games[game.id] = game

        return true

    }

    /**
     * @method removeGame
     * @description remove a game from the GamesManager
     * @param {String} gameId
     * @return {Boolean} true if the game was in the GamesManager, else {Boolean} false
     */
    removeGame(gameId) {

        let isInside = false

        this.games = _.reject(this.games, (value) => {

            if (value.id === game.id)
                isInside = true

            return value.id === game.id

        })

        return isInside

    }

    /**
     * @method getGame
     * @description get a game from the GamesManager, or undefined if the game doesn't exist
     * @param {String} gameId
     * @return {Game} the game corresponding with gameId if it was found, else undefined
     */
    getGame(gameId) {

        return this.games[gameId]

    }

    /**
     * @method getGamesInfos
     * @description get informations about all games
     * @return {Array}
     */
    getGamesInfos() {

        let gamesInfos = []

        _.each( this.games , ( value , key )=>{
            gamesInfos.push({
                id: value.id,
                name: value.name,
                players: _.map( value.getElementsOfType(Player) , ( value , key )=>{
                    return {
                        name: value.name
                    }
                })
            })
        })

        return gamesInfos
    }

}


module.exports = GamesManager