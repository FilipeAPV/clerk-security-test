"use client";

import React, { useEffect, useRef } from "react";
import type { OutputData } from "@editorjs/editorjs";

const MyEditor: React.FC = () => {
  const editorRef = useRef<any>(null);
  const editorHolderRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;

    const initializeEditor = async () => {
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const List = (await import("@editorjs/list")).default;
      const CodeTool = (await import("@editorjs/code")).default;
      const Quote = (await import("@editorjs/quote")).default;
      const ImageTool = (await import("@editorjs/image")).default;
      const LinkTool = (await import("@editorjs/link")).default;

      if (!editorHolderRef.current) return;

      editorRef.current = new EditorJS({
        holder: editorHolderRef.current,
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              levels: [1, 2, 3],
              defaultLevel: 1,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          code: {
            class: CodeTool,
            inlineToolbar: false,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: "Enter a quote",
              captionPlaceholder: "Quote's author",
            },
          },
          image: {
            class: ImageTool,
            inlineToolbar: true,
            config: {
              endpoints: {
                byFile: "/api/uploadFile", // Your backend file uploader endpoint
                byUrl: "/api/fetchUrl", // Your endpoint that provides uploading by URL
              },
              additionalRequestHeaders: {
                // Optional headers for authentication
                // 'Authorization': 'Bearer <token>',
              },
            },
          },
          linkTool: {
            class: LinkTool,
            inlineToolbar: true,
            config: {
              endpoint: "/api/fetchUrl", // Your backend endpoint for link metadata
            },
          },
        },
        placeholder: "Start typing your content...",
        inlineToolbar: true,
        autofocus: true,
      });
    };

    initializeEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const handleSave = async () => {
    if (editorRef.current) {
      try {
        const savedData: OutputData = await editorRef.current.save();
        console.log("Saved data: ", savedData);
        // Handle saving data to backend
      } catch (error) {
        console.error("Saving failed: ", error);
      }
    }
  };

  return (
    <div>
      <div id="editorjs" ref={editorHolderRef} />
      <button onClick={handleSave}>Save Content</button>
    </div>
  );
};

export default MyEditor;
