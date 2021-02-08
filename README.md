# 合成大西瓜
这两天玩了下合成大西瓜，来了热情，觉得自己也可以写个。以前没写过游戏，当然作为一个有无限三分钟热度的程序员还是刷过Cocos Creator是啥的。所以折腾了一个，从入门到人生的第一个小游戏。开整：

## 预览地址
http://g.yieio.com



## 采集素材

[合成大西瓜](http://g.vsane.com/game/552/)是[比翼互动](http://vsane.com)使用Cocos Creator v2.2.2做的一款H5小游戏。这是个很厉害的团队，每周都会出一款休闲小游戏，如果你看下他们之前的其他的游戏就会发现做出合成大西瓜是一步一步做到的，在这个游戏之前他们做了一个类似的小游戏叫[球球合合](http://g.vsane.com/game/317/)，就元素不一样，玩法几乎是一样的。为了尊重别人的劳动，声明下，本文采集的该小游戏的素材都属于该团队所有，这里只做学习练习使用。

Chrome打开游戏http://g.vsane.com/game/552/，F12开启开发者工具（如果不行，可以先在空白页开启开发者工具，再复制地址打开）。可以看到加载的资源，这里找了一款Chrome插件可以把加载的资源批量保存下来，插件下载地址：[Save_All_Resources_0.1.8]([https://chrome666.oss-cn-beijing.aliyuncs.com/Save_All_Resources_0.1.8.crx])

![image](B87087FF4D4049A3B3DA553A6B14A96D)

在chrome://extensions/中安装后重启Chrome可以看到开发者工具中会多了一个ResourcesSaver的标签，最后一个选项Include all assets by XHR requests 需要勾选下，然后 Save All Resources 就可以了。

![image](E96DA5C92E714DA496982B0BC93B150D)

所有的图片和音效素材都在res目录里面了。src目录里面是程序的逻辑代码project.js。

## 完整文档

[从0开始用CocosCreator写个合成大西瓜](http://note.youdao.com/noteshare?id=13072369cbf3faa350010e6faaefc84d&sub=B84EF80475D04FEC807D1EFB801F4F06)