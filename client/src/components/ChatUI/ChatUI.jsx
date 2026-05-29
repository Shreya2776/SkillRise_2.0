import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { useLocation } from "react-router-dom";
import {
  Send,
  User,
  Bot,
  Paperclip,
  X,
  Copy,
  Check,
  MessageSquare,
  Briefcase,
  Code,
  Sparkles,
  FileText,
  ArrowUp,
  Plus,
  History,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

/* ─── Design Tokens (from index.css @theme) ─────────────────────────────────
   bg-base:    #06060a
   bg-surface: #0a0a0f
   bg-card:    #12121a
   border:     white/5–white/10
   accent:     purple-500 (#8b5cf6), indigo-500, violet-400
   text:       white, white/60, white/40, white/20
   font:       Plus Jakarta Sans
──────────────────────────────────────────────────────────────────────────── */

const SUGGESTION_PROMPTS = [
  {
    icon: Code,
    title: "Learning Roadmap",
    text: "Generate a personalized web dev learning path for me.",
  },
  {
    icon: Briefcase,
    title: "Skill Gap Analysis",
    text: "Find gaps between my skills and a Data Analyst role.",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    text: "Suggest common technical questions for a backend role.",
  },
];

const containsSensitiveContent = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) return false;

  const emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
  const sensitiveKeywords =
    /\b(password|pwd|pass|secret|token|credentials|login|username|email)\b/i;
  const credentialPairPattern =
    /(?:email|username|user|password|pass|pwd)\s*[:=]\s*\S+/i;

  return messages.some(({ role, content }) => {
    if (role !== "user" || typeof content !== "string") return false;
    if (emailPattern.test(content)) return true;
    if (sensitiveKeywords.test(content)) return true;
    if (credentialPairPattern.test(content)) return true;
    return false;
  });
};

// ─── <TypingIndicator /> ─────────────────────────────────────────────────────
const TypingIndicator = memo(({ text }) => (
  <div className="flex w-full justify-start">
    <div className="w-8 h-8 shrink-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-purple-400/60 mr-3 mt-0.5">
      <Bot size={15} />
    </div>
    <div className="flex items-center gap-3 px-5 py-3.5 bg-bg-card border border-white/5 rounded-2xl rounded-tl-md">
      {/* 3-dot typing indicator */}
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-[pulse_1.4s_ease-in-out_infinite]" />
        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-[pulse_1.4s_ease-in-out_0.2s_infinite]" />
        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-[pulse_1.4s_ease-in-out_0.4s_infinite]" />
      </div>
      <span className="text-xs text-white/30 font-medium">
        {text || "Thinking..."}
      </span>
    </div>
  </div>
));
TypingIndicator.displayName = "TypingIndicator";

// ─── <CodeBlock /> ───────────────────────────────────────────────────────────
const CodeBlock = memo(({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  if (!inline && match) {
    return (
      <div className="relative my-3 rounded-lg border border-white/6 bg-bg-surface overflow-hidden">
        {/* Header bar with language + copy */}
        <div className="flex items-center justify-between px-4 py-2 bg-white/3 border-b border-white/6">
          <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">
            {match[1]}
          </span>
          <button
            onClick={copyCode}
            className="text-white/30 hover:text-white/70 transition-colors flex items-center gap-1.5 text-[11px] font-medium"
          >
            {copied ? (
              <Check size={13} className="text-emerald-400" />
            ) : (
              <Copy size={13} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            customStyle={{
              padding: "1rem 1.25rem",
              backgroundColor: "transparent",
              margin: 0,
              fontSize: "0.8125rem",
              lineHeight: "1.6",
            }}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  return (
    <code
      className="bg-white/[0.06] text-purple-300 font-mono text-[0.8em] px-1.5 py-0.5 rounded"
      {...props}
    >
      {children}
    </code>
  );
});
CodeBlock.displayName = "CodeBlock";

// ─── <MessageCard /> ─────────────────────────────────────────────────────────
const MessageCard = memo(({ msg }) => {
  const [showCopy, setShowCopy] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copyMessage = useCallback(() => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [msg.content]);

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-[fadeSlideIn_0.12s_ease-out]`}
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => {
        setShowCopy(false);
        setCopied(false);
      }}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-8 h-8 shrink-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-purple-400/60 mr-3 mt-0.5">
          <Bot size={15} />
        </div>
      )}

      <div className="flex flex-col max-w-[80%] md:max-w-[72%] relative group">
        <div
          className={`px-4 py-3.5 ${
            isUser
              ? "bg-bg-card text-white/90 border border-white/6 rounded-2xl rounded-tr-md"
              : "bg-transparent text-white/85 rounded-2xl rounded-tl-md"
          }`}
        >
          {/* Streaming cursor */}
          {msg.content === "" && msg.isStreaming ? (
            <span className="inline-block w-0.75 h-4 bg-purple-400/60 animate-pulse rounded-sm" />
          ) : (
            <div
              className={`
                prose prose-sm max-w-none
                prose-invert
                prose-p:leading-[1.7] prose-p:mb-2 prose-p:text-[0.875rem]
                prose-headings:font-bold prose-headings:text-white/90 prose-headings:tracking-tight
                prose-h1:text-xl prose-h1:mt-5 prose-h1:mb-2
                prose-h2:text-lg prose-h2:mt-5 prose-h2:mb-2
                prose-h3:text-base prose-h3:mt-4 prose-h3:mb-1.5
                prose-h4:text-sm prose-h4:mt-3 prose-h4:mb-1
                prose-strong:text-white prose-strong:font-semibold
                prose-em:text-white/70
                prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-ul:pl-4 prose-ul:my-2 prose-ol:pl-4 prose-ol:my-2
                prose-li:text-[0.875rem] prose-li:leading-[1.7] prose-li:mb-1 prose-li:marker:text-white/20
                prose-blockquote:border-l-2 prose-blockquote:border-purple-500/30 prose-blockquote:pl-4 prose-blockquote:text-white/60 prose-blockquote:italic
                prose-hr:border-white/6
                prose-table:text-sm
                prose-th:text-white/60 prose-th:font-semibold prose-th:border-white/6
                prose-td:border-white/6
                ${isUser ? "prose-p:text-white/90" : ""}
              `}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ code: CodeBlock }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer: timestamp + copy */}
        <div
          className={`flex items-center gap-2 mt-1.5 px-1 ${isUser ? "justify-end" : "justify-start"}`}
        >
          {msg.timestamp && (
            <span className="text-[10px] text-white/20 font-medium">
              {msg.timestamp}
            </span>
          )}
          {/* Copy button — hover only */}
          {showCopy && !isUser && msg.content && (
            <button
              onClick={copyMessage}
              className="text-white/20 hover:text-white/50 transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check size={12} className="text-emerald-400/70" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 shrink-0 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/40 ml-3 mt-0.5">
          <User size={15} />
        </div>
      )}
    </div>
  );
});
MessageCard.displayName = "MessageCard";

// ─── <ChatInput /> ───────────────────────────────────────────────────────────
const ChatInput = memo(
  ({
    input,
    setInput,
    loading,
    selectedFile,
    onSubmit,
    onFileChange,
    onRemoveFile,
    fileInputRef,
    textareaRef,
  }) => {
    const autoResize = useCallback(() => {
      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 160) + "px";
      }
    }, [textareaRef]);

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSubmit(e);
        }
      },
      [onSubmit],
    );

    return (
      <div className="p-4 pb-6 bg-bg-surface shrink-0 border-t border-white/4">
        <div className="max-w-4xl mx-auto relative">
          <form
            onSubmit={onSubmit}
            className="relative z-10 flex flex-col rounded-[24px] bg-bg-card backdrop-blur-3xl border border-white/10 shadow-2xl focus-within:border-violet-500/50 transition-all duration-300 overflow-hidden"
          >
            {/* Dashboard-style File Preview Block */}
            {selectedFile && (
              <div className="flex items-center gap-3 w-full bg-white/2 border-b border-white/5 px-6 py-4 transition-all">
                <div className="w-10 h-10 outline-none rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                  <FileText size={20} strokeWidth={2} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm text-white font-medium truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-white/40 uppercase tracking-widest font-bold">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onRemoveFile}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-end gap-3 px-3 py-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={onFileChange}
                accept=".pdf,.doc,.docx"
              />

              <div className="flex items-center pb-1 pl-1 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group shrink-0"
                  title="Attach Document"
                >
                  <Paperclip
                    size={20}
                    strokeWidth={2}
                    className="group-hover:text-violet-400 transition-colors"
                  />
                </button>
              </div>

              <textarea
                ref={textareaRef}
                value={input}
                rows={1}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResize();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything, format resume, try a module..."
                className="flex-1 max-h-40 min-h-14 bg-transparent border-none text-white text-base font-medium focus:ring-0 focus:outline-none resize-none py-4 px-2 placeholder:text-white/20 leading-relaxed scrollbar-hide"
              />

              <div className="flex items-center pb-1 pr-1 shrink-0">
                <button
                  type="submit"
                  disabled={loading || (!input.trim() && !selectedFile)}
                  className="w-12 h-12 rounded-[1.2rem] bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 disabled:text-white/20 text-white flex items-center justify-center transition-colors active:scale-95 shrink-0 shadow-none hover:shadow-lg hover:shadow-violet-600/20"
                >
                  <ArrowUp size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </form>

          <p className="text-center mt-3 text-[11px] text-white/30 font-medium">
            Target role logic may hallucinate. Verify analysis before submitting
            anywhere.
          </p>
        </div>
      </div>
    );
  },
);
ChatInput.displayName = "ChatInput";

// ─── <ChatUI /> (main) ──────────────────────────────────────────────────────
const ChatUI = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [threadId, setThreadId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [localSessionId, setLocalSessionId] = useState(() =>
    Date.now().toString(),
  );

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("skillrise_chat_history") || "[]",
    );

    const filteredHistory = saved.filter(
      (chat) => !containsSensitiveContent(chat.messages),
    );

    if (filteredHistory.length !== saved.length) {
      localStorage.setItem(
        "skillrise_chat_history",
        JSON.stringify(filteredHistory),
      );
    }

    setChatHistory(filteredHistory);
    const activeId = localStorage.getItem("skillrise_active_thread");
    if (activeId) {
      const activeChat = filteredHistory.find((c) => c.id === activeId);
      if (activeChat) {
        setMessages(activeChat.messages || []);
        setThreadId(activeChat.id.length === 24 ? activeChat.id : null);
        setLocalSessionId(activeChat.id);
      }
    }
  }, []);

  // Sync session ID
  useEffect(() => {
    if (threadId) {
      setLocalSessionId(threadId);
    }
  }, [threadId]);

  // Persist history automatically
  useEffect(() => {
    if (messages.length === 0) return;
    if (messages[messages.length - 1].isStreaming) return; // skip saving partial chunks
    if (containsSensitiveContent(messages)) return;

    setChatHistory((prev) => {
      let newHistory = [...prev];
      const currentId = threadId || localSessionId;
      const existingIdx = newHistory.findIndex(
        (c) => c.id === currentId || c.id === localSessionId,
      );

      const firstUserMsg =
        messages.find((m) => m.role === "user")?.content || "New Chat";
      const title =
        firstUserMsg.slice(0, 25) + (firstUserMsg.length > 25 ? "..." : "");

      const chatObj = {
        id: currentId,
        title,
        messages,
        updatedAt: new Date().toLocaleDateString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      if (existingIdx >= 0) {
        newHistory[existingIdx] = chatObj;
      } else {
        newHistory.unshift(chatObj);
      }

      newHistory = newHistory.slice(0, 5); // Keep last 5
      localStorage.setItem(
        "skillrise_chat_history",
        JSON.stringify(newHistory),
      );
      localStorage.setItem("skillrise_active_thread", chatObj.id);
      return newHistory;
    });
  }, [messages, threadId, localSessionId]);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    setLocalSessionId(Date.now().toString());
    localStorage.removeItem("skillrise_active_thread");
  }, []);

  const loadChat = useCallback(
    (chatId) => {
      const chat = chatHistory.find((c) => c.id === chatId);
      if (chat) {
        setMessages(chat.messages);
        setThreadId(chat.id.length === 24 ? chat.id : null);
        setLocalSessionId(chat.id);
        localStorage.setItem("skillrise_active_thread", chat.id);
      }
    },
    [chatHistory],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-submit initial message passed from Dashboard
  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if (initialMessage && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      setInput(initialMessage);
      // Use a small timeout so state is set before submit fires
      setTimeout(() => {
        // We need to manually trigger the submit logic here
        // since handleSubmit depends on `input` state which won't be updated yet in the same tick
        autoSubmitMessage(initialMessage);
      }, 100);
      // Clean up location state so refreshing doesn't re-send
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleFileChange = useCallback((e) => {
    if (e.target.files.length > 0) setSelectedFile(e.target.files[0]);
  }, []);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const fillPrompt = useCallback((text) => {
    setInput(text);
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (!input.trim() && !selectedFile) return;

      const userMessage = input || "Uploaded my resume";
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userMessage,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setLoading(true);
      setLoadingText("Analyzing request...");

      try {
        const formData = new FormData();
        if (input.trim()) formData.append("message", input.trim());
        if (threadId) formData.append("threadId", threadId);
        formData.append("userId", "local-test-user");
        if (selectedFile) formData.append("resume", selectedFile);
        removeFile();

        const chatbotUrl =
          (import.meta.env.VITE_API_URL || "http://localhost:8000/api") +
          "/chatbot/message";
        const response = await fetch(chatbotUrl, {
          method: "POST",
          body: formData,
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let assistantText = "";
        let buffer = "";

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "",
            isStreaming: true,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            const trimmed = chunk.trim();
            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.replace("data: ", ""));
                if (data.type === "progress") setLoadingText(data.message);
                if (data.type === "complete") {
                  assistantText += data.reply;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: assistantText,
                      isStreaming: false,
                    };
                    return updated;
                  });
                  if (data.threadId) setThreadId(data.threadId);
                }
              } catch (parseErr) {
                console.error("[ChatUI] Parse error:", parseErr);
              }
            }
          }
        }
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.isStreaming) updated.pop();
          updated.push({
            role: "assistant",
            content:
              "Sorry, I couldn't connect to the server. Please try again.",
            isError: true,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
          return updated;
        });
      }
      setLoading(false);
    },
    [input, selectedFile, threadId, removeFile],
  );

  // Auto-submit helper that takes the message directly (used for Dashboard handoff)
  const autoSubmitMessage = useCallback(
    async (messageText) => {
      if (!messageText?.trim()) return;

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: messageText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      setInput("");
      setLoading(true);
      setLoadingText("Analyzing request...");

      try {
        const formData = new FormData();
        formData.append("message", messageText.trim());
        if (threadId) formData.append("threadId", threadId);
        formData.append("userId", "local-test-user");

        const chatbotUrl =
          (import.meta.env.VITE_API_URL || "http://localhost:8000/api") +
          "/chatbot/message";
        const response = await fetch(chatbotUrl, {
          method: "POST",
          body: formData,
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let assistantText = "";
        let buffer = "";

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "",
            isStreaming: true,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            const trimmed = chunk.trim();
            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.replace("data: ", ""));
                if (data.type === "progress") setLoadingText(data.message);
                if (data.type === "complete") {
                  assistantText += data.reply;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: assistantText,
                      isStreaming: false,
                    };
                    return updated;
                  });
                  if (data.threadId) setThreadId(data.threadId);
                }
              } catch (parseErr) {
                console.error("[ChatUI] Parse error:", parseErr);
              }
            }
          }
        }
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.isStreaming) updated.pop();
          updated.push({
            role: "assistant",
            content:
              "Sorry, I couldn't connect to the server. Please try again.",
            isError: true,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
          return updated;
        });
      }
      setLoading(false);
    },
    [threadId],
  );

  return (
    <>
      {/* Scoped animation keyframe */}
      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div className="flex w-full h-[calc(100vh-135px)] gap-4">
        {/* ── Sidebar (Recent Chats) ────────────────────────────────────── */}
        <div className="hidden lg:flex w-65 shrink-0 h-full bg-bg-surface border border-white/6 rounded-[1.5rem] flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/4 bg-bg-surface">
            <div className="flex items-center gap-2 text-white/90">
              <History size={16} className="text-purple-400/70" />
              <h3 className="font-semibold text-[13px] tracking-wide">
                Recent Chats
              </h3>
            </div>
            <button
              onClick={startNewChat}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="New Chat"
            >
              <Plus size={15} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scroll">
            {chatHistory.length === 0 ? (
              <p className="text-[12px] text-white/30 text-center mt-6 font-medium">
                No recent chats
              </p>
            ) : (
              chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex flex-col gap-1 border border-transparent ${
                    (threadId || localSessionId) === chat.id
                      ? "bg-white/6 border-white/5 shadow-sm text-purple-300"
                      : "text-white/50 hover:bg-white/3 hover:text-white/80"
                  }`}
                >
                  <div
                    className={`text-[13px] font-semibold truncate ${
                      (threadId || localSessionId) === chat.id
                        ? "text-purple-300"
                        : "text-white/80"
                    }`}
                  >
                    {chat.title}
                  </div>
                  <div className="text-[10px] text-white/30 tracking-wide">
                    {chat.updatedAt}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Main Chat Area ────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 h-full bg-bg-surface border border-white/6 rounded-[1.5rem] overflow-hidden relative">
          {/* ── Header ────────────────────────────────────────────────────── */}
          <div className="flex justify-between items-center px-6 py-3.5 border-b border-white/4 bg-bg-surface">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-purple-400/60">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-white/90 font-semibold text-[15px] leading-tight tracking-tight">
                  Career Assistant
                </h2>
                <p className="text-[11px] text-white/30 font-medium mt-0.5">
                  AI-powered guidance
                </p>
              </div>
            </div>
            <button
              onClick={startNewChat}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-white/70"
              title="New Chat"
            >
              <Plus size={15} />
            </button>
          </div>

          {/* ── Messages ──────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-5 custom-scroll">
            {/* Empty state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center space-y-6 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/6 flex items-center justify-center text-white/20">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white/90 tracking-tight">
                    How can I help your career?
                  </h3>
                  <p className="text-sm text-white/30 mt-1.5 font-medium">
                    Ask about skills, jobs, roadmaps, or upload your resume.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mt-4">
                  {SUGGESTION_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => fillPrompt(prompt.text)}
                      className="flex flex-col text-left p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 hover:border-white/8 transition-colors gap-2"
                    >
                      <prompt.icon size={16} className="text-purple-400/50" />
                      <span className="text-[13px] font-semibold text-white/70">
                        {prompt.title}
                      </span>
                      <span className="text-[11px] text-white/30 leading-relaxed">
                        {prompt.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg, i) => (
              <MessageCard key={i} msg={msg} />
            ))}

            {/* Typing indicator */}
            {loading && <TypingIndicator text={loadingText} />}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ─────────────────────────────────────────────────────── */}
          <ChatInput
            input={input}
            setInput={setInput}
            loading={loading}
            selectedFile={selectedFile}
            onSubmit={handleSubmit}
            onFileChange={handleFileChange}
            onRemoveFile={removeFile}
            fileInputRef={fileInputRef}
            textareaRef={textareaRef}
          />
        </div>
      </div>
    </>
  );
};

export default ChatUI;
