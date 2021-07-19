// 基本思路：
//
// 1.依次比较相邻的两个数，如果第一个比第二个小，不变。如果第一个比第二个大，调换顺序。一轮下来，最后一个是最大的数
// 2.对除了最后一个之外的数重复第一步，直到只剩一个数


function bubbleSort(array) {
    let len = array.length

    for (let i = 0; i < len - 1; i++) {
        for (let j = 0; j < len - i - 1; j++) {
            if (array[j] > array[j + 1]) {
                swap(array, j, j + 1)
            }
        }

    }

}

function swap(arr, i, j) {
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
}

let arr = [3, 44, 38, 5, 47, 15, 36, 26]

bubbleSort(arr)
console.log(arr)


// 时间复杂度：
// 最优情况：n(n-1)/2,即O(n^2)
// 最复杂情况：3n(n-1)/2(3即交换元素),即O(n^2)
// 平均时间复杂度为：O(n^2)
// 空间复杂度：
// 最优情况：0
// 最多情况：O(n);
// 平均复杂度为：O(1)
