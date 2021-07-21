// 1.把数组分为[已排序]和[未排序]两部分,第一个数为[已排序]，其余为[未排序]
// 2.从[未排序]抽出第一个数，和[已排序]部分比较，插入到合适的位置


function insertSort(array) {
    let len = array.length

    for (let i = 0; i < len; i++) {
        // 当前值
        let value = array[i]

        // 和左边所有的比较
        let j = i - 1;

        while (j >= 0 && array[j] > value) {

            // 将该元素移到下一位置；
            array[j + 1] = array[j];
            j--;

        }

        // console.log({val: array[j + 1], value, j, array})

        // 插入
        array[j + 1] = value
    }

    return array
}


let arr = [3, 44, 38, 5, 47, 15, 36, 26]

insertSort(arr)
console.log(arr)

// 3 38 44 5 47 ...

// 时间复杂度：比较次数：(1+2+…+n-2+n-1)=n(n-1)/2,即O(n^2)
// 空间复杂度：O(1)
