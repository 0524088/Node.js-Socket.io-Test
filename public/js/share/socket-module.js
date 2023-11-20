// 共用實例
import SocketClient from '../event/socket-event.js';

let socketInstance = null;

function getSocketInstance() {
    if (!socketInstance) {
        // 創建 SocketClient 實例
        socketInstance = new SocketClient();
    }
    return socketInstance;
}
  
export default { getSocketInstance };
