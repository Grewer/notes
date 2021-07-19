//基本思路：
//
// 1.找出最小的数，和第一个交换位置
// 2.在剩下的数中，找出最二小的数，放在第二个
// 3.依次类推，排出顺序

// 表现最稳定的排序算法之一(这个稳定不是指算法层面上的稳定哈，相信聪明的你能明白我说的意思2333)，因为无论什么数据进去都是O(n²)的时间复杂度…..所以用到它的时候，数据规模越小越好。唯一的好处可能就是不占用额外的内存空间了吧。理论上讲，选择排序可能也是平时排序一般人想到的最多的排序方法了吧。

function selectionSort(array) {
    let len = array.length

    for (let i = 0; i < len; i++) {

        // 假设当前是最小值
        let min = i

        // 和后面的数比较
        for (let j = i + 1; j < len; j++) {
            if (array[j] < array[min]) {
                min = j
            }
        }

        if (i !== min) {
            swap(array, i, min)
        }

    }

}


function swap(arr, i, j) {
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
}

let arr = [3, 44, 38, 5, 47, 15, 36, 26]

selectionSort(arr)
console.log(arr)


// 时间复杂度：O(n^2)
// 空间复杂度：O(1)
