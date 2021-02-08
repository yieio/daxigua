// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class AdjustWithHeight extends cc.Component {

    @property
    offset:number = 0;

    //是否显示入场动画
    @property
    hasShowEffect:boolean = false;

    onLoad () {
        let start = 0;
        start = cc.winSize.height / 2;
        this.node.y = start;
        if(!this.hasShowEffect){
            this.node.y += this.offset;
        }
    }  

    start () {
        this.showTheNode(); 
    }

    showTheNode(){ 
        if(this.hasShowEffect){
            //从上往下滑动入场
            this.node.runAction(cc.moveTo(.5, cc.v2(this.node.x, this.node.y + this.offset)).easing(cc.easeBackOut())); 
        }
    }

    // update (dt) {}
}
