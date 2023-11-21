# Node.js-Socket.io-ChatRoom
Node.js Socket.io 聊天室

# 目的
練習 node.js 和 socket.io 的應用及整合

# 流程
登入 > 建立或加入聊天室 > 開始聊天<br><br>
**登入:** 一般的帳號密碼登入認證，登入成功後才進行 socket 連線<br>
**建立聊天室:** 輸入聊天室的名字，未存在則建立已存在則加入<br>
**聊天:** 開始聊天<br>

# 使用工具/技術
- node.js
  - express
  - mysql2
  - dotenv
  - express-session
  - express-socket.io-session
- Socket.io
- MySQL
- jQuery

# DEMO
- 登入頁面，設計參考網路上<br>

![image](https://github.com/0524088/Node.js-Socket.io-Test/assets/144317928/012f43d2-0635-4497-afeb-a6f3d32df741)
<br>
- 登入後輸入房間名稱來建立或加入<br>

![image](https://github.com/0524088/Node.js-Socket.io-Test/assets/144317928/1a84acc1-5579-430d-b775-7ed2e94b6660)
<br>
- 聊天室<br>

![image](https://github.com/0524088/Node.js-Socket.io-Test/assets/144317928/5d97def7-587f-46ec-91a6-c44f38c0cc98)
<br>
- 若意外斷線會判斷是否登入以及是否直接從聊天室離開，會自動導向房間建立頁面或重新進入聊天室<br>

![bandicam 2023-11-21 11-21-20-660](https://github.com/0524088/Node.js-Socket.io-ChatRoom/assets/144317928/72c1ef29-23b4-4ea2-8b78-6db4a258b280)
<br>



