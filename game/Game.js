/**
 * Created by Nigel on 26/11/2016.
 */
let GroundJumpable = require("./GroundJumpable")
let GroundNotJumpable = require("./GroundNotJumpable")
let Respawn = require( './Respawn' );
var reissue = require('reissue');

/**
 * @class Game
 * @description A game
 */
class Game {

    /**
     * @constructor
     * @param {String} name
     * @param {Number} fps
     * @param {String} map
     */
    constructor(name, map) {
        // set the state of the game to "loading"
        this.state = "loading"
        this.stepCount = 0 // TODO TEST
        this.id = uniqid()
        this.name = name
        this.positionableElements = []
        this.physicalElements = []

        // create the engine of the game
        this.engine = Engine.create()

        /**
         * handle all collisions
         */
        // Handle all start collisions
        Events.on(this.engine, "collisionStart", (e)=>{

            _.each( e.pairs , ( value , index , array )=>{

                let physicalElement1 = this.getPhysicalElementFromBody(value.bodyA)
                let physicalElement2 = this.getPhysicalElementFromBody(value.bodyB)

                if (physicalElement1 && physicalElement2){
                    physicalElement1.handleCollisionStartWith(physicalElement2)
                    physicalElement2.handleCollisionStartWith(physicalElement1)
                }
            })
        })
        // Handle all active collisions
        Events.on(this.engine, "collisionActive", (e)=>{

            _.each( e.pairs , ( value , index , array )=>{

                let physicalElement1 = this.getPhysicalElementFromBody(value.bodyA)
                let physicalElement2 = this.getPhysicalElementFromBody(value.bodyB)

                if (physicalElement1 && physicalElement2){
                    physicalElement1.handleCollisionActiveWith(physicalElement2)
                    physicalElement2.handleCollisionActiveWith(physicalElement1)
                }
            })
        })
        // Handle all ended collisions
        Events.on(this.engine, "collisionEnd", (e)=>{

            _.each( e.pairs , ( value , index , array )=>{

                let physicalElement1 = this.getPhysicalElementFromBody(value.bodyA)
                let physicalElement2 = this.getPhysicalElementFromBody(value.bodyB)

                if (physicalElement1 && physicalElement2){

                    physicalElement1.handleCollisionEndWith(physicalElement2)
                    physicalElement2.handleCollisionEndWith(physicalElement1)
                }
            })
        })

        // greater gravity
        this.engine.world.gravity.y = 3

        // load the map
        this.loadMap(map)

        // set the state of the game to "ready"
        this.state = "ready"

    }

    /**
     * @method start
     * @description Start the game
     */
    start() {
        // if the game is not ready or paused, exit
        if (!(this.state === "ready" || this.state === "paused")) return

        // else
        // launch the main loop and save it, so it will be stopped when the game stop
        this.mainLoop = reissue.create({
            func: function(callback){
                this.step.bind(this)();
                return callback();
            },
            interval: 1000/60,
            context: this
        });
        this.mainLoop.start()

        this.delta = 1000/60
        this.lastStepTimestamp = new Date().getTime()

        // set the state of the game to "playing"
        this.state = "playing"

    }

    /**
     * @method step
     * @description Go to the next state of the game
     */
    step(){
        this.stepCount ++

        // if the game is not playing, exit
        if (this.state !== "playing") {
            return
        }

        // else
        // move every player
        _.each( this.getPhysicalElementsOfType( "Player" ) ,(player)=>{
            player.move()
        })

        // set the last time delta
        this.lastDelta = this.delta

        // set the new time delta
        let delta = new Date().getTime() - this.lastStepTimestamp

        // Update the Engine
        Engine.update(this.engine, this.delta , this.delta / this.lastDelta);

        // Send informations to the players
        _.each( this.getPhysicalElementsOfType( "Player" ) ,(player)=>{
            player.socket.emit("gameUpdate", this.getGameUpdateInfos(player))
        })

        // set lastStepTimestamp
        this.lastStepTimestamp = new Date().getTime()
    }

    /**
     * @method getPhysicalElementsOfType
     * @description Return all PhysicalElements of the specified type
     * @param {String} type
     * @returns {Array}
     */
    getPhysicalElementsOfType(type){
        let elements = []
        _.each( this.physicalElements , ( element )=>{
            if ( element.constructor.name === type )
                elements.push( element )

        } )
        return elements
    }

    /***
     * @method getGameUpdateInfos
     * @description get all informations that have to be sent to a specific player
     * @param {Player} player player to whom the informations will be sent
     * @returns {{}}
     */
    getGameUpdateInfos(player){
        // TODO make the infos depend on the player to whom the infos will be given

        let gameUpdateInfos = {
            physicalElements: [],
            cameraPosition: {},
            stepCount: this.stepCount
        }

        gameUpdateInfos.playerPosition = {
            x: -player.body.position.x,
            y: -player.body.position.y
        }

        // add all PhysicalElements being in the Game
        _.each( this.physicalElements , ( physicalElement )=>{

            gameUpdateInfos.physicalElements.push({
                id: physicalElement.id,
                type: physicalElement.constructor.name,
                position: physicalElement.body.position,
                width: physicalElement.width,
                height: physicalElement.height
            })

        })

        return gameUpdateInfos

    }

    /**
     * @method end
     * @description End the game
     */
    end() {

        // stop the main loop
        clearInterval(this.mainLoop)

    }

    /**
     * @method addPhysicalElement
     * @description Add a new PhysicalElement to the Game
     * @param {PhysicalElement} element
     */
    addPhysicalElement(element) {

        // add the PhysicalElement to physicalElements array
        this.physicalElements.push(element);

        // add the PhysicalElement physically to the world of the game
        World.add(this.engine.world, element.body);

    }

    /**
     * @method deletePhysicalElement
     * @description Delete a PhysicalElement from the Game
     * @param PhysicalElement element
     */
    deletePhysicalElement(element) {

        // remove the element from the element's array
        this.physicalElements = _.reject(this.physicalElements, (value)=>{
            return value.id === element.id
        })

        // remove the element physically from the world of the game
        World.remove(this.engine.world, element.body, true);
    }

    /**
     * @method loadMap
     * @description load a map
     * @param {String} map
     */
    loadMap( map ){

        map = JSON.parse(fs.readFileSync(`./game/maps/${map}.map`,{
            encoding: 'utf8'
        })).map

        // Add all elements to the game
        _.each( map , ( value , index , array )=>{

            switch ( value.type ){
                case "GroundJumpable":
                    this.addPhysicalElement( new GroundJumpable( value.position.x , value.position.y , value.width , value.height ) )
                    break
                case "GroundNotJumpable":
                    this.addPhysicalElement( new GroundNotJumpable( value.position.x , value.position.y , value.width , value.height ) )
                    break
                case "Respawn":
                    this.addPositionableElement( new Respawn( value.position.x, value.position.y ))
                    break
            }

        })



    }

    /**
     * @method getPhysicalElementFromBody
     * @description get the game physical element's id corresponding with the specified body
     * @param {Body} body
     */
    getPhysicalElementFromBody( body ){

        let returnPhysicalElement=false

        _.each( this.physicalElements , ( value , index , array )=>{

            if (value.body.id === body.id){
                returnPhysicalElement = value
            }
        })

        return returnPhysicalElement
    }

    /**
     * @method handleCollision
     * @description handler that will be called for every collision pairs
     * @param {PhysicalElement} physicalElement1
     * @param {PhysicalElement} physicalElement2
     */
    handleCollision( physicalElement1, physicalElement2 ){

        physicalElement1.handleCollisionWith( physicalElement2 )
        physicalElement2.handleCollisionWith( physicalElement1 )

    }

    /**
     * @method addPositionableElement
     * @description add a positionableElement to the game positionable elements array
     */
    addPositionableElement( positionableElement ){

        this.positionableElements.push( positionableElement )
    }

    /**
     * @method getPositionableElementsOfType
     * @description Return all PositionableElements of the specified type
     * @param {String} type
     * @returns {Array}
     */
    getPositionableElementsOfType(type){
        let elements = []
        _.each( this.positionableElements , ( element )=>{
            if ( element.constructor.name === type )
                elements.push( element )

        } )
        return elements
    }

}

module.exports = Game;