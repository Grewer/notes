const fs = require('fs');
const path = require('path')

function getStatus(fullPath) {
    const stat = fs.statSync(fullPath);
    
    return {
        isDirectory: stat.isDirectory()
    }
}

const ignoreDir = ['bin', 'build', 'src', 'images', 'static', 'reactDemo', 'examples', 'demo']


function readFileList(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach((item, index) => {
        const fullPath = path.join(dir, item);
        const stat = getStatus(fullPath);
        if (stat.isDirectory) {
            if(ignoreDir.includes(item) || item.startsWith('.')){
                return
            }
            const obj = {name: item, children: []}
            readFileList(fullPath, obj.children); //递归读取文件
            filesList.push(obj);
        } else {
            if (item === "README.md") {
                return
            }
            if (item.endsWith('.md')) {
                filesList.push({name: item.slice(0, -3)});
            }
        }
    });
    return filesList;
}

const filesLists = [];

readFileList(__dirname, filesLists);

// console.log(JSON.stringify(filesList, null, '\t'));


const transform = (fileList, gap = 0) => {
    return fileList.map(file => {
        let child
        if (file.children) {
            child = transform(file.children, gap + 1)
        }
        if (gap === 0) {
            return `- ${file.name}\n
    <details>
      <summary>点我展开</summary>

${`    `.repeat(gap) + `${child || ''}`}
    </details>
            `
        }
        return `    `.repeat(gap) + `- ${file.name}\n${child || ''}`
    }).join('\n')
}


const mdFiles = transform(filesLists)

const nowMD = fs.readFileSync('./README.md', 'utf-8')

// console.log(nowMD)

const result = nowMD.replace(/(目录)([\s\S]*?)(#)/, `$1\n${mdFiles}\n$3`)

// console.log(result)

fs.writeFileSync('./README.md', result, 'utf-8')
