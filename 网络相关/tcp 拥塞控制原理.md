## **什么是 TCP 拥塞控制**

> TCP 拥塞控制的目标是最大化利用网络上瓶颈链路的带宽。

简单来说是将网络链路比喻成一根水管，如果我们希望尽可能地使用网络传输数据，方法就是给水管注水，就有如下公式：

> 水管内的水的数量 = 水管的容积 = 水管粗细 × 水管长度

对应的网络名词就是：

> 网络内尚未被确认收到的数据包数量 = 网络链路上能容纳的数据包数量 = 链路带宽 × 往返延迟


TCP进行拥塞控制过程分为四个阶段：慢启动、拥塞避免、快重传和快恢复

![img.png](./images/congestion.png)

*   慢启动阶段思路是不要一开始就发送大量的数据，先探测一下网络的拥塞程度，也就是说由小到大逐渐增加拥塞窗口的大小，在没有出现丢包时每收到一个 ACK 就将拥塞窗口大小加一（单位是 MSS，最大单个报文段长度），每轮次发送窗口增加一倍，呈指数增长，若出现丢包，则将拥塞窗口减半，进入拥塞避免阶段；
*   当窗口达到慢启动阈值或出现丢包时，进入拥塞避免阶段，窗口每轮次加一，呈线性增长；当收到对一个报文的三个重复的 ACK 时，认为这个报文的下一个报文丢失了，进入快重传阶段，要求接收方在收到一个失序的报文段后就立即发出重复确认（为的是使发送方及早知道有报文段没有到达对方，可提高网络吞吐量约20%）而不要等到自己发送数据时捎带确认；
*   快重传完成后进入快恢复阶段，将慢启动阈值修改为当前拥塞窗口值的一半，同时拥塞窗口值等于慢启动阈值，然后进入拥塞避免阶段，重复上述过程。



- https://www.zhihu.com/question/58517416/answer/1788857452
- https://zhuanlan.zhihu.com/p/76023663
