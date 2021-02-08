// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainGame extends cc.Component {
  //水果精灵图列表
  @property([cc.SpriteFrame])
  fruitSprites: Array<cc.SpriteFrame> = [];

  //分数label标签
  @property(cc.Label)
  scoreLabel: cc.Label = null;

  //水果预制节点资源
  @property(cc.Prefab)
  fruitPre: cc.Prefab = null;

  //顶部区域节点，生成的水果要添加到这个节点里面
  @property(cc.Node)
  topNode: cc.Node = null;

  @property(cc.Node)
  dashLineNode: cc.Node = null;

  isDashLineInit: boolean = false;

  //用来挂载落下的水果，作为他们的父节点，方便遍历查找
  @property(cc.Node)
  fruitNode: cc.Node = null;

  //用来暂存生成的水果节点
  targetFruit: cc.Node = null;

  //已创建水果计数
  createFruitCount: number = 0;

  //分数变动和结果
  scoreObj = {
    isScoreChanged: false,
    target: 0,
    change: 0,
    score: 0,
  };

  //果汁效果图，水果颗粒
  @property([cc.SpriteFrame])
  fruitL: Array<cc.SpriteFrame> = [];
  //果粒散溅
  @property([cc.SpriteFrame])
  guozhiL: Array<cc.SpriteFrame> = [];
  //果汁效果
  @property([cc.SpriteFrame])
  guozhiZ: Array<cc.SpriteFrame> = [];

  //果汁预制资源
  @property(cc.Prefab)
  juicePre: cc.Prefab = null;
  //效果挂载的节点
  @property(cc.Node)
  effectNode: cc.Node = null;

  //音效列表
  @property([cc.AudioClip])
  audios: Array<cc.AudioClip> = [];
  //遮罩背景图节点
  @property(cc.Prefab)
  maskBg: cc.Prefab = null;

  //彩带精灵图
  @property([cc.SpriteFrame])
  caidaiSprites: Array<cc.SpriteFrame> = [];
  //彩带预制节点
  @property(cc.Prefab)
  caidaiPre: cc.Prefab = null;
  //合成大西瓜效果挂载节点
  @property(cc.Node)
  daxiguaEffectNode: cc.Node = null;

  //游戏结束界面
  @property(cc.Prefab)
  gameOverPre: cc.Prefab = null;

  //标记游戏结束
  gameOverSign: number = 0;

  //全部水果最高高度
  theFruitHeight: number = -1200;

  //设置一个静态单例引用，方便其他类中调用该类方法
  static Instance: MainGame = null;

  onLoad() {
    null != MainGame.Instance && MainGame.Instance.destroy();
    MainGame.Instance = this;

    this.physicsSystemCtrl(true, false);
  }

  start() {
    //初始化红色虚线
    this.initDashLine();
    //创建一个水果
    this.createOneFruit(0);

    //绑定点击事件
    this.bindTouch();
  }

  update(dt) {
    this.updateScoreLabel(dt);

    this.checkTheRedDashLine(dt);
  }

  physicsSystemCtrl(enablePhysics: boolean, enableDebug: boolean) {
    cc.director.getPhysicsManager().enabled = enablePhysics;
    cc.director.getPhysicsManager().gravity = cc.v2(0, -300);
    if (enableDebug) {
      cc.director.getPhysicsManager().debugDrawFlags =
        cc.PhysicsManager.DrawBits.e_shapeBit;
    }
    cc.director.getCollisionManager().enabled = enablePhysics;
    cc.director.getCollisionManager().enabledDebugDraw = enableDebug;
  }

  //创建一个水果
  createOneFruit(index: number) {
    var t = this,
      n = cc.instantiate(this.fruitPre);
    n.parent = this.topNode;
    n.position = cc.v3(0, 0, 0);
    n.getComponent(cc.Sprite).spriteFrame = this.fruitSprites[index];
    //获取附加给水果节点的Fruit脚本组件，注意名字大小写敏感
    n.getComponent("Fruit").fruitNumber = index;

    //创建时不受重力影响，碰撞物理边界半径为0
    n.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
    n.getComponent(cc.PhysicsCircleCollider).radius = 0;
    n.getComponent(cc.PhysicsCircleCollider).apply();
    //从新变大的一个展示效果
    n.scale = 0;
    cc.tween(n)
      .to(
        0.5,
        {
          scale: 1,
        },
        {
          easing: "backOut",
        }
      )
      .call(function () {
        t.targetFruit = n;
      })
      .start();
  }

  /**
   * 创建一个升级的水果
   * @param fruitNumber number 水果编号
   * @param position cc.Vec3 水果位置
   */
  createLevelUpFruit = function (fruitNumber: number, position: cc.Vec3) {
    let _t = this;
    let o = cc.instantiate(this.fruitPre);
    o.parent = _t.fruitNode;
    o.getComponent(cc.Sprite).spriteFrame = _t.fruitSprites[fruitNumber];
    o.getComponent("Fruit").fruitNumber = fruitNumber;
    o.position = position;
    o.scale = 0;

    o.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, -100);
    o.getComponent(cc.PhysicsCircleCollider).radius = o.height / 2;
    o.getComponent(cc.PhysicsCircleCollider).apply();
    cc.tween(o)
      .to(
        0.5,
        {
          scale: 1,
        },
        {
          easing: "backOut",
        }
      )
      .call(function () {
        
      })
      .start();

    _t.fruitHeigth = _t.findHighestFruit();
  };

  randomInteger(e, t) {
    return Math.floor(Math.random() * (t - e) + e);
  }

  createFruitBoomEffect(fruitNumber: number, t: cc.Vec3, width: number) {
    let _t = this;

    //播放音效
    _t.playAudio(4, false, 0.3);
    _t.playAudio(1, false, 0.5);

    for (var o = 0; o < 10; o++) {
      let c = cc.instantiate(_t.juicePre);
      c.parent = _t.effectNode;
      c.getComponent(cc.Sprite).spriteFrame = _t.fruitL[fruitNumber];
      var a = 359 * Math.random(),
        i = 30 * Math.random() + width / 2,
        l = cc.v2(
          Math.sin((a * Math.PI) / 180) * i,
          Math.cos((a * Math.PI) / 180) * i
        );
      c.scale = 0.5 * Math.random() + width / 100;
      var p = 0.5 * Math.random();
      (c.position = t),
        c.runAction(
          cc.sequence(
            cc.spawn(
              cc.moveBy(p, l),
              cc.scaleTo(p + 0.5, 0.3),
              cc.rotateBy(p + 0.5, _t.randomInteger(-360, 360))
            ),
            cc.fadeOut(0.1),
            cc.callFunc(function () {
              c.active = !1;
            }, this)
          )
        );
    }
    for (var f = 0; f < 20; f++) {
      let h = cc.instantiate(_t.juicePre);
      h.parent = _t.effectNode;
      (h.getComponent(cc.Sprite).spriteFrame = _t.guozhiL[fruitNumber]),
        (h.active = !0);
      (a = 359 * Math.random()),
        (i = 30 * Math.random() + width / 2),
        (l = cc.v2(
          Math.sin((a * Math.PI) / 180) * i,
          Math.cos((a * Math.PI) / 180) * i
        ));
      h.scale = 0.5 * Math.random() + width / 100;
      p = 0.5 * Math.random();
      (h.position = t),
        h.runAction(
          cc.sequence(
            cc.spawn(cc.moveBy(p, l), cc.scaleTo(p + 0.5, 0.3)),
            cc.fadeOut(0.1),
            cc.callFunc(function () {
              h.active = !1;
            }, this)
          )
        );
    }

    var m = cc.instantiate(_t.juicePre);
    m.parent = _t.effectNode;
    m.active = true;
    (m.getComponent(cc.Sprite).spriteFrame = _t.guozhiZ[fruitNumber]),
      (m.position = t),
      (m.scale = 0),
      (m.angle = this.randomInteger(0, 360)),
      m.runAction(
        cc.sequence(
          cc.spawn(cc.scaleTo(0.2, width / 150), cc.fadeOut(1)),
          cc.callFunc(function () {
            m.active = !1;
          })
        )
      );
  }

  getRandomNum(e, t, n) {
    return (
      void 0 === n && (n = !1),
      n
        ? Math.floor(Math.random() * (t - e + 1) + e)
        : Math.random() * (t - e) + e
    );
  }

  createRibbonEffect(pos: cc.Vec3, parentNode: cc.Node) {
    let _t = this;
    _t.playAudio(1, false, 1);
    for (var t = this.getRandomNum(80, 100, 0), n = 0; n < t; n++) {
      var o = cc.instantiate(_t.caidaiPre);
      o.parent = parentNode;
      o.getComponent(cc.Sprite).spriteFrame =
        _t.caidaiSprites[this.getRandomNum(0, 5, true)];
      o.position = pos;

      o.setScale(this.getRandomNum(0.7, 1, 0));
      let c = (360 * Math.random() * Math.PI) / 180,
        a = 360 * Math.random(),
        i = cc.v2(o.x + Math.sin(c) * a, o.y + Math.cos(c) * a + 150);

      cc.v2(i.x, i.y + 100);
      o.runAction(
        cc.sequence(
          cc.spawn(
            cc.moveTo(0.255, i).easing(cc.easeCubicActionOut()),
            cc.scaleTo(0.255, 1 * Math.random() + 0.5),
            cc.moveBy(
              4.25,
              cc.v2(
                0,
                0.8 * -cc.winSize.height - Math.random() * cc.winSize.height
              )
            ),
            cc.rotateBy(
              4.25,
              (1800 * Math.random() + 1200) * (Math.random() > 0.5 ? 1 : -1)
            ),
            cc.sequence(
              cc.moveBy(
                0.17 * (8 * Math.random() + 6),
                cc.v2(
                  (100 * Math.random() + 100) * (Math.random() > 0.5 ? -1 : 1),
                  0
                )
              ),
              cc.moveBy(
                0.17 * (8 * Math.random() + 6),
                cc.v2(
                  (100 * Math.random() + 100) * (Math.random() > 0.5 ? -1 : 1),
                  0
                )
              ),
              cc.moveBy(
                0.17 * (8 * Math.random() + 6),
                cc.v2(
                  (100 * Math.random() + 100) * (Math.random() > 0.5 ? -1 : 1),
                  0
                )
              )
            ),
            cc.sequence(
              cc.delayTime(0.17 * this.getRandomNum(20, 24.5, 0)),
              cc.fadeOut(0.17)
            )
          ),
          cc.removeSelf(!0),
          cc.callFunc(function () {
            //PoolManager.Instance.putNode("caidaiPrefab", o);
            o.active = false;
          })
        )
      );
    }
  }

  createBigWaterMelonEffect() {
    let _t = this;
    //大西瓜显示特效
    var e = cc.instantiate(_t.maskBg);
    e.parent = _t.daxiguaEffectNode;
    e.active = true;
    e.opacity = 0;
    cc.tween(e)
      .to(0.5, {
        opacity: 150,
      })
      .start();

    var c = new cc.Node();

    c.addComponent(cc.Sprite).spriteFrame = _t.fruitSprites[10];
    c.parent = _t.daxiguaEffectNode;
    c.position = cc.v3(0, 0, 0);
    c.scale = 0;

    //旋转的光圈背景图
    var r = new cc.Node();
    r.addComponent(cc.Sprite).spriteFrame = _t.caidaiSprites[8];
    r.scale = 3;
    r.parent = c;
    r.position = cc.v3(0);
    cc.tween(r)
      .by(5, {
        angle: 360,
      })
      .repeatForever()
      .start();

    var s = new cc.Node();
    (s.addComponent(cc.Sprite).spriteFrame = _t.fruitSprites[10]),
      (s.parent = c),
      (s.position = cc.v3(0)),
      //播放音效
      _t.playAudio(2, false, 1),
      //抛撒彩带效果
      _t.createRibbonEffect(cc.v3(0, 300, 0), this.daxiguaEffectNode),
      c.runAction(
        cc.sequence(
          cc.spawn(cc.jumpBy(1, 0, 0, 300, 1), cc.scaleTo(1, 1)),

          cc.delayTime(1),

          cc.spawn(cc.moveTo(1, cc.v2(0, 800)), cc.scaleTo(1, 0)),

          cc.callFunc(function () {
            //(a.default.score += 100),
            //u.default.Instance.SetScoreTween(a.default.score),
            e.destroy(),
              //(a.default.playerTouch = !0),
              c.destroy();
          })
        )
      );
  }

  //#region 点击事件

  //绑定Touch事件
  bindTouch() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this),
      this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this),
      this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this),
      this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  //touch开始
  onTouchStart(e: cc.Event.EventTouch) {
    if (null == this.targetFruit) {
      return;
    }

    //吧点击位置的x坐标值赋值给水果
    let x = this.node.convertToNodeSpaceAR(e.getLocation()).x,
      y = this.targetFruit.position.y;
    cc.tween(this.targetFruit)
      .to(0.1, {
        position: cc.v3(x, y),
      })
      .start();
  }

  //拖动
  onTouchMove(e: cc.Event.EventTouch) {
    if (null == this.targetFruit) {
      return;
    }

    this.targetFruit.x = this.node.convertToNodeSpaceAR(e.getLocation()).x;
  }

  //Touch结束
  onTouchEnd(e: cc.Event.EventTouch) {
    let t = this;
    if (null == t.targetFruit) {
      return;
    }

    //让水果降落
    //todo...
    let h = t.targetFruit.height;
    t.targetFruit.getComponent(cc.PhysicsCircleCollider).radius = h / 2;
    t.targetFruit.getComponent(cc.PhysicsCircleCollider).apply();
    t.targetFruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
    t.targetFruit.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, -800);

    //t.targetFruit.parent = t.fruitNode;
    //去掉暂存指向
    t.targetFruit = null;

    //生成一个新的水果
    this.scheduleOnce(function () {
      0 == t.createFruitCount
        ? (t.createOneFruit(0), t.createFruitCount++)
        : 1 == t.createFruitCount
        ? (t.createOneFruit(0), t.createFruitCount++)
        : 2 == t.createFruitCount
        ? (t.createOneFruit(1), t.createFruitCount++)
        : 3 == t.createFruitCount
        ? (t.createOneFruit(2), t.createFruitCount++)
        : 4 == t.createFruitCount
        ? (t.createOneFruit(2), t.createFruitCount++)
        : 5 == t.createFruitCount
        ? (t.createOneFruit(3), t.createFruitCount++)
        : t.createFruitCount > 5 &&
          ( t.createOneFruit(9),//t.createOneFruit(Math.floor(Math.random() * 5)),
          t.createFruitCount++);
    }, 0.5);
  }

  //#endregion

  //#region 分数面板更新

  setScoreTween(score: number) {
    let scoreObj = this.scoreObj;
    scoreObj.target != score &&
      ((scoreObj.target = score),
      (scoreObj.change = Math.abs(scoreObj.target - scoreObj.score)),
      (scoreObj.isScoreChanged = !0));
  }

  updateScoreLabel(dt) {
    let scoreObj = this.scoreObj;
    if (scoreObj.isScoreChanged) {
      (scoreObj.score += dt * scoreObj.change * 5),
        scoreObj.score >= scoreObj.target &&
          ((scoreObj.score = scoreObj.target), (scoreObj.isScoreChanged = !1));
      var t = Math.floor(scoreObj.score);
      this.scoreLabel.string = t.toString();
    }
  }

  //#endregion

  /**
   * @param clipIndex AudioClip The audio clip to play.
   * @param loop Boolean Whether the music loop or not.
   * @param volume Number Volume size.
   */
  playAudio(clipIndex: number, loop: boolean, volume: number) {
    cc.audioEngine.play(this.audios[clipIndex], loop, volume);
  }

  /**
   * 查找最高的水果，在碰撞和生成后调用检测
   */
  findHighestFruit() {
 
    for (
      var e = this.fruitNode.children[0].y+ this.fruitNode.children[0].width/2, t = 1;
      t < this.fruitNode.children.length;
      t++
    ) {
      var n =
        this.fruitNode.children[t].y + this.fruitNode.children[t].width / 2;
      e < n && (e = n);
    }
    this.theFruitHeight = e;
  }

  //检测是否快到红线了
  checkTheRedDashLine(dt) {
    if (!this.isDashLineInit) {
      return;
    }
    this.dashLineNode.y - this.theFruitHeight < 100 &&
      this.dashLineNode.y - this.theFruitHeight >= 0 &&
      (this.dashLineNode.active = true);

    this.dashLineNode.y - this.theFruitHeight > 100 &&
      (this.dashLineNode.active = false);
  }

  /**
   * 初始化红线，并加入闪烁效果
   */
  initDashLine() {
    let _t = this;
    cc.tween(this.dashLineNode)
      .to(0.3, {
        opacity: 255,
      })
      .to(0.3, {
        opacity: 0,
      })
      .union()
      .repeatForever()
      .start();
    this.scheduleOnce(function () {
      _t.dashLineNode.active = false;
      _t.isDashLineInit = true;
    }, 1);
  }

  //#region 游戏结束

  /**
   * 游戏结束
   */
  gameOver() {
    var _t = this;
    if (_t.gameOverSign == 0) {
      //游戏结束，水果自爆
      for (
        var t = 0,
          n = function (n) {
            setTimeout(function () {
              _t.createFruitBoomEffect(
                _t.fruitNode.children[n].getComponent("Fruit").fruitNumber,
                _t.fruitNode.children[n].position,
                _t.fruitNode.children[n].width
              );

              let score =
                _t.scoreObj.target +
                _t.fruitNode.children[n].getComponent("Fruit").fruitNumber +
                1;
              _t.setScoreTween(score);
              _t.fruitNode.children[n].active = false;
            }, 100 * ++t);
          },
          o = this.fruitNode.children.length - 1;
        o >= 0;
        o--
      )
        n(o);
      _t.dashLineNode.active = true;

      for (var c = 1; c < _t.topNode.children.length; c++) {
        _t.topNode.children[c].active = !1;
      }

      //a.default.GameUpdateCtrl = !1;
      this.scheduleOnce(function () {
        _t.showGameOverPanel();
      }, 3);

      _t.gameOverSign++;
    }
  }

  showGameOverPanel() {
    let _t = this;
    let gameOverPanelNode = cc.instantiate(this.gameOverPre);
    gameOverPanelNode.parent = _t.node;

    gameOverPanelNode
      .getChildByName("startBtn")
      .on(cc.Node.EventType.TOUCH_START, function (e: cc.Event) {
        _t.restartGame();
      });
    let btnNode = gameOverPanelNode.getChildByName("startBtn");

    cc.tween(btnNode)
      .to(1, {
        scale: 0.8,
      })
      .to(1, {
        scale: 0.9,
      })
      .union()
      .repeatForever()
      .start();

    gameOverPanelNode.children[0].on(
      cc.Node.EventType.TOUCH_START,
      function (e: cc.Event) {
        _t.restartGame();
      }
    );
  }

  restartGame() {
    cc.director.preloadScene("MainGameSence", function () {
      cc.director.loadScene("MainGameSence");
    });
  }

  //#endregion
}
