// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import MainGame from "./MainGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Fruit extends cc.Component {
  //水果编号，同时用于索引要显示的水果精灵图片
  fruitNumber: number = 0;

  //和底部边界的碰撞次数，用来标记第一次碰撞时播放音效
  downWallColl: number = 0;

  edgeX: number = 0;

  //过线停留时间
  checkEndTime: number = 0;

  //碰撞合并次数
  combineCount: number = 0;

  //已经触发过线的次数，防止一直触发
  endCount: number = 0;

  start() {
    this.edgeX = 360 - this.node.width / 2;
  }

  update(dt) {
    let _t = this;

    //防止水果超出左右边界
    if (_t.node.x < -_t.edgeX) {
      _t.node.x = -_t.edgeX;
    } else if (_t.node.x > _t.edgeX) {
      _t.node.x = _t.edgeX;
    } 

    if (_t.node.parent.name == "fruitNode") {
        _t.checkEndTime += dt;
      if (
        _t.node.y + _t.node.height / 2 > MainGame.Instance.dashLineNode.y &&
        _t.endCount == 0 &&
        _t.checkEndTime > 3
      ) {
        _t.node.color = cc.Color.RED;
        //过线的水果变红闪
        cc.tween(this.node)
          .to(0.3, {
            opacity: 0,
          })
          .to(0.3, {
            opacity: 255,
          })
          .union()
          .repeat(3)
          .call(function () {
              //结束游戏
              MainGame.Instance.gameOver();
          })
          .start();

        _t.endCount++;
      }
    }
  }
  //碰撞开始事件
  onBeginContact(
    contact: cc.PhysicsContact,
    self: cc.PhysicsCollider,
    other: cc.PhysicsCollider
  ) {
    let _t = this;

    let fruitNode = MainGame.Instance.fruitNode;

    //是否碰撞到底部边界
    if (other.node.group == "downwall") {
      //碰撞后将其加入到fruitNode节点下
      self.node.parent = fruitNode;

      //是否第一次碰撞
      if (_t.downWallColl == 0) {
        //播放碰撞音效
        MainGame.Instance.playAudio(0, false, 1);
      }

      _t.downWallColl++;
    }

    //检查水果高度
    MainGame.Instance.findHighestFruit();

    //是否碰撞到其他水果
    if (other.node.group == "fruit") {
      self.node.parent = fruitNode;

      null != self.node.getComponent(cc.RigidBody) &&
        (self.node.getComponent(cc.RigidBody).angularVelocity = 0);
      //下面的水果碰撞上面的水果跳过
      if (self.node.y < other.node.y) {
        return;
      }

      let otherFruitNumber = other.node.getComponent("Fruit").fruitNumber,
        selfFruitNumber = _t.fruitNumber;

      //两个水果编号一样
      if (otherFruitNumber == selfFruitNumber) {
        //两个都已经是西瓜的情况
        if (selfFruitNumber == 10) {
          return;
        }

        let pos = other.node.position;

        //合并效果，音效，得分，生成一个新的水果

        //得分
        let score = MainGame.Instance.scoreObj.target + selfFruitNumber + 1;
        MainGame.Instance.setScoreTween(score);

        //去掉碰撞边界，避免再次碰撞
        other.node.getComponent(cc.PhysicsCircleCollider).radius = 0;
        other.node.getComponent(cc.PhysicsCircleCollider).apply();
        self.node.getComponent(cc.PhysicsCircleCollider).radius = 0;
        self.node.getComponent(cc.PhysicsCircleCollider).apply();

        cc.tween(self.node)
          .to(0.1, {
            position: pos, //合成到被碰撞的水果的位置
          })
          .call(function () {
            //创建爆浆效果，果汁飞溅的效果
            MainGame.Instance.createFruitBoomEffect(
              selfFruitNumber,
              pos,
              self.node.width
            );

            //创建合成的水果
            MainGame.Instance.createLevelUpFruit(selfFruitNumber + 1, pos);

            if (selfFruitNumber == 9) {
              MainGame.Instance.createBigWaterMelonEffect();
            }

            //销毁两个碰撞的水果
            self.node.active = !1;
            other.node.active = !1;
            other.node.destroy();
            self.node.destroy();
          })
          .start();
      }
    }
  }
}
