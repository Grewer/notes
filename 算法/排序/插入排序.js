// 1.把数组分为[已排序]和[未排序]两部分,第一个数为[已排序]，其余为[未排序]
// 2.从[未排序]抽出第一个数，和[已排序]部分比较，插入到合适的位置


function insertSort(array) {
    let len = array.length

    for (let i = 0; i < len; i++) {
        // 当前值
        let value = array[i]

        let j = 0
        // 和左边所有的比较
        for (j = i - 1; j > -1 && array[j] > value; j--) {
            //     console.log({j, jvalue: array[j], value})
            array[j + 1] = array[j]
        }

        console.log({j, val: array[j + 1], value, vali: array[i]})

        array[j + 1] = value
    }

    return array
}


let arr = [3, 44, 38, 5, 47, 15, 36, 26]

insertSort(arr)
console.log(arr)
