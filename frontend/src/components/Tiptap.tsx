import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Highlight from '@tiptap/extension-highlight'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { debounce } from 'lodash';

import Alert from '@material-ui/lab/Alert';

const Tiptap = ({ content, highlight, onChange, isSaved }: { content: string, highlight: string, onChange: (modifiedAnswer: string) => void, isSaved: boolean }) => {
  const debouncedOnChange = debounce(onChange, 1000);
  const editor = useEditor({
        extensions: [Document, Paragraph, Text, Highlight.configure({ multicolor: true })],
        content: content,
        onUpdate: ({ editor }) => {     
          debouncedOnChange(editor.getText())
        },
    })

  const highlightRef = useRef(highlight);
  const [isContentSaved, setIsContentSaved] = useState(isSaved);

  useEffect(() => {
    setIsContentSaved(isSaved);
  }, [isSaved]);

  useEffect(() => {
    if (editor && highlight !== highlightRef.current) {

      if (highlight != '') {
        editor.chain().setTextSelection({ from: 0, to: editor.getText().length }).unsetHighlight().run();
      }

      const highlightIndex = editor.getText().indexOf(highlight);
  
      if (highlightIndex !== -1) {
        editor.chain().setTextSelection({ from: highlightIndex, to: highlightIndex + highlight.length }).toggleHighlight({ color: '#b197fc' }).run();
      }

      highlightRef.current = highlight;
    }
  }, [editor, highlight]);

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null
  }

  return (
    <div >
      <EditorContent editor={editor} style={{minHeight: '10em', border: '1px solid #ccc', borderRadius: '5px'}}/>
      {!isContentSaved && <Alert severity="warning">Unsaved changes</Alert>}
    </div>
  )
}

export default Tiptap