import React from 'react';

function TinyMCEEditor({ value, onChange }) {
  return (
    <textarea
      className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your text here..."
    />
  );
}

export default TinyMCEEditor;
