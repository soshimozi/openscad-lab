// src/components/ScadEditor.tsx

import Editor from "@monaco-editor/react";
import { registerScadLanguage } from "../services/registerScadLanguage";

type ScadEditorProps = {
  value: string;
  onChange: (value: string) => void;
};


export function ScadEditor({ value, onChange }: ScadEditorProps) {
  return (
    <Editor
      height="100%"
      defaultLanguage="scad"
      value={value}
      theme="vs-dark"
      beforeMount={registerScadLanguage}
      onChange={(nextValue) => onChange(nextValue ?? "")}
      options={{
        fontSize: 15,
        minimap: { enabled: true },
        lineNumbers: "off",
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}