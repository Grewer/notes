import {Quill} from 'react-quill';

let Inline = Quill.import('blots/inline');

class SearchedStringBlot extends Inline {
    static blotName: string;
    static className: string;
    static tagName: string;
}


SearchedStringBlot.blotName = 'SearchedString';
SearchedStringBlot.className = 'ql-searched-string';
SearchedStringBlot.tagName = 'div';

export default SearchedStringBlot;
