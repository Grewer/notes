import React from "react";
import Icon from "antd/es/icon";
import {Button, Checkbox, Input, Tabs} from "antd";
import {debounce} from "lodash";
import {LeftOutlined, RightOutlined} from "@ant-design/icons";


const TabPane = Tabs.TabPane;

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    //$&表示整个被匹配的字符串
}


interface IProps {
    getEditor: () => any;
    closeFindModal: () => void;
}

interface IState {
    indices: { index: number }[];
    currentPosition: number;
    searchKey: string;
    checked: boolean;
}

class FindModal extends React.Component<IProps, IState> {
    private currentIndex: number | null = null;
    private replaceKey: string = '';
    
    state = {
        indices: [] as any[],
        currentPosition: 0,
        searchKey: '',
        checked: false,
    };
    
    onCheck = e => {
        this.setState({
            checked: e.target.checked,
        });
        this.removeStyle();
        this.search();
    };
    
    editorOnChange = (delta, oldDelta, source) => {
        if (source == 'user') {
            this.search();
        }
    };
    
    componentDidMount() {
        const {getEditor} = this.props;
        const quill = getEditor();
        quill && quill.on('text-change', this.editorOnChange);
    }
    
    componentWillUnmount() {
        this.removeStyle();
        const {getEditor} = this.props;
        const quill = getEditor();
        quill && quill.off('text-change', this.editorOnChange);
    }
    
    removeStyle = () => {
        // 删除全部搜索样式
        const {getEditor} = this.props;
        const quill = getEditor();
        if (quill) {
            const length = quill.getText().length;
            quill.formatText(0, length, 'SearchedString', false, 'api');
            quill.formatText(0, length, 'SearchedStringActive', false, 'api');
        }
    };
    
    specialArray: number[] = [];
    
    countSpecial = (index, lastIndex) => {
        const {getEditor} = this.props;
        const quill = getEditor();
        const delta = quill.getContents(); // 此处的获取可优化
        // 获取上一个节点到当前节点的 delta
        const restDelta = delta.slice(lastIndex, index);
        const initValue = this.specialArray.length
            ? this.specialArray[this.specialArray.length - 1]
            : 0;
        const num = restDelta.reduce((num, op) => {
            if (typeof op.insert === 'object') {
                return num + 1;
            }
            return num;
        }, initValue);
        this.specialArray.push(num);
        return index + num;
    };
    
    search: () => void = debounce(() => {
        this.setState({
            indices: [],
        });
        const {searchKey} = this.state;
        this.removeStyle();
        if (!searchKey) {
            return;
        }
        const {getEditor} = this.props;
        const quill = getEditor();
        const totalText = quill.getText();
        const re = new RegExp(escapeRegExp(searchKey), this.state.checked ? 'g' : 'gi');
        const length = searchKey.length;
        let match;
        const indices: {index:number}[] = [];
        this.specialArray = [];
        while ((match = re.exec(totalText)) !== null) {
            // 目标文本在文档中的位置
            let index = match.index;
            // 计算 从最初到 index 有多少个特殊 insert
            index = this.countSpecial(index, indices.length ? indices[indices.length - 1].index : 0);
            
            // 高亮, 第 0 个默认选中
            // console.log({index, length})
            quill.formatText(index, length, 'SearchedString', true, 'api');
            indices.push({index});
        }
        if (indices.length) {
            this.currentIndex = indices[0].index;
            quill.formatText(indices[0].index, length, 'SearchedStringActive', true, 'api');
            this.setState({
                currentPosition: 0,
                indices,
            });
        }
    }, 300);
    
    onChange = ev => {
        const value = ev.target.value;
        
        this.setState({
            searchKey: value,
        });
        this.search();
    };
    
    leftClick = () => {
        const {getEditor} = this.props;
        const {indices, searchKey} = this.state;
        
        const quill = getEditor();
        // 先恢复上一个的样式为 true
        quill.formatText(
            this.currentIndex,
            searchKey.length,
            'SearchedStringActive',
            false,
            'api',
        );
        // 获取上一个
        const last = this.state.currentPosition - 1;
        this.setState({
            currentPosition: last,
        });
        let prevIndex = this.state.indices[last];
        if (!prevIndex) {
            prevIndex = indices[indices.length - 1];
            this.setState({
                currentPosition: indices.length - 1,
            });
        }
        this.currentIndex = prevIndex.index;
        // 下一个的 format
        quill.formatText(
            prevIndex.index,
            searchKey.length,
            'SearchedStringActive',
            true,
            'api',
        );
        this.checkView(prevIndex.index);
    };
    
    rightClick = () => {
        const {getEditor} = this.props;
        const {indices, searchKey} = this.state;
        const quill = getEditor();
        // 先恢复上一个的样式为 true
        quill.formatText(
            this.currentIndex,
            searchKey.length,
            'SearchedStringActive',
            false,
            'api',
        );
        
        const next = this.state.currentPosition + 1;
        this.setState({
            currentPosition: next,
        });
        // 获取下一个, 如果下一个不在, 那就变成第 1 个
        let nextIndex = indices[next];
        if (!nextIndex) {
            nextIndex = indices[0];
            this.setState({
                currentPosition: 0,
            });
        }
        this.currentIndex = nextIndex.index;
        
        // 下一个的 format
        quill.formatText(
            nextIndex.index,
            searchKey.length,
            'SearchedStringActive',
            true,
            'api',
        );
        this.checkView(nextIndex.index);
    };
    
    checkView = index => {
        // 检查选中的目标是否在窗口中, 如果不在则需要滚动
        const {getEditor} = this.props;
        const {searchKey} = this.state;
        const quill = getEditor();
        const scrollingContainer = quill.scrollingContainer;
        const bounds = quill.getBounds(index + searchKey.length, 1);
        // bounds.top + scrollingContainer.scrollTop 等于目标到最顶部的距离
        if (
            bounds.top < 0 ||
            bounds.top > scrollingContainer.scrollTop + scrollingContainer.offsetHeight
        ) {
            scrollingContainer.scrollTop = bounds.top - scrollingContainer.offsetHeight / 3;
        }
    };
    
    replaceOnChange = ev => {
        this.replaceKey = ev.target.value;
    };
    
    replaceAll = () => {
        const {indices, searchKey} = this.state;
        if (!indices.length) return;
        
        const oldStringLen = searchKey.length;
        const newString = this.replaceKey;
        
        const {getEditor} = this.props;
        const quill = getEditor();
        let length = indices.length;
        // 遍历 indices 尾部替换
        while (length--) {
            // 先删除再添加
            quill.deleteText(indices[length].index, oldStringLen, 'user');
            quill.insertText(indices[length].index, newString, 'user');
        }
        // 结束后重新搜索
        this.search();
    };
    
    replace = () => {
        const {indices, searchKey} = this.state;
        if (!indices.length) return;
        const {getEditor} = this.props;
        const quill = getEditor();
        // 删除, 添加
        quill.deleteText(this.currentIndex, searchKey.length, 'user');
        quill.insertText(this.currentIndex, this.replaceKey, 'user');
        this.search();
    };
    
    renderSearch = () => {
        const {currentPosition, indices, searchKey, checked} = this.state;
        return (
            <>
                <div className={'find-input-box'}>
                    <label>{'查找'}</label>
                    <Input
                        onChange={this.onChange}
                        value={searchKey}
                        suffix={
                            indices.length ? (
                                <span className={'search-range'}>
                                    <LeftOutlined onClick={this.leftClick} />
                                    {currentPosition + 1} / {indices.length}
                                    <RightOutlined onClick={this.rightClick} />
                                </span>
                            ) : null
                        }
                    />
                </div>
                <Checkbox checked={checked} onChange={this.onCheck}>
                    {'大小写敏感'}
                </Checkbox>
            </>
        );
    };
    
    render() {
        const {indices} = this.state;
        return (
            <div className={'find-modal'}>
                <span className={'close'} onClick={this.props.closeFindModal}>x</span>
                <Tabs defaultActiveKey="1" size={'small'}>
                    <TabPane tab={'查找'} key="1">
                        {this.renderSearch()}
                    </TabPane>
                    <TabPane tab={'替换'} key="2">
                        {this.renderSearch()}
                        <div className={'find-input-box replace-input'}>
                            <label>{'替换'}</label>
                            <Input onChange={this.replaceOnChange}/>
                        </div>
                        <div className={'replace-buttons'}>
                            <Button disabled={!indices.length} size={'small'} onClick={this.replaceAll}>
                                {'全部替换'}
                            </Button>
                            <Button
                                disabled={!indices.length}
                                size={'small'}
                                type={'primary'}
                                onClick={this.replace}
                            >
                                {'替换'}
                            </Button>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default FindModal