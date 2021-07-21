// 分而治之

// 1.不断将数组对半分，直到每个数组只有一个
// 2.将分出来的部分重新合并
// 3.合并的时候按顺序排列

// 知识点: arr.slice([begin[, end]])  返回值 提取的新数组

function mergeSort(array) {
    if (array.length < 2) {
        return array
    }

    let mid = Math.floor(array.length / 2),
        left = array.slice(0, mid),
        right = array.slice(mid)

    return merge(mergeSort(left), mergeSort(right))
}

function merge(left, right) {
    let result = [],
        l = 0,
        r = 0
    while (l < left.length && r < right.length) {
        if (left[l] < right[r]) {
            result.push(left[l++])
        } else {
            result.push(right[r++])
        }
    }

    // 循环结束后必然会有多出来的值

    // 通过这里的 slice 剥取剩余的值
    // console.log(result, left, right)
    return result.concat(left.slice(l)).concat(right.slice(r));

    // 也可以尝试 使用 left.shift() 这个方案
}



let arr = [3, 44, 38, 5, 47, 15, 36, 26]

const res = mergeSort(arr)

console.log(res)

// 和选择排序一样，归并排序的性能不受输入数据的影响，但表现比选择排序好的多，因为始终都是O(n log n）的时间复杂度。代价是需要额外的内存空间。

// 最佳情况：T(n) = O(n)

// 最差情况：T(n) = O(nlogn)

// 平均情况：T(n) = O(nlogn)

