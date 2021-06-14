const nodes = {
    value: 6,
    left: {
        value: 3,
        left: {
            value: 1,
            left: {
                value: 0
            },
            right: {
                value: 2
            }
        },
        right: {
            value: 5
        }
    },
    right: {
        value: 8,
        right: {
            value: 9
        }
    }
}

const DeleteBST = (root, value) => {
    if (!root) {
        return false
    }
    if (root.value === value) {
        return DELETE(root)
    }
    if (root.value > value) {
        return DeleteBST(root.left, value, root, 'left')
    }
    return DeleteBST(root.right, value, root, 'left')
}

const DELETE = (root, parent, key) => {
    // 在这里实现三种情况
    // 情况 1 没有左右子节点 可直接删除
    if (!root.left && !root.right) {
        parent[key] = null
        return true
    }

    // 情况 2 只有一个子节点 重新连接即可
    if (!root.right) {
        const q = root.left
        root.value = q.value
        root.left = q.left
        root.right = q.right
        return true
    }
    if (!root.left) {
        const p = root.right
        root.value = p.value
        root.left = p.left
        root.right = p.right
        return true
    }

    // 情况 3
    // 删除节点后，为了维持二叉搜索树的结构特性，需要从其左子树中选出一个最大值的节点，“上移”到删除的节点位置上
    let temp = root
    let l = root.left
    while (l.right) {
        temp = l
        l = l.right
    }
    root.value = l.value
    console.log(root, temp, l)
    if (root !== temp) {
        temp.right = l.left
    } else {
        temp.left = l.left
    }
    return true
}

DeleteBST(nodes, 3)

console.log(nodes)
