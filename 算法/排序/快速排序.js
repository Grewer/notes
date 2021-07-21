// 1.以一个数为基准(中间的数)，比基准小的放到左边，比基准大的放到右边
// 2.再按此方法对这两部分数据分别进行快速排序（递归进行）
// 3.不能再分后退出递归，并重新将数组合并


function quickSort(array) {
    if (array.length < 2) {
        return array
    }

    let mid = Math.floor(array.length / 2)
    let pivot = array.splice(mid, 1)[0];

    let left = [], right = []

    for (let i = 0; i < array.length; i++) {
        if (array[i] > pivot) {
            right.push(array[i])
        } else {
            left.push(array[i])
        }
    }

    return quickSort(left).concat([pivot], quickSort(right))

}


let arr = [3, 44, 38, 5, 47, 15, 36, 26]

const res = quickSort(arr)
console.log(res)


// 最佳情况：T(n) = O(nlogn)

// 最差情况：T(n) = O(n2)

// 平均情况：T(n) = O(nlogn)

