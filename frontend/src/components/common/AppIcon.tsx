import type { SVGProps } from "react";

type IconName =
  | "chevron-down"
  | "chevron-right"
  | "upload"
  | "trash"
  | "folder"
  | "file"
  | "robot"
  | "history"
  | "plus"
  | "plus-circle"
  | "layers"
  | "message"
  | "dashboard"
  | "settings"
  | "paperclip"
  | "image"
  | "send";

type AppIconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

function renderIcon(name: IconName) {
  switch (name) {
    case "chevron-down":
      return <path d="m6 9 6 6 6-6" />;
    case "chevron-right":
      return <path d="m9 6 6 6-6 6" />;
    case "upload":
      return (
        <>
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M5 20h14" />
        </>
      );
    case "trash":
      return (
        <>
          <path d="M4 7h16" />
          <path d="m9 7 1-2h4l1 2" />
          <path d="M7 7v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </>
      );
    case "folder":
      return (
        <>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
        </>
      );
    case "file":
      return (
        <>
          <path d="M8 3.5h6l4 4V20a1 1 0 0 1-1 1H8a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
          <path d="M14 3.5V8h4" />
        </>
      );
    case "robot":
      return (
        <>
          <path d="M12 3v3" />
          <rect x="5" y="8" width="14" height="10" rx="3" />
          <path d="M8 18v3" />
          <path d="M16 18v3" />
          <path d="M8 12h.01" />
          <path d="M16 12h.01" />
          <path d="M9.5 15h5" />
        </>
      );
    case "history":
      return (
        <>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 8v5l3 2" />
        </>
      );
    case "plus":
      return (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      );
    case "plus-circle":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </>
      );
    case "layers":
      return (
        <>
          <path d="m12 4 8 4-8 4-8-4 8-4Z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 16 8 4 8-4" />
        </>
      );
    case "message":
      return (
        <>
          <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4H7.5A2.5 2.5 0 0 1 5 12.5z" />
        </>
      );
    case "dashboard":
      return (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="5" rx="1.5" />
          <rect x="13" y="11" width="7" height="9" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
        </>
      );
    case "settings":
      return (
        <>
          <circle cx="12" cy="12" r="3.25" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1 .2l-.2.1a2 2 0 1 1-2.8-2.8l.2-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1l-.1-.2a2 2 0 1 1 2.8-2.8l.1.2a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1-.2l.2-.1a2 2 0 0 1 2.8 2.8l-.2.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.7Z" />
        </>
      );
    case "paperclip":
      return <path d="m10.5 13.5 4.8-4.8a3 3 0 1 0-4.2-4.2l-6 6a4.5 4.5 0 0 0 6.4 6.4l6.2-6.2" />;
    case "image":
      return (
        <>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m20 16-4.5-4.5L8 19" />
        </>
      );
    case "send":
      return (
        <>
          <path d="M4 20 20 12 4 4l3.5 8L4 20Z" />
          <path d="M7.5 12H20" />
        </>
      );
  }
}

export function AppIcon({ name, className, ...props }: AppIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={["app-icon", className].filter(Boolean).join(" ")}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      {renderIcon(name)}
    </svg>
  );
}
