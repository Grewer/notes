# HTTP 缓存

HTTP 头信息控制缓存大致分为两种：强缓存和协商缓存。强缓存如果命中缓存不需要和服务器端发生交互，而协商缓存不管是否命中都要和服务器端发生交互，强制缓存的优先级高于协商缓存.

![流程图](./images/httpCache.png)

## 强缓存

在 Chrome 控制台的 Network 选项中可以看到该请求返回 200 状态码，并且 Size 显示为 from disk cache 或者 from memory cache

Expires 是 HTTP/1.0 的产物，Cache-Control 是 HTTP/1.1 的产物。两者同时存在的时候，Cache-Control 优先级高于 Expires。

### Expires

Expires 指缓存过期的时间，超过了这个时间点就代表资源过期。

### Cache-Control

Cache-Control 可以由多个字段组合而成:

#### max-age

max-age 指定一个时间长度，在这个时间段内缓存是有效的，单位是s

#### s-maxage
s-maxage 同 max-age，覆盖 max-age、Expires，但仅适用于共享缓存，在私有缓存中被忽略。

#### public

表明响应可以被任何对象（发送请求的客户端、代理服务器等等）缓存。

#### private
表明响应只能被单个用户（可能是操作系统用户、浏览器用户）缓存，是非共享的，不能被代理服务器缓存。

#### no-cache

强制所有缓存了该响应的用户，在使用已缓存的数据前，发送带验证器的请求到服务器。不是字面意思上的不缓存。

#### no-store
禁止缓存，每次请求都要向服务器重新获取数据。

## 协商缓存

若命中缓存, 返回 304 和 Not Modified

### Last-modified/If-Modified-Since

### Etag/If-None-Match

关于 last-modified 和 Etag 区别，已经有很多人总结过了：

- 某些服务器不能精确得到资源的最后修改时间，这样就无法通过最后修改时间判断资源是否更新。
- Last-modified 只能精确到秒。
- 一些资源的最后修改时间改变了，但是内容没改变，使用 Last-modified 看不出内容没有改变。
- Etag 的精度比 Last-modified 高，属于强验证，要求资源字节级别的一致，优先级高。如果服务器端有提供 ETag 的话，必须先对 ETag 进行 Conditional Request。

## 设置

## 总结

缓存分为 强缓存 和 协商缓存。

强缓存优先于协商缓存进行，若强制缓存生效则直接使用缓存，若不生效则进行协商缓存。

协商缓存由服务器决定是否使用缓存，若协商缓存失效，那么该请求的缓存失效，返回 200，重新返回资源和缓存标识，再存入浏览器中；生效则返回 304，继续使用缓存。

如果强缓存和协商缓存都没有设置，那么浏览器会采用启发式的算法，通常会取响应头中的 Date 减去 Last-Modified 的值的 10% 作为缓存时间。

参考:

- https://zhuanlan.zhihu.com/p/29750583
