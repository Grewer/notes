网格布局（Grid）是最强大的 CSS 布局方案。

## 特点:

它将网页划分成一个个网格，可以任意组合不同的网格，做出各种各样的布局。以前，只能通过复杂的 CSS 框架达到的效果，现在浏览器内置了。

![](./images/gridIntro.png)

Flex 布局是轴线布局，只能指定"项目"针对轴线的位置，可以看作是一维布局。Grid 布局则是将容器划分成"行"和"列"，产生单元格，然后指定"项目所在"的单元格，可以看作是二维布局。Grid 布局远比 Flex 布局强大。



> 注意，设为网格布局以后，容器子元素（项目）的float、display: inline-block、display: table-cell、vertical-align和column-*等设置都将失效。
>
>

## display

display 可以使用 : `display: inline-grid;` 和 `display: grid`

就是行内元素和块元素的区别

## grid-template-columns 属性，grid-template-rows 属性

在容器上定义属性:

```css
.container {
    display: grid;
    grid-template-columns: 100px 100px 100px;
    grid-template-rows: 100px 100px 100px;
}
```

上面两个属性的意思是: 定义一个三行三列的网格，列宽和行高都是100px

> 不一定是固定长度, 也可以是百分比: `grid-template-columns: 33.33% 33.33% 33.33%;`

### repeat
重复写同样的值非常麻烦，尤其网格很多时。这时，可以使用repeat()函数，简化重复的值。上面的代码用repeat()改写如下。

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 33.33%);
  grid-template-rows: repeat(3, 33.33%);
}
```
repeat()接受两个参数，第一个参数是重复的次数（上例是3），第二个参数是所要重复的值。


repeat()重复某种模式也是可以的:

```css
grid-template-columns: repeat(2, 100px 20px 80px);
```


### auto-fill


有时，单元格的大小是固定的，但是容器的大小不确定。如果希望每一行（或每一列）容纳尽可能多的单元格，这时可以使用auto-fill关键字表示自动填充

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, 100px);
}
```
上面代码表示每列宽度100px，然后自动填充，直到容器不能放置更多的列。

### fr 关键字


为了方便表示比例关系，网格布局提供了fr关键字（fraction 的缩写，意为"片段"）。如果两列的宽度分别为1fr和2fr，就表示后者是前者的两倍。 类似于 flex 的 `flex-grow`

```css

.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
```

fr可以与绝对长度的单位结合使用，这时会非常方便:

```css
.container {
  display: grid;
  grid-template-columns: 150px 1fr 2fr;
}
```


### minmax


minmax()函数产生一个长度范围，表示长度就在这个范围之中。它接受两个参数，分别为最小值和最大值。

```css
grid-template-columns: 1fr 1fr minmax(100px, 1fr);
```

上面代码中，minmax(100px, 1fr)表示列宽不小于100px，不大于1fr。

### auto

```css
grid-template-columns: 100px auto 100px;
```
上面代码中，第二列的宽度，基本上等于该列单元格的最大宽度，除非单元格内容设置了min-width，且这个值大于最大宽度。


### 网格线的名称

grid-template-columns属性和grid-template-rows属性里面，还可以使用方括号，指定每一根网格线的名字，方便以后的引用。


```css

.container {
  display: grid;
  grid-template-columns: [c1] 100px [c2] 100px [c3] auto [c4];
  grid-template-rows: [r1] 100px [r2] 100px [r3] auto [r4];
}
```

`grid-template-columns`属性对于网页布局非常有用。两栏式布局只需要一行代码。

 ```css

 .wrapper {
   display: grid;
   grid-template-columns: 70% 30%;
 }

 ```

上面代码将左边栏设为70%，右边栏设为30%。


## grid-row-gap 属性，grid-column-gap 属性，grid-gap 属性

grid-row-gap属性设置行与行的间隔（行间距），grid-column-gap属性设置列与列的间隔（列间距）。

```css
.container {
  grid-row-gap: 20px;
  grid-column-gap: 20px;
}
```

参考:

- https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html
