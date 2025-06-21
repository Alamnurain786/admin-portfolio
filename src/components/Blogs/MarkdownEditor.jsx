import React, { useState } from 'react';
import { marked } from 'marked';

const MarkdownEditor = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState('write');

  const renderHTML = () => {
    try {
      // Configure marked to add breaks on newlines, which is more intuitive for users.
      return { __html: marked.parse(value, { breaks: true }) };
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return { __html: '<p>Error rendering markdown</p>' };
    }
  };

  const insertMarkdown = (type) => {
    const textarea = document.getElementById('markdown-editor');
    if (!textarea) return;

    let insertText = '';
    let selectionStart = textarea.selectionStart;
    let selectionEnd = textarea.selectionEnd;
    const selectedText = value.substring(selectionStart, selectionEnd);

    switch (type) {
      case 'bold':
        insertText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        insertText = `*${selectedText || 'italic text'}*`;
        break;
      case 'strikethrough': // New styling option
        insertText = `~~${selectedText || 'strikethrough'}~~`;
        break;
      case 'h1': // New heading level
        insertText = `# ${selectedText || 'Heading 1'}`;
        break;
      case 'h2': // New heading level
        insertText = `## ${selectedText || 'Heading 2'}`;
        break;
      case 'h3': // New heading level
        insertText = `### ${selectedText || 'Heading 3'}`;
        break;
      case 'link':
        insertText = `[${selectedText || 'link text'}](url)`;
        break;
      case 'image':
        insertText = `![${selectedText || 'alt text'}](image-url)`;
        break;
      case 'code':
        insertText = `\`${selectedText || 'code'}\``;
        break;
      case 'codeblock':
        insertText = `\`\`\`\n${selectedText || 'code block'}\n\`\`\``;
        break;
      case 'quote':
        insertText = `> ${selectedText || 'Blockquote'}`;
        break;
      case 'list':
        insertText = `- ${selectedText || 'List item'}\n- Another item`;
        break;
      case 'hr': // New horizontal rule
        insertText = `\n\n---\n\n`;
        break;
      default:
        insertText = selectedText;
    }

    const newValue =
      value.substring(0, selectionStart) +
      insertText +
      value.substring(selectionEnd);
    onChange(newValue);

    // Set focus back to textarea and place cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectionStart + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Helper component for toolbar buttons to reduce repetition
  const ToolbarButton = ({ onClick, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
      title={title}
    >
      {children}
    </button>
  );

  const ToolbarSeparator = () => (
    <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
  );

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
        {/* --- Text Styling Group --- */}
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => insertMarkdown('bold')} title="Bold">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 4a1 1 0 011-1h6.5a3.5 3.5 0 013.5 3.5V15a1 1 0 01-1 1H11v-2h2.5a1.5 1.5 0 001.5-1.5V6.5A1.5 1.5 0 0011.5 5H6v2h4v2H6v2h4v2H5a1 1 0 01-1-1V4z"
                clipRule="evenodd"
              />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => insertMarkdown('italic')}
            title="Italic"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.75 4a.75.75 0 000 1.5h.255l-3.4 8.5H4a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-.255l3.4-8.5H16a.75.75 0 000-1.5H7.75z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => insertMarkdown('strikethrough')}
            title="Strikethrough"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M13.28 3.22a.75.75 0 00-1.06 0l-7.5 7.5a.75.75 0 001.06 1.06l7.5-7.5a.75.75 0 000-1.06z"
                clipRule="evenodd"
              />
              <path d="M4.5 12.5a.5.5 0 000 1h11a.5.5 0 000-1h-11z" />
            </svg>
          </ToolbarButton>
        </div>
        <ToolbarSeparator />
        {/* --- Heading Group --- */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <ToolbarButton onClick={() => insertMarkdown('h1')} title="Heading 1">
            H1
          </ToolbarButton>
          <ToolbarButton onClick={() => insertMarkdown('h2')} title="Heading 2">
            H2
          </ToolbarButton>
          <ToolbarButton onClick={() => insertMarkdown('h3')} title="Heading 3">
            H3
          </ToolbarButton>
        </div>
        <ToolbarSeparator />
        {/* --- Block Elements Group --- */}
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => insertMarkdown('list')} title="List">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 9.75A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zM2 14.75a.75.75 0 012.75-1.5h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => insertMarkdown('quote')} title="Quote">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11.25 3.25a.75.75 0 00-1.5 0v1.5h-1.5a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5h-1.5v-1.5z" />
              <path
                fillRule="evenodd"
                d="M3.25 3A2.25 2.25 0 001 5.25v9.5A2.25 2.25 0 003.25 17h13.5A2.25 2.25 0 0019 14.75v-9.5A2.25 2.25 0 0016.75 3H3.25zM2.5 5.25a.75.75 0 01.75-.75h13.5a.75.75 0 01.75.75v9.5a.75.75 0 01-.75.75H3.25a.75.75 0 01-.75-.75v-9.5z"
                clipRule="evenodd"
              />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => insertMarkdown('hr')}
            title="Horizontal Rule"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 10a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 10z" />
            </svg>
          </ToolbarButton>
        </div>
        <ToolbarSeparator />
        {/* --- Code Group --- */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => insertMarkdown('code')}
            title="Inline Code"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M6.78 5.22a.75.75 0 010 1.06L4.56 8.5l2.22 2.22a.75.75 0 11-1.06 1.06l-2.75-2.75a.75.75 0 010-1.06l2.75-2.75a.75.75 0 011.06 0zm6.44 0a.75.75 0 011.06 0l2.75 2.75a.75.75 0 010 1.06l-2.75 2.75a.75.75 0 11-1.06-1.06L15.44 8.5l-2.22-2.22a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => insertMarkdown('codeblock')}
            title="Code Block"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M2 5.25A3.25 3.25 0 015.25 2h9.5A3.25 3.25 0 0118 5.25v9.5A3.25 3.25 0 0114.75 18h-9.5A3.25 3.25 0 012 14.75v-9.5zm1.5.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-8.5a.75.75 0 00-.75-.75h-8.5a.75.75 0 00-.75.75z"
                clipRule="evenodd"
              />
            </svg>
          </ToolbarButton>
        </div>
        <ToolbarSeparator />
        {/* --- Link/Image Group --- */}
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => insertMarkdown('link')} title="Link">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.665l3-3z" />
              <path d="M8.603 16.117a4 4 0 005.656-5.656l-3-3a4 4 0 00-5.865-.225.75.75 0 00.977 1.138 2.5 2.5 0 013.665.142l3 3a2.5 2.5 0 01-3.536 3.536l-1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => insertMarkdown('image')} title="Image">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 0v7.58l3.22-3.22a.75.75 0 011.06 0l3.5 3.5a.75.75 0 01-1.06 1.06l-2.97-2.97-3.72 3.72a.75.75 0 01-1.06 0L2.5 9.81V5.25zM16.75 5.5a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                clipRule="evenodd"
              />
            </svg>
          </ToolbarButton>
        </div>

        {/* --- Write/Preview Tabs --- */}
        <div className="ml-auto flex">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1 text-sm ${activeTab === 'write' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'} rounded-l-md`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 text-sm ${activeTab === 'preview' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'} rounded-r-md`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative">
        {activeTab === 'write' ? (
          <textarea
            id="markdown-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 min-h-[300px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none resize-y"
            placeholder="Write your content here using Markdown..."
          />
        ) : (
          <div
            className="w-full px-4 py-3 min-h-[300px] prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white overflow-auto"
            dangerouslySetInnerHTML={renderHTML()}
          />
        )}
      </div>

      {/* Character Count */}
      <div className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border-t border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 text-right">
        {value.length} characters
      </div>
    </div>
  );
};

export default MarkdownEditor;
