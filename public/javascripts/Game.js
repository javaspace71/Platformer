/**
 * Created by Nigel on 29/11/2016.
 */
let SpriteGenerator = require("./SpriteGenerator.js")

class Game {

    /**
     * @constructor
     * @param {Number} width
     * @param {Number} height
     * @param {String} renderContainerSelector
     * @param {Object} startingGameInfos
     */
    constructor ( width , height , renderContainerSelector , startingGameInfos ){
        /*
            Renderer
         */
        this.renderer = PIXI.autoDetectRenderer( width , height , {
            antialias: false,
            transparent: false,
            resolution: 1
        } );

        // Add the canvas to the HTML document
        $( renderContainerSelector ).append( this.renderer.view );

        // Create a container object called the `stage`
        this.stage = new PIXI.Container( );

        this.currentGameInfos = {
            physicalElements : []
        }
        this.update(startingGameInfos)

    }

    /**
     * @method update
     * @description Update the game with (new) informations
     * @param {Object} gameUpdateInfos
     */
    update( gameUpdateInfos ){

        console.log("gameUpdateInfos : ",gameUpdateInfos,"this.currentGameInfos.physicalElements : ", this.currentGameInfos.physicalElements)
        // update all locals pseudo PhysicalElements (and their corresponding Sprites)
        _.each( gameUpdateInfos.physicalElements , ( physicalElement )=>{

            // if the PhysicalElement is already known and has a sprite
            if (this.getPhysicalElement(physicalElement)){

                // update the local pseudo PhysicalElement (and his corresponding Sprite) from the pseudo PhysicalElement infos
                this.updatePhysicalElement(physicalElement);

            }
            else {

                console.log("create")
                // else create a Sprite from the pseudo PhysicalElement infos
                this.createPhysicalElement(physicalElement)

            }

        } )

        this.renderer.render( this.stage );

    }

    /**
     * @method getElement
     * @description get the local pseudo PhysicalElement which corresponds
     * with the pseudo PhysicalElement given and check if the sprite exists.
     * @param {Object} element
     * @returns
     * {Object} the local pseudo PhysicalElement if it exists and has a sprite
     * else {Boolean} false
     */
    getPhysicalElement ( element ){

        let retour = false

        _.each( this.currentGameInfos.physicalElements , ( _element , index )=>{

            if ( _element.id === element.id && !_.isUndefined(_element.sprite)){

                retour = this.currentGameInfos.physicalElements[index]

            }


        } )
        return retour
    }

    /**
     * @method updatePhysicalElement
     * @description Update the local pseudo PhysicalElement wich corresponds
     * with the pseudo PhysicalElement given. (position & sprite)
     * @param {Object} element
     */
    updatePhysicalElement ( element ){
        _.each(this.currentGameInfos.physicalElements, ( _element , index )=>{

            if ( _element.id === element.id ){

                console.log("move to ",element.position.x,element.position.y)
                this.currentGameInfos.physicalElements[index].sprite.setTransform(element.position.x, element.position.y);

            }

        } )
    }

    /**
     * @method createPhysicalElement
     * @description Create the local pseudo PhysicalElement wich corresponds
     * with the pseudo PhysicalElement sent by server. (position & size & sprite)
     * @param {Object} element
     */
    createPhysicalElement ( element ){

        let index = this.currentGameInfos.physicalElements.push(element)-1

        this.currentGameInfos.physicalElements[index].sprite = SpriteGenerator.generate( element )

        this.stage.addChild( this.currentGameInfos.physicalElements[index].sprite )

    }

}

module.exports = Game