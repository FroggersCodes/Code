"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";

const CodeMirrorEditor = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ value, language, onChange, readOnly }: CodeEditorProps) {
  const [extensions, setExtensions] = useState<any[]>([]);

  const loadExtensions = useCallback(async () => {
    const exts = [];
    if (language === "javascript") {
      const { javascript } = await import("@codemirror/lang-javascript");
      exts.push(javascript());
    } else if (language === "python") {
      const { python } = await import("@codemirror/lang-python");
      exts.push(python());
    }
    setExtensions(exts);
  }, [language]);

  useState(() => {
    loadExtensions();
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-xs text-[var(--accent-red)] tracking-wider">
          {language === "javascript" ? "// JAVASCRIPT" : "# PYTHON"}
        </span>
        {readOnly && (
          <span className="text-xs text-[var(--text-muted)]">LOCKED</span>
        )}
      </div>
      <CodeMirrorEditor
        value={value}
        height="300px"
        theme="dark"
        extensions={extensions}
        onChange={onChange}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
          autocompletion: false,
        }}
      />
    </div>
  );
}
